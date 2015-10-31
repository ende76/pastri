jQuery(function ($) {
	var
		classHover = "hover",
		$outputBin = $("#output-bin"),
		$outputHex = $("#output-hex"),
		state = {
			"bin": {
				"$hover": $("")
			},
			"hex": {
				"$hover": $("")
			}
		};

	function viewHoverBinState() {

		state.bin.$hover.addClass(classHover);
	}

	function viewUnhoverBinState() {

		state.bin.$hover.removeClass(classHover);
	}

	function viewHoverHexState() {

		state.hex.$hover.addClass(classHover);
	}

	function viewUnhoverHexState() {

		state.hex.$hover.removeClass(classHover);
	}

	function viewFindBinByte(index) {
		return $outputBin.find("> span").eq(index);
	}

	function viewFindBinNibble(indexByte, indexNibble) {
		var $byte = viewFindBinByte(indexByte);

		return $byte.find("span").filter(function (i, span) {
				return (indexNibble == 0 && i < 4) || (indexNibble == 1 && i >= 4);
		});
	}

	function viewFindHexByte(index) {
		return $outputHex.find("> span").eq(index);
	}

	function viewFindHexNibble(indexByte, indexNibble) {
		return viewFindHexByte(indexByte).find("span").eq(indexNibble);
	}

	function modelHoverBinState(hoverState) {
		state.bin.$hover = hoverState;
	}

	function modelResetHoverBinState() {
		state.bin.$hover = $("");
	}

	function modelHoverHexState(hoverState) {
		state.hex.$hover = hoverState;
	}

	function modelResetHoverHexState() {
		state.hex.$hover = $("");
	}

	function updateHoverBinFromHex(indexByte, indexNibble) {
		var
			$byte = viewFindBinByte(indexByte),
			$nibble = viewFindBinNibble(indexByte, indexNibble);

		viewUnhoverBinState();

		modelHoverBinState($byte.add($nibble));

		viewHoverBinState();
	}

	function updateHoverHexFromBin(indexByte, indexNibble) {
		var
			$byte = viewFindHexByte(indexByte),
			$nibble = viewFindHexNibble(indexByte, indexNibble);

		viewUnhoverHexState();

		modelHoverHexState($byte.add($nibble));

		viewHoverHexState();
	}

	function handleMouseenterBin() {
		var
			$hoveredEl = $(this),
			indexNibble = (($hoveredEl.index() < 4) ? 0 : 1),
			indexByte = $hoveredEl.parent().index();

		updateHoverHexFromBin(indexByte, indexNibble);
	}

	function handleMouseleaveBin() {
		viewUnhoverHexState();

		modelResetHoverHexState();
	}

	function handleMouseenterHex() {
		var
			$hoveredEl = $(this),
			indexNibble = $hoveredEl.index(),
			indexByte = $hoveredEl.parent().index();

		updateHoverBinFromHex(indexByte, indexNibble);
	}

	function handleMouseleaveHex() {
		viewUnhoverBinState();

		modelResetHoverBinState();
	}

	$outputHex
		.on("mouseenter", "> span > span", handleMouseenterHex)
		.on("mouseleave", "> span > span", handleMouseleaveHex);

	$outputBin
		.on("mouseenter", "> span > span", handleMouseenterBin)
		.on("mouseleave", "> span > span", handleMouseleaveBin);

});