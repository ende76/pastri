jQuery(function ($) {
	var
		$input = $("#input-hex"),
		$annotation = $("#annotation"),
		reader;

	function processInput(input) {
		var
			bytes = shared.toByteString(input).map(shared.toByte),
			buf = Uint8ClampedArray.from(bytes),
			wbits, windowSize, isLast, isLastEmpty, mNibbles,
			reservedBit0, mSkipBytes, mSkipLen, fillBits0;

		reader = new shared.BitReader(buf);

		wbits = {
			"annotationId": "wbits",
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

		$annotation.find("#" + wbits.annotationId).trigger("annotation/requested", wbits);

		if (wbits.error) {
			return;
		}

		windowSize = {
			"annotationId": "window-size",
			"bitIndex": wbits.bitIndex,
			"error": wbits.error,
		};

		if (!windowSize.error) {
			windowSize.result = (1 << wbits.result) - 16;
		}

		$annotation.find("#" + windowSize.annotationId).trigger("annotation/requested", windowSize);

		if (windowSize.error) {
			return;
		}

		isLast = {
			"annotationId": "islast",
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

		$annotation.find("#" + isLast.annotationId).trigger("annotation/requested", isLast);

		if (isLast.error) {
			return;
		}

		if (isLast.result === 1) {
			isLastEmpty = {
				"annotationId": "islastempty",
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

			$annotation.find("#" + isLastEmpty.annotationId).trigger("annotation/requested", isLastEmpty);

			if (isLastEmpty.error) {
				return;
			}
		}

		mNibbles = {
			"annotationId": "mnibbles",
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

		$annotation.find("#" + mNibbles.annotationId).trigger("annotation/requested", mNibbles);

		if (mNibbles.error) {
			return;
		}

		if (mNibbles.result === 0) {
			mNibblesIsZero = {
				"annotationId": "mnibbles-is-zero",
				"bitIndex": mNibbles.bitIndex,
				"error": mNibbles.error,
				"result": mNibbles.result
			};

			if (typeof mNibblesIsZero.result !== "string") {
				mNibblesIsZero.bitIndex.to = reader.globalBitIndex();
			} else {
				mNibblesIsZero.error = true;
			}

			$annotation.find("#" + mNibblesIsZero.annotationId).trigger("annotation/requested", mNibblesIsZero);

			reservedBit0 = {
				"annotationId": "reserved-bit-0",
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

			$annotation.find("#" + reservedBit0.annotationId).trigger("annotation/requested", reservedBit0);

			if (reservedBit0.error) {
				return;
			}

			mSkipBytes = {
				"annotationId": "mskipbytes",
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

			$annotation.find("#" + mSkipBytes.annotationId).trigger("annotation/requested", mSkipBytes);

			if (mSkipBytes.error) {
				return;
			}

			if (mSkipBytes.result > 0) {
				mSkipLen = {
					"annotationId": "mskiplen",
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

				$annotation.find("#" + mSkipLen.annotationId).trigger("annotation/requested", mSkipLen);

				if (mSkipLen.error) {
					return;
				}
			} else {
				mSkipLen = {
					"annotationId": "mskiplen",
					"bitIndex": mSkipBytes.bitIndex,
					"error": false,
					"result": 0
				};
			}

			fillBits0 = {
				"annotationId": "fillbits-0",
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

			$annotation.find("#" + fillBits0.annotationId).trigger("annotation/requested", fillBits0);

			if (fillBits0.error) {
				return;
			}

			return;
		}

	}

	function handleInputPassed() {
		processInput($(this).val());
	}

	$input.on("input/passed", handleInputPassed);
});