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
		$el = $el || $(this);

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

	function validateAll($el) {

		$el.each(validateEl);
	}

	function handleInput() {

		validateEl($(this));
	}

	validateAll($("[data-validate-pattern]").on("input", handleInput));
});