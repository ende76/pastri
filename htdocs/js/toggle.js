jQuery(function ($) {
	var
		classHide = "hide",
		$container = $("#annotation");

	function handleClickToggle(e) {
		var
			$toggle = $(this),
			$target = $toggle.siblings($toggle.attr("href"));

		e.preventDefault();

		if (shared.isHidden($target)) {
			shared.show($target);
			$toggle.addClass(classHide);
		} else {
			shared.hide($target);
			$toggle.removeClass(classHide);
		}
	}

	function handleResetRequested() {
		var
			$toggle = $(this),
			$target = $toggle.siblings($toggle.attr("href"));

		shared.hide($target);
		$toggle.removeClass(classHide);
	}

	$container
		.on("click", ".toggle", handleClickToggle)
		.on("reset/requested", ".toggle", handleResetRequested);
});