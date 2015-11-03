jQuery(function ($) {
	var
		$input = $("#input-hex"),
		$output = $("#output-bytes"),
		$annotation = $("#annotation"),
		reader;

	function processInput(input) {
		var
			bytes = shared.toByteString(input).map(shared.toByte),
			buf = Uint8ClampedArray.from(bytes),
			out_buf = [],
			tmp,
			wbits, windowSize, isLast, isLastEmpty, fillBits0, mNibbles,
			mNibblesIsZero, reservedBit0, mSkipBytes, mSkipLen, metadata,
			fillBits1, mLen, isUncompressed, fillBits2, uncompressedLiterals,
			nBlTypesL,
			endOfStream;

		function write_out(bytes) {
			Array.prototype.push.apply(out_buf, bytes);

			$output.html(out_buf.map(function (b) { return "<span>" + b.toString(16) + "</span>"; }).join(""));
		}

		reader = new shared.BitReader(buf);

		wbits = {
			"$el": $annotation.find("#wbits").clone().appendTo($annotation),
			"bitIndex": {
				"from": reader.globalBitIndex()
			},
			"error": false,
			"result": shared.PrefixCode.wbits.lookup(reader)
		};

		if (typeof wbits.result !== "string") {
			wbits.bitIndex.to = reader.globalBitIndex();
		} else {
			wbits.error = true;
		}

		wbits.$el.trigger("annotation/requested", wbits);

		if (wbits.error) {
			return;
		}

		windowSize = {
			"$el": $annotation.find("#window-size").clone().appendTo($annotation),
			"bitIndex": wbits.bitIndex,
			"error": wbits.error,
		};

		if (!windowSize.error) {
			windowSize.result = (1 << wbits.result) - 16;
		}

		windowSize.$el.trigger("annotation/requested", windowSize);

		if (windowSize.error) {
			return;
		}

		do {
			isLast = {
				"$el": $annotation.find("#islast").clone().appendTo($annotation),
				"bitIndex": {
					"from": reader.globalBitIndex()
				},
				"error": false,
				"result": reader.readBit()
			};

			if (typeof isLast.result !== "string") {
				isLast.bitIndex.to = reader.globalBitIndex();
			} else {
				isLast.error = true;
			}

			isLast.$el.trigger("annotation/requested", isLast);

			if (isLast.error) {
				return;
			}

			if (isLast.result === 1) {
				isLastEmpty = {
					"$el": $annotation.find("#islastempty").clone().appendTo($annotation),
					"bitIndex": {
						"from": reader.globalBitIndex()
					},
					"error": false,
					"result": reader.readBit()
				};

				if (typeof isLastEmpty.result !== "string") {
					isLastEmpty.bitIndex.to = reader.globalBitIndex();
				} else {
					isLastEmpty.error = true;
				}

				isLastEmpty.$el.trigger("annotation/requested", isLastEmpty);

				if (isLastEmpty.error) {
					return;
				}

				if (isLastEmpty.result === 1) {
					fillBits0 = {
						"$el": $annotation.find("#fillbits-0").clone().appendTo($annotation),
						"bitIndex": {
							"from": reader.globalBitIndex()
						},
						"error": false,
						"result": reader.readFillBits()
					};

					if (typeof fillBits0.result !== "string") {
						fillBits0.bitIndex.to = reader.globalBitIndex();
						if (fillBits0.result > 0) {
							fillBits0.error = true;
							fillBits0.result = "Non-zero fill bits";
						}
					} else {
						fillBits0.error = true;
					}

					fillBits0.$el.trigger("annotation/requested", fillBits0);

					if (!fillBits0.error) {
						break;
					}
				}
			}

			mNibbles = {
				"$el": $annotation.find("#mnibbles").clone().appendTo($annotation),
				"bitIndex": {
					"from": reader.globalBitIndex()
				},
				"error": false,
				"result": reader.readNBits(2)
			};

			if (typeof mNibbles.result !== "string") {
				mNibbles.result = [4, 5, 6, 0][mNibbles.result];
				mNibbles.bitIndex.to = reader.globalBitIndex();
			} else {
				mNibbles.error = true;
			}

			mNibbles.$el.trigger("annotation/requested", mNibbles);

			if (mNibbles.error) {
				return;
			}

			if (mNibbles.result === 0) {
				mNibblesIsZero = {
					"$el": $annotation.find("#mnibbles-is-zero").clone().appendTo($annotation),
					"bitIndex": mNibbles.bitIndex,
					"error": mNibbles.error,
					"result": mNibbles.result
				};

				if (typeof mNibblesIsZero.result !== "string") {
					mNibblesIsZero.bitIndex.to = reader.globalBitIndex();
				} else {
					mNibblesIsZero.error = true;
				}

				mNibblesIsZero.$el.trigger("annotation/requested", mNibblesIsZero);

				reservedBit0 = {
					"$el": $annotation.find("#reserved-bit-0").clone().appendTo($annotation),
					"bitIndex": {
						"from": reader.globalBitIndex()
					},
					"error": false,
					"result": reader.readBit()
				};

				if (typeof reservedBit0.result !== "string") {
					reservedBit0.bitIndex.to = reader.globalBitIndex();
					reservedBit0.error = reservedBit0.result !== 0;
					if (reservedBit0.error) {
						reservedBit0.result = "Reserved, must be zero";
					}
				} else {
					reservedBit0.error = true;
				}

				reservedBit0.$el.trigger("annotation/requested", reservedBit0);

				if (reservedBit0.error) {
					return;
				}

				mSkipBytes = {
					"$el": $annotation.find("#mskipbytes").clone().appendTo($annotation),
					"bitIndex": {
						"from": reader.globalBitIndex()
					},
					"error": false,
					"result": reader.readNBits(2)
				};

				if (typeof mSkipBytes.result !== "string") {
					mSkipBytes.bitIndex.to = reader.globalBitIndex();
				} else {
					mSkipBytes.error = true;
				}

				mSkipBytes.$el.trigger("annotation/requested", mSkipBytes);

				if (mSkipBytes.error) {
					return;
				}

				if (mSkipBytes.result > 0) {
					mSkipLen = {
						"$el": $annotation.find("#mskiplen").clone().appendTo($annotation),
						"bitIndex": {
							"from": reader.globalBitIndex()
						},
						"error": false,
						"result": reader.readNBits(8 * mSkipBytes.result)
					};

					if (typeof mSkipLen.result !== "string") {
						mSkipLen.bitIndex.to = reader.globalBitIndex();

						if (mSkipBytes.result > 1 && (mSkipLen.result >> ((mSkipBytes.result - 1) * 8)) === 0) {
							mSkipLen.error = true;
							mSkipLen.result = "Invalid MSKIPLEN value";
						} else {
							mSkipLen.result += 1;
						}
					} else {
						mSkipLen.error = true;
					}

					mSkipLen.$el.trigger("annotation/requested", mSkipLen);

					if (mSkipLen.error) {
						return;
					}
				} else {
					mSkipLen = {
						"$el": $annotation.find("#mskiplen").clone().appendTo($annotation),
						"bitIndex": mSkipBytes.bitIndex,
						"error": false,
						"result": 0
					};
				}

				fillBits1 = {
					"$el": $annotation.find("#fillbits-1").clone().appendTo($annotation),
					"bitIndex": {
						"from": reader.globalBitIndex()
					},
					"error": false,
					"result": reader.readFillBits()
				};

				if (typeof fillBits1.result !== "string") {
					fillBits1.bitIndex.to = reader.globalBitIndex();
					if (fillBits1.result > 0) {
						fillBits1.error = true;
						fillBits1.result = "Non-zero fill bits";
					}
				} else {
					fillBits1.error = true;
				}

				fillBits1.$el.trigger("annotation/requested", fillBits1);

				if (fillBits1.error) {
					return;
				}

				if (mSkipLen.result > 0) {
					metadata = {
						"$el": $annotation.find("#metadata").clone().appendTo($annotation),
						"bitIndex": {
							"from": reader.globalBitIndex()
						},
						"error": false,
						"result": reader.readNBits(mSkipLen.result * 8)
					};

					if (typeof metadata.result !== "string") {
						metadata.bitIndex.to = reader.globalBitIndex();
					} else {
						metadata.error = true;
					}

					metadata.$el.trigger("annotation/requested", metadata);

					if (metadata.error) {
						return;
					}
				}

				continue;
			}

			mLen = {
				"$el": $annotation.find("#mlen").clone().appendTo($annotation),
				"bitIndex": {
					"from": reader.globalBitIndex()
				},
				"error": false,
				"result": reader.readNBits(4 * mNibbles.result)
			};

			if (typeof mLen.result !== "string") {
				mLen.bitIndex.to = reader.globalBitIndex();

				if (mNibbles.result > 4 && (mLen.result >> ((mNibbles.result - 1) * 4)) === 0) {
					mLen.error = true;
					mLen.result = "Invalid MLEN value";
				} else {
					mLen.result += 1;
				}
			} else {
				mLen.error = true;
			}

			mLen.$el.trigger("annotation/requested", mLen);

			if (mLen.error) {
				return;
			}

			if (isLast.result === 0) {
				isUncompressed = {
					"$el": $annotation.find("#is-uncompressed").clone().appendTo($annotation),
					"bitIndex": {
						"from": reader.globalBitIndex()
					},
					"error": false,
					"result": reader.readBit()
				};

				if (typeof isUncompressed.result !== "string") {
					isUncompressed.bitIndex.to = reader.globalBitIndex();
				} else {
					isUncompressed.error = true;
				}

				isUncompressed.$el.trigger("annotation/requested", isUncompressed);

				if (isUncompressed.error) {
					return;
				}

				if (isUncompressed.result === 1) {
					fillBits2 = {
						"$el": $annotation.find("#fillbits-2").clone().appendTo($annotation),
						"bitIndex": {
							"from": reader.globalBitIndex()
						},
						"error": false,
						"result": reader.readFillBits()
					};

					if (typeof fillBits2.result !== "string") {
						fillBits2.bitIndex.to = reader.globalBitIndex();
						if (fillBits2.result > 0) {
							fillBits2.error = true;
							fillBits2.result = "Non-zero fill bits";
						}
					} else {
						fillBits2.error = true;
					}

					fillBits2.$el.trigger("annotation/requested", fillBits2);

					uncompressedLiterals = {
						"$el": $annotation.find("#uncompressed-literals").clone().appendTo($annotation),
						"bitIndex": {
							"from": reader.globalBitIndex()
						},
						"error": false,
						"result": reader.readNBytes(mLen.result)
					};

					if (typeof uncompressedLiterals.result !== "string") {
						uncompressedLiterals.bitIndex.to = reader.globalBitIndex();
						write_out(uncompressedLiterals.result);
						uncompressedLiterals.result = uncompressedLiterals.result.map(function (b) { return b.toString(16); }).join(", ");
					} else {
						uncompressedLiterals.error = true;
					}

					uncompressedLiterals.$el.trigger("annotation/requested", uncompressedLiterals);

					continue;
				}
			}

			nBlTypesL = {
				"$el": $annotation.find("#nbltypesl").clone().appendTo($annotation),
				"bitIndex": {
					"from": reader.globalBitIndex()
				},
				"error": false,
				"result": shared.PrefixCode.bltype_codes.lookup(reader)
			};

			if (typeof nBlTypesL.result !== "string") {
				tmp = reader.readNBits(nBlTypesL.result[1]);

				if (typeof tmp !== "string") {
					nBlTypesL.result = nBlTypesL.result[0] + tmp;
					nBlTypesL.bitIndex.to = reader.globalBitIndex();
				} else {
					nBlTypesL.error = true;
				}
			} else {
				nBlTypesL.error = true;
			}

			nBlTypesL.$el.trigger("annotation/requested", nBlTypesL);

			if (nBlTypesL.error) {
				return;
			}

		} while (isLast.result === 0);

		endOfStream = {
			"$el": $annotation.find("#end-of-stream").clone().appendTo($annotation),
			"bitIndex": {
				"from": reader.globalBitIndex(),
				"to": reader.globalBitIndex()
			},
			"error": false,
			"result": ""
		};

		endOfStream.$el.trigger("annotation/requested", endOfStream);
	}

	function handleInputProcessed() {
		processInput($(this).val());
	}

	$input.on("input/processed", handleInputProcessed);
});