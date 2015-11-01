jQuery(function ($) {
	var
		$input = $("#input-hex"),
		$annotation = $("#annotation"),
		reader;


	function processInput(input) {
		var
			bytes = shared.toByteString(input).map(shared.toByte),
			buf = Uint8ClampedArray.from(bytes),
			wbits;

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
	}

	function handleInputPassed() {
		processInput($(this).val());
	}

	$input.on("input/passed", handleInputPassed);
});