jQuery(function ($) {
	var
		classHover = "hover",
		$output = $("#output"),
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

	function viewAddHoverDataBinState($bit, $annotationEl) {
		var $hoverData = $bit.data("$hover") || $("");

		$bit.data("$hover", $hoverData.add($annotationEl));
	}

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

		return $byte.find("span").filter(function (i) {
				return (indexNibble == 0 && i < 4) || (indexNibble == 1 && i >= 4);
		});
	}

	function viewFindBinBit(indexBit) {
		var $byte = viewFindBinByte(Math.floor(indexBit / 8 + 0.0625));

		return $byte.find("span").eq(7 - (indexBit % 8));
	}

	function viewFindHexByte(index) {
		return $outputHex.find("> span").eq(index);
	}

	function viewFindHexNibble(indexByte, indexNibble) {
		return viewFindHexByte(indexByte).find("span").eq(indexNibble);
	}

	function viewFindHexNibbleFromIndexBit(indexBit) {
		return viewFindHexNibble(Math.floor(indexBit / 8 + 0.0625), (((7 - (indexBit % 8)) < 4) ? 0 : 1))
	}

	function modelAddHoverBinState($hover) {
		state.bin.$hover = state.bin.$hover.add($hover);
	}

	function modelAddHoverHexState($hover) {
		state.hex.$hover = state.hex.$hover.add($hover);
	}

	function modelHoverBinState(hoverState) {
		state.bin.$hover = hoverState;
	}

	function modelHoverHexState(hoverState) {
		state.hex.$hover = hoverState;
	}

	function modelResetHoverBinState() {
		state.bin.$hover = $("");
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

		viewUnhoverBinState();
		modelResetHoverBinState();

		if (!!$hoveredEl.data("$hover")) {
			$hoveredEl.data("$hover").addClass("hover");
		}

		updateHoverHexFromBin(indexByte, indexNibble);
	}

	function handleMouseleaveBin() {
		var $hoveredEl = $(this);

		viewUnhoverHexState();

		modelResetHoverHexState();

		if (!!$hoveredEl.data("$hover")) {
			$hoveredEl.data("$hover").removeClass("hover");
		}
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

	function handleHoverRequested(e, data) {
		var bitIndex;

		e = e;

		viewUnhoverHexState();
		modelResetHoverHexState();

		viewUnhoverBinState();
		modelResetHoverBinState();

		for (bitIndex = data.from; bitIndex < data.to; bitIndex += 1) {
			modelAddHoverBinState(viewFindBinBit(bitIndex));
			modelAddHoverHexState(viewFindHexNibbleFromIndexBit(bitIndex));
		}

		viewHoverBinState();
		viewHoverHexState();
	}

	function handleRegisterRequested(e, data) {
		var bitIndex;

		e = e;

		for (bitIndex = data.from; bitIndex < data.to; bitIndex += 1) {
			viewAddHoverDataBinState(viewFindBinBit(bitIndex), data.$el);
		}
	}

	function handleUnhoverRequested() {
		viewUnhoverHexState();
		modelResetHoverHexState();

		viewUnhoverBinState();
		modelResetHoverBinState();
	}

	$outputHex
		.on("mouseenter", "> span > span", handleMouseenterHex)
		.on("mouseleave", "> span > span", handleMouseleaveHex);

	$outputBin
		.on("mouseenter", "> span > span", handleMouseenterBin)
		.on("mouseleave", "> span > span", handleMouseleaveBin);

	$output
		.on("register/requested", handleRegisterRequested)
		.on("hover/requested", handleHoverRequested)
		.on("unhover/requested", handleUnhoverRequested);
});