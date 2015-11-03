(function () {
	window.shared = {
		"BitReader": function (buf) {
			this.buf = buf;
			this.nextGlobalBitIndex = 0;

			this.globalBitIndex = function () {
				return this.nextGlobalBitIndex;
			};

			this.nextBitIndex = function () {
				return this.nextGlobalBitIndex % 8;
			};

			this.nextByteIndex = function () {
				return shared.toByteIndex(this.nextGlobalBitIndex);
			};

			this.readBit = function () {
				var
					byteIndex = this.nextByteIndex(),
					bitIndex = this.nextBitIndex();

				if (shared.toByteIndex(this.nextGlobalBitIndex + 1) >= this.buf.length) {
					return "End of buffer";
				}

				this.nextGlobalBitIndex += 1;
				return (this.buf[byteIndex] >> bitIndex) & 1;
			};

			this.readNBits = function (n) {
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

			this.readNBytes = function (n) {
				var bytes = [];

				if (shared.toByteIndex(this.nextGlobalBitIndex + 8 * n) >= this.buf.length && ((this.nextGlobalBitIndex + 8 * n) % 8 > 0)) {
					return "End of buffer";
				}

				for (; n > 0; n -= 1) {
					bytes.push(this.readNBits(8));
				}

				return bytes;
			}

			this.readFillBits = function () {
				var nextBitIndex = this.nextBitIndex();
				if (nextBitIndex === 0) {
					return null;
				}

				return this.readNBits(8 - nextBitIndex);
			};
		},
		"classHidden": "hidden",
		"hide": function ($el) {
			return $el.addClass(shared.classHidden);
		},
		"isHidden": function ($el) {
			return $el.hasClass(shared.classHidden);
		},
		"PrefixCode": function () {
			this.lookup = function (reader) {
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
} ());