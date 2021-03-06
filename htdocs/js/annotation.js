jQuery(function ($) {
	var
		classHover = "hover",
		$annotation = $("#annotation"),
		$output = $("#output"),
		$input = $("#input-hex");

	function handleAnnotationRequested(e, data) {
		var
			$el = data.$el,
			$resultValue = $(".result .value", $el),
			text;

		e = e;

		text = (!!data.output) ? data.output() : data.result;
		if (text !== null && !!text.slice) {
			// @NOTE This slice is here to protect from browser crashes,
			//       when appending a 65kb text snippet to the DOM.
			//       There is probably a way to do that right, without
			//       crashing, but even then it would still be a UI
			//       challenge to present 65kb of text data in any
			//       meaningful way.
			text = text.slice(0, 100);
		}

		$resultValue.text(text);
		if (data.error) {
			$resultValue.addClass("error");
		} else {
			$resultValue.removeClass("error");
		}

		$el.data({
			"bitindex-from": data.bitIndex.from,
			"bitindex-to": data.bitIndex.to
		});
		shared.show($el);

		$output.trigger("register/requested", {
			"$el": $el,
			"from": $el.data("bitindex-from"),
			"to": $el.data("bitindex-to")
		});
	}

	function handleMouseenter() {
		var $this = $(this);

		$output.trigger("hover/requested", {
			"$el": $this,
			"from": $this.data("bitindex-from"),
			"to": $this.data("bitindex-to")
		});
	}

	function handleMouseleave() {
		var $this = $(this);

		$output.trigger("unhover/requested", {
			"from": $this.data("bitindex-from"),
			"to": $this.data("bitindex-to")
		});
	}

	function handleInputPassed() {
		$("> fieldset", $annotation).each(function () {
			var
				$el = $(this),
				$resultValue = $(".result .value", $el),
				$toggle = $(".toggle", $el);

			$resultValue.text("").removeClass("error");
			$toggle.trigger("reset/requested");
			shared.hide($el);
		});
	}

	function handleHoverRequested(e, el) {
		var $el = $(el);

		$el.addClass(classHover);

		$annotation.parent().stop(true, false).animate({
			"scrollTop": $el.position().top
		}, 300);
	}

	function handleUnhoverRequested(e, el) {
		var $el = $(el);
		$el.removeClass(classHover);
	}

	$annotation
		.on("annotation/requested", "fieldset", handleAnnotationRequested)
		.on("mouseenter", "fieldset", handleMouseenter)
		.on("mouseleave", "fieldset", handleMouseleave)
		.on("hover/requested", handleHoverRequested)
		.on("unhover/requested", handleUnhoverRequested);

	$input.on("input/passed", handleInputPassed);
});