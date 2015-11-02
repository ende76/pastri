jQuery(function ($) {
	var $container = $("#annotation");

	function handleClickToggle(e) {
		var
			$toggle = $(this),
			$toggleShow = $(".show", this),
			$toggleHide = $(".hide", this),
			$target = $toggle.siblings($toggle.attr("href"));

		e.preventDefault();

		if (shared.isHidden($target)) {
			shared.show($target);
			shared.show($toggleHide);
			shared.hide($toggleShow);
		} else {
			shared.hide($target);
			shared.hide($toggleHide);
			shared.show($toggleShow);
		}
	}

	function handleResetRequested() {
		var
			$toggle = $(this),
			$toggleShow = $(".show", this),
			$toggleHide = $(".hide", this),
			$target = $toggle.siblings($toggle.attr("href"));

		shared.hide($target);
		shared.hide($toggleHide);
		shared.show($toggleShow);
	}

	$container
		.on("click", ".toggle", handleClickToggle)
		.on("reset/requested", ".toggle", handleResetRequested);
});