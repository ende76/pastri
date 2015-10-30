jQuery(function ($) {
	var $inputHex = $("#input-hex");

	function handleInput(e) {
		Arbiter.publish("input/change", { "from": $inputHex }, { "async": true });
	}

	$inputHex.on("input", handleInput);

	Arbiter.publish("input/init", { "from": $inputHex }, { "async": true });
});