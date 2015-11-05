jQuery(function ($) {
	const ALPHABET_SIZE_BLOCK_COUNT = 26;

	var
		$input = $("#input-hex"),
		$output = $("#output-bytes"),
		$annotation = $("#annotation");

	function unimplemented() {
		console.error("hit unimplemented()…");
	}

	function unreachable() {
		console.error("hit unreachable()…");
	}

	function processInput(input) {
		var
			bytes = shared.toByteString(input).map(shared.toByte),
			buf = Uint8ClampedArray.from(bytes),
			out_buf = [],
			wbits, windowSize,
			metablock,
			endOfStream,
			reader,
			Entity, Metablock, PrefixCode;

		Entity = function (reader, id, parser, post) {
			this.reader = reader;

			this.id = id;
			this.bitIndex = {};
			this.parser = parser;
			this.post = post;
			this.error = false;
		};

		Entity.prototype.parse = function () {
			this.bitIndex.from = this.reader.globalBitIndex();

			this.setResult(this.parser());
			this.post();

			this.bitIndex.to = this.reader.globalBitIndex();

			this.$el = $annotation.find("#" + this.id).clone().appendTo($annotation);
			this.$el.trigger("annotation/requested", this);

			return !this.error;
		};

		Entity.prototype.setBitIndex = function (bitIndex) {
			this.bitIndex = bitIndex;
		};

		Entity.prototype.setResult = function (result) {
			this.result = result;
		};

		function noop() {}

		function postMinimal() {
			if (typeof this.result === "string") {
				this.error = true;
			}
			this.bitIndex.to = this.reader.globalBitIndex();
		}

		function postFillBits() {
			if (typeof this.result !== "string") {
				if (this.result > 0) {
					this.error = true;
					this.result = "Non-zero fill bits";
				}
			} else {
				this.error = true;
			}
			this.bitIndex.to = this.reader.globalBitIndex();
		}

		function postNBlTypes() {
			var tmp;

			if (typeof this.result !== "string") {
				tmp = this.reader.readNBits(this.result[1]);

				if (typeof tmp !== "string") {
					this.result = this.result[0] + tmp;
				} else {
					this.error = true;
				}
			} else {
				this.error = true;
			}
		}

		function readBit() {
			return this.reader.readBit();
		}

		function readFillBits() {
			return this.reader.readFillBits();
		}

		function parseHTreeBLen () {
			return parserPrefixCode(this.reader, ALPHABET_SIZE_BLOCK_COUNT);
		}

		function lookupNBlTypes () {
			return shared.PrefixCode.bltype_codes.lookup(this.reader);
		}

		function write_out(bytes) {
			Array.prototype.push.apply(out_buf, bytes);

			$output.html(out_buf.map(function (b) { return "<span>" + b.toString(16) + "</span>"; }).join(""));
		}

		function decodeBlockCount(reader, blockCountCode) {
			var baseLength, extraBits;

			if (typeof blockCountCode === "string") {
				return blockCountCode;
			}

			if (blockCountCode <= 3) {
				baseLength = 1 + (blockCountCode << 2);
				extraBits = 2;
			} else if (blockCountCode <= 7) {
				baseLength = 17 + ((blockCountCode - 4) << 3);
				extraBits = 3;
			} else if (blockCountCode <= 11) {
				baseLength = 49 + ((blockCountCode - 8) << 4);
				extraBits = 4;
			} else if (blockCountCode <= 15) {
				baseLength = 113 + ((blockCountCode - 12) << 5);
				extraBits = 5;
			} else if (blockCountCode <= 17) {
				baseLength = 241 + ((blockCountCode - 16) << 6);
				extraBits = 6;
			} else if (blockCountCode === 18) {
				baseLength = 369;
				extraBits = 7;
			} else if (blockCountCode === 19) {
				baseLength = 497;
				extraBits = 8;
			} else if (blockCountCode === 20) {
				baseLength = 753;
				extraBits = 9;
			} else if (blockCountCode === 21) {
				baseLength = 1265;
				extraBits = 10;
			} else if (blockCountCode === 22) {
				baseLength = 2289;
				extraBits = 11;
			} else if (blockCountCode === 23) {
				baseLength = 4337;
				extraBits = 12;
			} else if (blockCountCode === 24) {
				baseLength = 8433;
				extraBits = 13;
			} else if (blockCountCode === 25) {
				baseLength = 16625;
				extraBits = 24;
			} else {
				unreachable();
			}

			extraBits = reader.readNBits(extraBits);

			if (typeof extraBits === "string") {
				return extraBits;
			}

			return baseLength + extraBits;
		}

		function parserPrefixCode(reader, alphabetSize) {
			var prefixCode = new PrefixCode(reader, alphabetSize);

			if (!prefixCode.hSkip.parse()) {
				return prefixCode.hSkip.result;
			}

			if (prefixCode.hSkip.result === 1) {
				if (!prefixCode.nSym.parse()) {
					return prefixCode.nSym.result;
				}

				if (!prefixCode.symbols.parse()) {
					return prefixCode.symbols.result;
				}

				if (prefixCode.nSym.result === 4) {
					if (!prefixCode.treeSelect.parse()) {
						return prefixCode.treeSelect.result;
					}
				}

				if (prefixCode.symbols.result.length >= 2) {
					(function () {
						var
							symbols = prefixCode.symbols.result,
							i = symbols.length - 2,
							j = symbols.length - 1,
							tmp;

						if (symbols[i] > symbols[j]) {
							tmp = symbols[i];
							symbols[i] = symbols[j];
							symbols[j] = tmp;
						}
					} ());
				}

				switch (prefixCode.nSym.result) {
					case 1:
						return shared.PrefixCode.fromRawData([], 1, prefixCode.symbols.result[0]);
					case 2:
						return shared.PrefixCode.fromRawData([null, prefixCode.symbols.result[0], prefixCode.symbols.result[1]], 2, prefixCode.symbols.result[1]);
					case 3:
						return shared.PrefixCode.fromRawData([null, prefixCode.symbols.result[0], null, null, null, prefixCode.symbols.result[1], prefixCode.symbols.result[2]], 3, prefixCode.symbols.result[2]);
					case 4:
						if (prefixCode.treeSelect.result === 0) {
							return shared.PrefixCode.fromRawData([null, null, null, prefixCode.symbols.result[0], prefixCode.symbols.result[1], prefixCode.symbols.result[2], prefixCode.symbols.result[3]], 4, prefixCode.symbols.result[3]);
						} else {
							return shared.PrefixCode.fromRawData([null, prefixCode.symbols.result[0], null, null, null, prefixCode.symbols.result[1], null, prefixCode.symbols.result[2], prefixCode.symbols.result[3]], 4, prefixCode.symbols.result[3]);
						}
					default:
						return "Invalid value for NSYM";
						break;
				}
			} else {
				unimplemented();
			}
		}

		PrefixCode = function (reader, alphabetSize) {
			var
				prefixCode = this,
				alphabetBits = (function () {
					var bitWidth;
					for (bitWidth = 0; alphabetSize > (1 << bitWidth); bitWidth += 1) {}
					return bitWidth;
				} ());

			this.reader = reader;

			this.hSkip = new Entity(this.reader, "hskip",
				function () {
					return this.reader.readNBits(2);
				},
				postMinimal);

			this.nSym = new Entity(this.reader, "nsym",
				function () {
					return this.reader.readNBits(2);
				},
				function () {
					if (typeof this.result !== "string") {
						this.result += 1;
					} else {
						this.error = true;
					}
					this.bitIndex.to = this.reader.globalBitIndex();
				});

			this.symbols = new Entity(this.reader, "symbols",
				function () {
					return this.reader.readNWords(prefixCode.nSym.result, alphabetBits);
				},
				function () {
					var i, j, l, m;
					if (typeof this.result !== "string") {
						if (Math.max.apply(Math, this.result) >= alphabetSize) {
							this.error = true
							this.result = "Invalid symbol in prefix code";
						} else {
							for (i = 0, l = this.result.length - 1; i < l; i += 1) {
								for (j = i + 1, k = this.result.length; j < k; j += 1) {
									if (this.result[i] === this.result[j]) {
										this.error = true;
										this.result = "Duplicate symbols";
									}
								}
							}
						}

						this.bitIndex.to = this.reader.globalBitIndex();
					} else {
						this.error = true;
					}
				});

			this.treeSelect = new Entity(this.reader, "tree-select",
				function () {
					return this.reader.readBit();
				},
				postMinimal);
		}

		Metablock = function (reader) {
			var metablock = this;

			this.reader = reader;

			this.isLast = new Entity(this.reader, "islast", readBit, postMinimal);

			this.isLastEmpty = new Entity(this.reader, "islastempty", readBit, postMinimal);

			this.fillBits0 = new Entity(this.reader, "fillbits-0", readFillBits, postFillBits);

			this.mNibbles = new Entity(this.reader, "mnibbles",
				function () {
					return this.reader.readNBits(2);
				},
				function () {
					if (typeof this.result !== "string") {
						this.result = [4, 5, 6, 0][this.result];
					} else {
						this.error = true;
					}
					this.bitIndex.to = this.reader.globalBitIndex();
				});

			this.mNibblesIsZero = new Entity(this.reader, "mnibbles-is-zero",
				noop,
				function () {
					this.setBitIndex(metablock.mNibbles.bitIndex);
					this.result = metablock.mNibbles.result;
					this.error = metablock.mNibbles.error;
				});

			this.reservedBit0 = new Entity(this.reader, "reserved-bit-0",
				readBit,
				function () {
					if (typeof this.result !== "string") {
						if (this.result !== 0) {
							this.error = true;
							this.result = "Reserved, must be zero";
						}
					} else {
						this.error = true;
					}
					this.bitIndex.to = this.reader.globalBitIndex();
				});

			this.mSkipBytes = new Entity(this.reader, "mskipbytes",
				function () {
					return this.reader.readNBits(2);
				},
				postMinimal);

			this.mSkipLen = new Entity(this.reader, "mskiplen",
				function () {
					return this.reader.readNBits(8 * metablock.mSkipBytes.result);
				},
				function () {
					if (typeof this.result !== "string") {
						if (metablock.mSkipBytes.result > 1 && (this.result >> ((metablock.mSkipBytes.result - 1) * 8)) === 0) {
							this.error = true;
							this.result = "Invalid MSKIPLEN value";
						} else {
							this.result += 1;
						}
					} else {
						this.error = true;
					}
					this.bitIndex.to = this.reader.globalBitIndex();
				});

			this.fillBits1 = new Entity(this.reader, "fillbits-1", readFillBits, postFillBits);

			this.metadata = new Entity(this.reader, "metadata",
				function () {
					return this.reader.readNBits(metablock.mSkipLen.result * 8);
				},
				postMinimal);

			this.mLen = new Entity(this.reader, "mlen",
				function () {
					return this.reader.readNBits(4 * metablock.mNibbles.result);
				},
				function () {
					if (typeof this.result !== "string") {
						if (metablock.mNibbles.result > 4 && (this.result >> ((metablock.mNibbles.result - 1) * 4)) === 0) {
							this.error = true;
							this.result = "Invalid MLEN value";
						} else {
							this.result += 1;
						}
					} else {
						this.error = true;
					}
				});

			this.isUncompressed = new Entity(this.reader, "is-uncompressed", readBit, postMinimal);

			this.fillBits2 = new Entity(this.reader, "fillbits-2", readFillBits, postFillBits);

			this.uncompressedLiterals = new Entity(this.reader, "uncompressed-literals",
				function () {
					return this.reader.readNBytes(metablock.mLen.result);
				},
				function () {
					if (typeof this.result !== "string") {
						write_out(this.result);
					} else {
						this.error = true;
					}
				});

			this.nBlTypesL = new Entity(this.reader, "nbltypesl", lookupNBlTypes, postNBlTypes);

			this.hTreeBTypeL = new Entity(this.reader, "htreebtypel",
				function () {
					return parserPrefixCode(this.reader, metablock.nBlTypesL.result + 2);
				},
				postMinimal);

			this.hTreeBLenL = new Entity(this.reader, "htreeblenl", parseHTreeBLen, postMinimal);

			this.bTypeL = new Entity(this.reader, "btypel",
				unimplemented,
				postMinimal);

			this.bLenL = new Entity(this.reader, "blenl",
				function () {
					var blockCountCode = metablock.hTreeBLenL.result.lookup(this.reader);

					return decodeBlockCount(this.reader, blockCountCode);
				},
				postMinimal);

			this.nBlTypesI = new Entity(this.reader, "nbltypesi", lookupNBlTypes, postNBlTypes);

			this.hTreeBTypeI = new Entity(this.reader, "htreebtypei",
				function () {
					return parserPrefixCode(this.reader, metablock.nBlTypesI.result + 2);
				},
				postMinimal);

			this.hTreeBLenI = new Entity(this.reader, "htreebleni", parseHTreeBLen, postMinimal);

			this.bTypeI = new Entity(this.reader, "btypei",
				unimplemented,
				postMinimal);

			this.bLenI = new Entity(this.reader, "bleni",
				function () {
					var blockCountCode = metablock.hTreeBLenI.result.lookup(this.reader);

					return decodeBlockCount(this.reader, blockCountCode);
				},
				postMinimal);

			this.nBlTypesD = new Entity(this.reader, "nbltypesd", lookupNBlTypes, postNBlTypes);

			this.hTreeBTypeD = new Entity(this.reader, "htreebtyped",
				function () {
					return parserPrefixCode(this.reader, metablock.nBlTypesD.result + 2);
				},
				postMinimal);

			this.hTreeBLenD = new Entity(this.reader, "htreeblend", parseHTreeBLen, postMinimal);

			this.bTypeD = new Entity(this.reader, "btyped",
				unimplemented,
				postMinimal);

			this.bLenD = new Entity(this.reader, "blend",
				function () {
					var blockCountCode = metablock.hTreeBLenD.result.lookup(this.reader);

					return decodeBlockCount(this.reader, blockCountCode);
				},
				postMinimal);

			this.nPostfix = new Entity(this.reader, "npostfix",
				function () {
					return this.reader.readNBits(2);
				},
				postMinimal);


			this.nDirect = new Entity(this.reader, "ndirect",
				function () {
					this.result = this.reader.readNBits(4);

					if (typeof this.result === "string") {
						this.error = true;
						return this.result;
					}

					this.result <<= metablock.nPostfix.result;

					return this.result;
				},
				postMinimal);

			this.cMode = new Entity(this.reader, "cmode",
				function () {
					return this.reader.readNWords(metablock.nBlTypesL.result, 2);
				},
				postMinimal);
		};


		reader = new shared.BitReader(buf);

		wbits = new Entity(reader, "wbits",
			function () {
				return shared.PrefixCode.wbits.lookup(reader);
			},
			postMinimal);

		wbits.parse();

		windowSize = new Entity(reader, "window-size",
			noop,
			function () {
				this.setBitIndex(wbits.bitIndex);
				this.error = wbits.error;

				if (!this.error) {
					this.result = (1 << wbits.result) - 16;
				} else {
					this.result = wbits.result;
				}
			});

		if (!windowSize.parse()) {
			return;
		}

		do {
			metablock = new Metablock(reader);

			if (!metablock.isLast.parse()) {
				return;
			}

			if (metablock.isLast.result === 1) {
				if (!metablock.isLastEmpty.parse()) {
					return;
				}

				if (metablock.isLastEmpty.result === 1) {
					if (!metablock.fillBits0.parse()) {
						return;
					} else {
						break;
					}

				}
			}

			if (!metablock.mNibbles.parse()) {
				return;
			}

			if (metablock.mNibbles.result === 0) {
				metablock.mNibblesIsZero.parse();

				if (!metablock.reservedBit0.parse()) {
					return;
				}

				if (!metablock.mSkipBytes.parse()) {
					return;
				}

				if (metablock.mSkipBytes.result > 0) {
					if (!metablock.mSkipLen.parse()) {
						return;
					}
				} else {
					metablock.mSkipLen.setResult(0);
					metablock.mSkipLen.setBitIndex(metablock.mSkipBytes.bitIndex);
				}

				if (!metablock.fillBits1.parse()) {
					return;
				}

				if (metablock.mSkipLen.result > 0) {
					if (!metablock.metadata.parse()) {
						return;
					}
				}

				continue;
			}

			if (!metablock.mLen.parse()) {
				return;
			}

			if (metablock.isLast.result === 0) {
				if (!metablock.isUncompressed.parse()) {
					return;
				}

				if (metablock.isUncompressed.result === 1) {
					if (!metablock.fillBits2.parse()) {
						return;
					}

					if (!metablock.uncompressedLiterals.parse()) {
						return;
					}

					continue;
				}
			}

			if (!metablock.nBlTypesL.parse()) {
				return;
			}

			if (metablock.nBlTypesL.result >= 2) {
				if (!metablock.hTreeBTypeL.parse()) {
					return;
				}

				if (!metablock.hTreeBLenL.parse()) {
					return;
				}

				if (!metablock.bLenL.parse()) {
					return;
				}

				metablock.histBTypesL = shared.RingBuffer.fromArr([0, 1]);
			} else {
				metablock.bLenL.result = 16777216;
			}

			metablock.bTypeL.result = 0;

			if (!metablock.nBlTypesI.parse()) {
				return;
			}

			if (metablock.nBlTypesI.result >= 2) {
				if (!metablock.hTreeBTypeI.parse()) {
					return;
				}

				if (!metablock.hTreeBLenI.parse()) {
					return;
				}

				if (!metablock.bLenI.parse()) {
					return;
				}

				metablock.histBTypesI = shared.RingBuffer.fromArr([0, 1]);
			} else {
				metablock.bLenI.result = 16777216;
			}

			metablock.bTypeI.result = 0;

			if (!metablock.nBlTypesD.parse()) {
				return;
			}

			if (metablock.nBlTypesD.result >= 2) {
				if (!metablock.hTreeBTypeD.parse()) {
					return;
				}

				if (!metablock.hTreeBLenD.parse()) {
					return;
				}

				if (!metablock.bLenD.parse()) {
					return;
				}

				metablock.histBTypesD = shared.RingBuffer.fromArr([0, 1]);
			} else {
				metablock.bLenD.result = 16777216;
			}

			metablock.bTypeD.result = 0;

			if (!metablock.nPostfix.parse()) {
				return;
			}

			if (!metablock.nDirect.parse()) {
				return;
			}

			if (!metablock.cMode.parse()) {
				return;
			}
		} while (metablock.isLast.result === 0);

		endOfStream = new Entity(reader, "end-of-stream",
			noop,
			function () {
				this.bitIndex.from = this.reader.globalBitIndex();
				this.bitIndex.to = this.reader.globalBitIndex();
				this.result = "";
			});
		endOfStream.parse();
	}

	function handleInputProcessed() {
		processInput($(this).val());
	}

	$input.on("input/processed", handleInputProcessed);
});