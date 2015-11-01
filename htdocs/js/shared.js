(function () {
	shared = {
		"BitReader": function(buf) {
			this.buf = buf;
			this.nextGlobalBitIndex = 0;

			this.globalBitIndex = function() {
				return this.nextGlobalBitIndex;
			};

			this.nextBitIndex = function() {
				return this.nextGlobalBitIndex % 8;
			};

			this.nextByteIndex = function() {
				return Math.floor(this.nextGlobalBitIndex / 8 + 0.0625);
			};

			this.readBit = function() {
				var
					byteIndex = this.nextByteIndex(),
					bitIndex = this.nextBitIndex();

				if (byteIndex >= this.buf.length) {
					return "End of buffer";
				}

				this.nextGlobalBitIndex += 1;
				return (this.buf[byteIndex] >> bitIndex) & 1;
			};
		},
		"classHidden": "hidden",
		"hide": function($el) {
			return $el.addClass(shared.classHidden);
		},
		"PrefixCode": function() {
			this.lookup = function(reader) {
				var lookupIndex = 0

				if (this.len === 1) {
					return this.lastSymbol;
				}

				while (lookupIndex < this.buf.length && null === this.buf[lookupIndex]) {
					if (reader.readBit() === 0) {
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
		"show": function($el) {
			return $el.removeClass(shared.classHidden);
		},
		"toByte": function(str) {
			return parseInt(str, 16);
		},
		"toByteString": function(value) {
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

	shared.PrefixCode.fromRawData = function(buf, len, lastSymbol) {
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