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


	shared.PrefixCode.fromRawData = function (buf, len, lastSymbol) {
		var pc = new shared.PrefixCode();

		pc.buf = buf;
		pc.len = len;
		pc.lastSymbol = lastSymbol;

		return pc;
	};

	shared.PrefixCode.bit_string_from_code_and_length = function (code, len) {
		var
			bits = new Array(len).fill(0),
			i;

		for (i = 0; i < len; i += 1) {
			bits[len - i - 1] = (code >> i) & 1;
		}

		return bits;
	}


	shared.PrefixCode.codesFromLengthsAndSymbols = function (lengths, symbols) {
		var
			maxLength = Math.max.apply(Math, lengths),
			blCount = new Array(maxLength + 1).fill(0),
			code = 0,
			next_code = new Array(maxLength + 1).fill(0),
			len, bits, codes, i, l;

		lengths.forEach(function (len) {
			blCount[len] += 1;
		});

		for (bits = 1; bits < maxLength + 1; bits += 1) {
			code = (code + blCount[bits - 1]) << 1;
			next_code[bits] = code;
		}

		codes = this.fromRawData(new Array((1 << (maxLength + 1)) - 1).fill(null), 0, null)
		for (i = 0, l = lengths.length; i < l; i += 1) {
			len = lengths[i];
			if (len > 0 || maxLength === 0) {
				codes.insert(this.bit_string_from_code_and_length(next_code[len], len), symbols[i]);
				next_code[len] += 1;
			}
		}

		return codes;
	}

	shared.PrefixCode.codesFromLengths = function (lengths) {
		var symbols = new Array(lengths.length).fill(0).map(function (_, i) { _ = _; return i; });

		return this.codesFromLengthsAndSymbols(lengths, symbols);
	}

	shared.PrefixCode.prototype.insert = function (code, symbol) {
		var insertAtIndex = (1 << code.length) - 1 + code.reduce(function(acc, bit) { return (acc << 1) + bit; }, 0);

		this.len += 1;
		this.lastSymbol = symbol;

		this.buf[insertAtIndex] = symbol;
	}

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

	shared.PrefixCode.codelength_codes = shared.PrefixCode.fromRawData(
		[null,
		 null, null,
		 0, 3, 4, null,
		 null, null, null, null, null, null, 2, null,
		 null, null, null, null, null, null, null, null, null, null, null, null, null, null, 1, 5],
		6, 5);

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

	if (!Array.prototype.fill) {
		Array.prototype.fill = function(value, start, end) {

			// Steps 1-2.
			if (this == null) {
				throw new TypeError('this is null or not defined');
			}

			var O = Object(this);

			// Steps 3-5.
			var len = O.length >>> 0;

			// Steps 6-7.
			// var start = arguments[1];
			var relativeStart = start >> 0;

			// Step 8.
			var k = relativeStart < 0 ?
				Math.max(len + relativeStart, 0) :
				Math.min(relativeStart, len);

			// Steps 9-10.
			// var end = arguments[2];
			var relativeEnd = end === undefined ? len : end >> 0;

			// Step 11.
			var final = relativeEnd < 0 ?
				Math.max(len + relativeEnd, 0) :
			 	Math.min(relativeEnd, len);

			// Step 12.
			while (k < final) {
				O[k] = value;
				k++;
			}

			// Step 13.
			return O;
		};
	}

	if (!Array.prototype.reduce) {
	  Array.prototype.reduce = function(callback, value) {
	    'use strict';
	    if (this == null) {
	      throw new TypeError('Array.prototype.reduce called on null or undefined');
	    }
	    if (typeof callback !== 'function') {
	      throw new TypeError(callback + ' is not a function');
	    }
	    var t = Object(this), len = t.length >>> 0, k = 0;
	    if (typeof value === "undefined") {
	      while (k < len && !(k in t)) {
	        k++;
	      }
	      if (k >= len) {
	        throw new TypeError('Reduce of empty array with no initial value');
	      }
	      value = t[k++];
	    }
	    for (; k < len; k++) {
	      if (k in t) {
	        value = callback(value, t[k], k, t);
	      }
	    }
	    return value;
	  };
	}

	// Production steps of ECMA-262, Edition 5, 15.4.4.18
	// Reference: http://es5.github.io/#x15.4.4.18
	if (!Array.prototype.forEach) {

	  Array.prototype.forEach = function(callback, thisArg) {

	    var T, k;

	    if (this == null) {
	      throw new TypeError(' this is null or not defined');
	    }

	    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
	    var O = Object(this);

	    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
	    // 3. Let len be ToUint32(lenValue).
	    var len = O.length >>> 0;

	    // 4. If IsCallable(callback) is false, throw a TypeError exception.
	    // See: http://es5.github.com/#x9.11
	    if (typeof callback !== "function") {
	      throw new TypeError(callback + ' is not a function');
	    }

	    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
	    if (typeof thisArg !== "undefined") {
	      T = thisArg;
	    }

	    // 6. Let k be 0
	    k = 0;

	    // 7. Repeat, while k < len
	    while (k < len) {

	      var kValue;

	      // a. Let Pk be ToString(k).
	      //   This is implicit for LHS operands of the in operator
	      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
	      //   This step can be combined with c
	      // c. If kPresent is true, then
	      if (k in O) {

	        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
	        kValue = O[k];

	        // ii. Call the Call internal method of callback with T as the this value and
	        // argument list containing kValue, k, and O.
	        callback.call(T, kValue, k, O);
	      }
	      // d. Increase k by 1.
	      k++;
	    }
	    // 8. return undefined
	  };
	}
} ());