jQuery(function ($) {
	var
		$input = $("#input-hex"),
		$outputHex = $("#output-hex"),
		$outputBin = $("#output-bin");

	function spanWrapped(html) {
		return "<span>" + html + "</span>";
	}

	function toBinaryString(byte) {
		var binaryString = "";

		while (byte > 0) {
			binaryString = "" + (byte & 1) + binaryString;
			byte >>= 1;
		}

		return ("00000000" + binaryString).slice(-8);
	}

	function toBinary(hexStr) {
		return toBinaryString(parseInt(hexStr, 16));
	}

	function charSpanWrapped(str) {
		return str.split("").map(spanWrapped).join("");
	}

	function processInput(value) {
		var
			cleanInput = value.replace(/\s/g, "").toLowerCase(),
			splitBytesResult,
			re = new RegExp("[0-9a-f]{1,2}", "g"),
			splitBytes = [];

		while (splitBytesResult = re.exec(cleanInput)) {

			splitBytes.push((splitBytesResult[0] + "0").slice(0, 2));
		}

		$outputHex.html(splitBytes.map(charSpanWrapped).map(spanWrapped));
		$outputBin.html(splitBytes.map(toBinary).map(charSpanWrapped).map(spanWrapped));
	}

	function handleInputPassed() {
		var value = $input.val();

		processInput(value);
	}

	$input.on("input/passed", handleInputPassed);
});