/**
 * @param {number} x
 * @return {boolean}
**/
function isPosInt (x) {
	// the first test tests for not NaN, finite and not float
	return (x === (x | 0)) && x > 0;
}

class CappedLine {

	/**
	 * @param {number} width
	 * @param {number} height
	 * @param {string} color
	**/
	constructor (width, height, color) {
		this._width = width;
		this._height = height;
		this._color = color;
		var outer = document.createElement("div");
		outer.style.position = 'relative';
		// prevent it from breaking and separating the pieces when it gets long
		outer.style.whiteSpace = 'nowrap';
		this._outer = outer;
		this._leftCap = outer.appendChild(CappedLine.makeCap(CappedLine.Side.LEFT));
		var middle = outer.appendChild(document.createElement("div"));
		middle.style.display = 'inline-block';
		middle.style.height = '100%';
		this._middle = middle;
		this._rightCap = outer.appendChild(CappedLine.makeCap(CappedLine.Side.RIGHT));
	}

	/**
	 * @param {CappedLine.Side!} side
	 * @return {HTMLDivElement!}
	**/
	static makeCap (side) {
		var cap = document.createElement("div");
		cap.style.display = 'inline-block';
		cap.style.height = '100%';
		cap.style.borderRadius = (side === CappedLine.Side.LEFT) ? '50% 0 0 50%' : '0 50% 50% 0';
		return cap;
	}
	
	/**
	 * @return {HTMLDivElement!}
	**/
	getElement () {
		return this._outer;
	}

	render () {
		// if not attached to the DOM, nothing to render
		if (!this._outer.parentNode) return;
		var capWidth = this._height;
		var middleWidth = this._width - (2 * capWidth);
		if (middleWidth < 0) {
		 capWidth -= Math.floor(-middleWidth / 2);
		 middleWidth = 0;
		}
		if (CappedLine.log) CappedLine.log("Rendering dims: cap width: " + capWidth + 
			", middle width: " + middleWidth + ", height: " + this._height);
		this._outer.style.height = this._height + 'px';
		this._leftCap.style.width = 
			this._rightCap.style.width = capWidth + 'px';
		this._leftCap.style.backgroundColor = this._rightCap.style.backgroundColor = this._color;
		this._middle.style.width = middleWidth + 'px';
		this._middle.style.backgroundColor = this._color;
	}
	
	setColor (color) {
		this._color = color
		this.render();
	}
	
	setHeight (height) {
		this._height = height;
		this.render();
	}

	setWidth (width) {
		this._width = width;
		this.render();
	}
	
}

CappedLine.log = null;
CappedLine.Side = {LEFT: 1, RIGHT: 2};

class CappedLineDemo {

	/**
	 * @param {HTMLElement!} parent
	**/
	constructor (parent) {
		this._width = 100;
		this._height = 30;
		this._color = '0000ff';
		var p1 = parent.appendChild(document.createElement('p'));
		
		var label = p1.appendChild(document.createElement("label"));
		label.appendChild(document.createTextNode("Width: "));
		var widthInput = label.appendChild(document.createElement("input"));
		widthInput.type = 'number';
		widthInput.min = 1;
		widthInput.style.width = '75px';
		widthInput.value = this._width;
		widthInput.style.marginRight = '5px';
		widthInput.onchange = widthInput.onkeyup = widthInput.oninput = this._handleWidthInputChange.bind(this);
		widthInput.onblur = this._handleWidthInputBlur.bind(this);
		this._widthInput = widthInput;
		
		var label = p1.appendChild(document.createElement("label"));
		label.appendChild(document.createTextNode("Height: "));
		var heightInput = label.appendChild(document.createElement("input"));
		heightInput.type = 'number';
		heightInput.min = 1;
		heightInput.style.width = '75px';
		heightInput.value = this._height;
		heightInput.style.marginRight = '5px';
		heightInput.onchange = heightInput.onkeyup = heightInput.oninput = this._handleHeightInputChange.bind(this);
		heightInput.onblur = this._handleHeightInputBlur.bind(this);
		this._heightInput = heightInput;
		
		var label = p1.appendChild(document.createElement("label"));
		label.appendChild(document.createTextNode("Color: "));
		var colorInput = label.appendChild(document.createElement("input"));
		colorInput.type = 'text';
		colorInput.style.width = '75px';
		colorInput.value = this._color;
		colorInput.onchange = colorInput.onkeyup = colorInput.oninput = this._handleColorInputChange.bind(this);
		colorInput.onblur = this._handleColorInputBlur.bind(this);
		this._colorInput = colorInput;
		
		this._line = new CappedLine(this._width, this._height, '#' + this._color);
		var p2 = parent.appendChild(document.createElement('p'));
		p2.appendChild(this._line.getElement());
		this._line.render();
	}
	
	_handleColorInputBlur (event) {
		if (!this._handleColorInputChange()) {
			this._colorInput.value = this._color;	
			alert("Invalid color value (must be hex such as ffffff)");
			this._colorInput.select();
			var colorInput = this._colorInput;
			window.setTimeout(function () { colorInput.select() }, 0);
		}
	}
	
	_handleColorInputChange () {
		var newColor = this._colorInput.value.replace(/[\#\s]+/, '');
		if (newColor === this._color) {
			this._colorInput.value = newColor;
			return true;
		}
		if (!/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(newColor)) {
			return false;
		}
		this._color = newColor;
		this._line.setColor('#' + newColor);
		this._colorInput.value = newColor;
		return true;
	}
	
	_handleHeightInputBlur (event) {
		if (!this._handleHeightInputChange()) {
			this._heightInput.value = this._height;
			alert("Height must be a positive integer");
			var heightInput = this._heightInput;
			window.setTimeout(function () { heightInput.select() }, 0);
		}
	}
		
	_handleHeightInputChange () {
		var newHeight = parseInt(this._heightInput.value, 10);
		if (newHeight === this._height) return true;
		if (!isPosInt(newHeight)) {
			return false;
		}
		this._line.setHeight(newHeight);
		this._heightInput.value = newHeight;
		this._width = newHeight;
		return true;
	}
	
	_handleWidthInputBlur (event) {
		if (!this._handleWidthInputChange()) {
			this._widthInput.value = this._width;
			alert("Width must be a positive integer");
			var widthInput = this._widthInput;
			window.setTimeout(function () { widthInput.select() }, 0);
		}
	}
	
	_handleWidthInputChange () {
		var newWidth = parseInt(this._widthInput.value, 10);
		if (newWidth === this._width) return true;
		if (!isPosInt(newWidth)) {
			return false;
		}
		this._line.setWidth(newWidth);
		this._widthInput.value = newWidth;
		this._width = newWidth;
		return true;
	}
	
}

// CappedLine.log = console.log.bind(console);
// CappedLineDemo.log = console.log.bind(console);
// throttle.log = console.log.bind(console);

window.addEventListener('load', function () {
	new CappedLineDemo(document.body);
	document.getElementById('es6-required-msg-div').style.display = 'none';
});