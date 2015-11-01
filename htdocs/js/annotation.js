jQuery(function ($) {
	var
		$annotation = $("#annotation"),
		$output = $("#output");

	function handleAnnotationRequested(e, data) {
		var
			$el = $("#" + data.annotationId),
			$resultValue = $(".result .value", $el);

		$resultValue.text(data.result);
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

	$annotation
		.on("annotation/requested", "fieldset", handleAnnotationRequested)
		.on("mouseenter", "fieldset", handleMouseenter)
		.on("mouseleave", "fieldset", handleMouseleave);
});