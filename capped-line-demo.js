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
	 * @param {(HTMLElement?)=} parent - if provided, the element will be appended and rendered
	**/
	constructor (width, height, color, parent) {
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
		if (parent) {
			parent.appendChild(outer);
			this.render();
		}
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

class ValidatedInput {
	/**
	 * @param {string|number} value
	 * @param {ValidatedInputManager!} manager
	**/
	constructor (value, manager) {
		var input = document.createElement('input');
		this._input = input;
		input.onchange = input.onkeyup = input.oninput = this._handleInputChange.bind(this);
		input.onblur = this._handleInputBlur.bind(this);
		input.value = value;
		this._value = value;
		this._manager = manager;
		// to ensure no closure memory leakage
		this._selectInputBound = this._selectInput.bind(this);
	}
	
	/**
	 * @return {HTMLElement!}
	**/
	getElement () {	
		return this._input;
	}
	
	_handleInputChange () {
		var newValue = this._manager.cleanValue(this._input.value);
		if (newValue === this._value) {
			this._input.value = newValue;
			return true;
		}
		if (!this._manager.testValue(newValue)) {
			return false;
		}
		this._value = newValue;
		this._manager.handleSet(newValue);
		this._input.value = newValue;
		return true;
	}
	
	_handleInputBlur () {
		if (!this._handleInputChange()) {
			var badValue = this._input.value;
			this._input.value = this._value;
			alert(this._manager.getInvalidMessage(badValue));
			var input = this._input;
			window.setTimeout(this._selectInputBound, 0);
		}
	}
	
	_selectInput () {
		this._input.select();
	}
}

class ValidatedInputManager {
	/**
	 * @param {(Function?)=} onSet
	**/
	constructor (onSet) {
		this._onSet = onSet;
	}
	/**
	 * @param {string} value
	 * @return {string}
	**/
	cleanValue (value) {
		return value;
	}
	/**
	 * @param {string} value
	 * @return {string}
	**/
	getInvalidMessage (value) {
		return "Invalid value '" + value + "'";
	}
	/**
	 * @param {string} value
	**/
	handleSet (value) {
		if (this._onSet) this._onSet(value);
	}
	/**
	 * @param {string} value
	 * @return {boolean}
	**/
	testValue (value) {
		return true;
	}
}

class PosIntInputManager extends ValidatedInputManager {
	constructor (fieldName, onSet) {
		super(onSet);
		this._fieldName = fieldName;
	}
	cleanValue (value) {
		return parseInt(value, 10);
	}
	getInvalidMessage (value) {
		return "Invalid value: " + this._fieldName + " must be a positive integer ('" + value + "' given)";
	}
	testValue (value) {
		return isPosInt(value);
	}
}

class HexColorInputManager extends ValidatedInputManager {
	constructor (fieldName, onSet) {
		super(onSet);
		this._fieldName = fieldName;
	}
	cleanValue (value) {
		return value.replace(/[\#\s]+/, '');
	}
	getInvalidMessage (value) {
		return "Invalid value: " + this._fieldName + " must be a hex color string ('" + value + "' given)";
	}
	testValue (value) {
		return /^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value)
	}
}

class PosIntInput {
	constructor (num, fieldName, onSet) {
		var validatedInput = new ValidatedInput(num, new PosIntInputManager(fieldName, onSet));
		var input = validatedInput.getElement();
		input.type = 'number';
		input.min = 1;
		this._input = validatedInput;
	}
	getElement () {
		return this._input.getElement();
	}
}

class HexColorInput {
	constructor (color, fieldName, onSet) {
		var validatedInput = new ValidatedInput(color, new HexColorInputManager(fieldName, onSet));
		var input = validatedInput.getElement();
		input.type = 'text';
		this._input = validatedInput;
	}
	getElement () {
		return this._input.getElement();
	}
}

function labelElement (text, element) {
	var label = document.createElement("label");
	label.appendChild(document.createTextNode(text + ": "));
	label.appendChild(element);
	return label;
}

function makeSpacedRow (elements, space) {
	var p = document.createElement('p');
	var lenMinusOne = elements.length - 1;
	for (var i = 0; i <= lenMinusOne; i++) {
		if (i < lenMinusOne) {
			elements[i].style.marginRight = space;
		}
		p.appendChild(elements[i]);
	}
	return p;
}

class CappedLineDemo {

	/**
	 * @param {HTMLElement!} parent
	**/
	constructor (parent) {
		this._width = 100;
		this._height = 30;
		this._color = '0000ff';
		
		var controls = [
			labelElement(
				'Width',
				(new PosIntInput(this._width, 'width', this._handleWidthSet.bind(this))).getElement()
			),
			labelElement(
				'Height',
				(new PosIntInput(this._height, 'height', this._handleHeightSet.bind(this))).getElement()
			),
			labelElement('Color',
				(new HexColorInput(this._color, 'color', this._handleColorSet.bind(this))).getElement()
			)
		];
		
		controls.forEach(x => { x.style.width = CappedLineDemo.INPUT_WIDTH; });
		parent.appendChild(makeSpacedRow(controls, CappedLineDemo.INTER_INPUT_SPACE));
		
		this._line = new CappedLine(
			this._width, this._height, '#' + this._color,
			parent.appendChild(document.createElement('p'))
		);
	}
	
	_handleColorSet (color ) {
		this._line.setColor('#' + color);
	}
	
	_handleHeightSet (height) {
		this._line.setHeight(height);
	}
	
	_handleWidthSet (width) {
		this._line.setWidth(width);
	}
	
}

CappedLineDemo.INTER_INPUT_SPACE = '5px';
CappedLineDemo.INPUT_WIDTH = '75px';

// CappedLine.log = console.log.bind(console);
// CappedLineDemo.log = console.log.bind(console);
// throttle.log = console.log.bind(console);

window.addEventListener('load', function () {
	new CappedLineDemo(document.body);
	document.getElementById('es6-required-msg-div').style.display = 'none';
});