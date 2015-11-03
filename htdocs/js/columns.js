jQuery(function ($) {
	var $columns = $("#left-column, #right-column");

	function fitHeight() {
		var
			$column = $(this),
			offset = $column.offset();

		$column.css("height", window.innerHeight - offset.top);
	}

	function resizeColumns() {
		$columns.each(fitHeight);
	}

	resizeColumns();

	$(window).on("resize", resizeColumns);
});