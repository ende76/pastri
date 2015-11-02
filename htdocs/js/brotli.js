jQuery(function ($) {
	var
		$input = $("#input-hex"),
		$annotation = $("#annotation"),
		reader;

	function processInput(input) {
		var
			bytes = shared.toByteString(input).map(shared.toByte),
			buf = Uint8ClampedArray.from(bytes),
			wbits, windowSize, isLast, isLastEmpty, fillBits0, mNibbles,
			reservedBit0, mSkipBytes, mSkipLen, fillBits1, endOfStream;

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

					return;
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
						"result": reader.readNBits(mSkipLen * 8)
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

	function handleInputPassed() {
		processInput($(this).val());
	}

	$input.on("input/passed", handleInputPassed);
});