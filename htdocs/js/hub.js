(function () {
	function handleInputChange(data, msg) {
		Arbiter.publish("request/validate", data, { "async": true });
	}

	Arbiter.subscribe(["input/change", "input/init"], handleInputChange);
} ());