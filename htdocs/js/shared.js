(function () {
	window.shared = {
		"BitReader": function (buf) {
			this.buf = buf;
			this.nextGlobalBitIndex = 0;
		},
		"classHidden": "hidden",
		"hide": function ($el) {
			return $el.addClass(shared.classHidden);
		},
		"isHidden": function ($el) {
			return $el.hasClass(shared.classHidden);
		},
		"PrefixCode": function () {},
		"RingBuffer": function (buf, pos, cap) {
			this.buf = buf;
			this.pos = pos;
			this.cap = cap;
		},
		"show": function ($el) {
			return $el.removeClass(shared.classHidden);
		},
		"toByte": function (str) {
			return parseInt(str, 16);
		},
		"toByteIndex": function (bitIndex) {
			return Math.floor(bitIndex / 8 + 0.0625);
		},
		"toByteString": function (value) {
			var
				cleanInput = value.replace(/\s/g, "").toLowerCase(),
				splitBytesResult,
				re = new RegExp("[0-9a-f]{1,2}", "g"),
				splitBytes = [];

			while (splitBytesResult = re.exec(cleanInput)) {

				splitBytes.push((splitBytesResult[0] + "0").slice(0, 2));
			}

			return splitBytes;
		}
	};

	shared.BitReader.prototype.globalBitIndex = function () {
		return this.nextGlobalBitIndex;
	};

	shared.BitReader.prototype.nextBitIndex = function () {
		return this.nextGlobalBitIndex % 8;
	};

	shared.BitReader.prototype.nextByteIndex = function () {
		return shared.toByteIndex(this.nextGlobalBitIndex);
	};

	shared.BitReader.prototype.readBit = function () {
		var
			byteIndex = this.nextByteIndex(),
			bitIndex = this.nextBitIndex();

		if (shared.toByteIndex(this.nextGlobalBitIndex + 1) >= this.buf.length) {
			return "End of buffer";
		}

		this.nextGlobalBitIndex += 1;
		return (this.buf[byteIndex] >> bitIndex) & 1;
	};

	shared.BitReader.prototype.readNBits = function (n) {
		var
			byteIndex = this.nextByteIndex(),
			bitIndex = this.nextBitIndex();

		if (shared.toByteIndex(this.nextGlobalBitIndex + n) >= this.buf.length && ((this.nextGlobalBitIndex + n) % 8 > 0)) {
			return "End of buffer";
		}

		if (n === 0) {
			return 0;
		}

		if (bitIndex + n <= 8) {
			this.nextGlobalBitIndex += n;
			return (this.buf[byteIndex] >> bitIndex) & ((1 << n) - 1);
		}

		return this.readNBits(8 - bitIndex) | (this.readNBits(n - (8 - bitIndex)) << (8 - bitIndex));
	};

	shared.BitReader.prototype.readNBytes = function (n) {
		return this.readNWords(n, 8);
	}

	shared.BitReader.prototype.readNWords = function (n, bitWidth) {
		var words = [];

		if (shared.toByteIndex(this.nextGlobalBitIndex + bitWidth * n) >= this.buf.length && ((this.nextGlobalBitIndex + bitWidth * n) % 8 > 0)) {
			return "End of buffer";
		}

		for (; n > 0; n -= 1) {
			words.push(this.readNBits(bitWidth));
		}

		words.toString = function () {
			return this.map(function (b) { return b.toString(16); }).join(", ");
		};

		return words;
	}

	shared.BitReader.prototype.readFillBits = function () {
		var nextBitIndex = this.nextBitIndex();
		if (nextBitIndex === 0) {
			return null;
		}

		return this.readNBits(8 - nextBitIndex);
	};


	shared.PrefixCode.prototype.lookup = function (reader) {
		var
			lookupIndex = 0,
			bit;

		if (this.len === 1) {
			return this.lastSymbol;
		}

		while (lookupIndex < this.buf.length && null === this.buf[lookupIndex]) {
			bit = reader.readBit();

			if (typeof bit === "string") {
				return bit;
			}

			if (bit === 0) {
				lookupIndex = (lookupIndex << 1) + 1;
			} else {
				lookupIndex = (lookupIndex << 1) + 2;
			}
		}

		if (lookupIndex >= this.buf.length) {
			return "Invalid prefix code";
		}
		return this.buf[lookupIndex];
	};


	shared.PrefixCode.fromRawData = function (buf, len, lastSymbol) {
		var pc = new shared.PrefixCode();

		pc.buf = buf;
		pc.len = len;
		pc.lastSymbol = lastSymbol;

		return pc;
	};

	shared.PrefixCode.wbits = shared.PrefixCode.fromRawData(
		[null, 16, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null,
		 21, 19, 23, 18, 22, 20, 24, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, 17, 12,
		 10, 14, null, 13, 11, 15, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null, null],
		15, 24);

	shared.PrefixCode.bltype_codes = shared.PrefixCode.fromRawData(
		[null, [1, 0], null, null, null, null, null, null,
		 null, null, null, null, null, null, null, null,
		 null, null, null, null, null, null, null, [2, 0],
		 [17, 4], [5, 2], [65, 6], [3, 1], [33, 5], [9, 3], [129, 7]],
		9, [129, 7]);

	shared.RingBuffer.fromArr = function (arr) {
		return new shared.RingBuffer(arr.reverse(), arr.length - 1, arr.length);
	};

	shared.RingBuffer.withCapacity = function (cap) {
		return new shared.RingBuffer([], 0, cap);
	};

	shared.RingBuffer.prototype.nth = function (n) {
		var len = this.buf.length;

		if (n >= len) {
			console.error("RingBufferError::ParameterExceededSize");
		} else {
			return this.buf[(this.pos + len - n) % len];
		}
	}

	shared.RingBuffer.prototype.slice_tail = function (n) {
		var
			buf = [],
			len = this.buf.length,
			i;

		if (n >= len) {
			console.error("RingBufferError::ParameterExceededSize");
		} else {
			for (i = 0; i < len; i+= 1) {
				buf[i] = this.buf[(this.pos + len - n + i) % len];
			}

			return buf;
		}
	}

	/// Pushes an item to the end of the ring buffer.
	shared.RingBuffer.prototype.push = function (item) {
		var len = this.buf.length;
		if (len < this.cap) {
			this.buf.push(item);
			this.pos = len;
		} else {
			this.pos = (this.pos + 1) % len;
			this.buf[this.pos] = item;
		}
	}


} ());