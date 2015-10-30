jQuery(function ($) {
	function updateEl($el, result) {
		var $container = $el.closest("div");

		if (result.valid) {
			$container.removeClass("invalid");
		} else {
			$container.addClass("invalid");
		}
	}

	function validatePattern(pattern, value) {
		var re = new RegExp(pattern);

		return re.test(value);
	}

	function validateEl($el) {
		var
			pattern = $el.data("validate-pattern"),
			value = $el.val(),
			result = {
				valid: true
			};

		if (!!pattern) {
			result.valid = result.valid && validatePattern(pattern, value);
		}

		updateEl($el, result);

		if (result.valid) {
			$el.trigger("input/passed")
		}
	}

	function handleRequestValidate(data) {
		var $el = data.from;

		validateEl($el);
	}

	Arbiter.subscribe("request/validate", handleRequestValidate);
});