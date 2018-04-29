var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var centerX = 100;
var centerY = 100;
var ratio = (2 * Math.PI) / 360;
for (var h = 0; h < 360; h++) {
	for (var l = 0; l < 100; l++) {
		context.fillStyle = 'hsl(' + h + ', 100%' + ', ' + l + '%)';
		var x = centerX + l * Math.cos(h * ratio);
		var y = centerY - l * Math.sin(h * ratio);
		context.fillRect(x, y, 1, 1);
	}
}
canvas.addEventListener('click', function (event) {
	var rect = canvas.getBoundingClientRect();
	var x = event.clientX - rect.left - centerX;
	var y = event.clientY - rect.top - centerY;
	var l = Math.sqrt(x ** 2 + y ** 2);
	var h = Math.atan2(-y, x) / ratio;
	var color = document.getElementById('color');
	var theColor = 'hsl(' + Math.floor(h) + ', 100%, ' + Math.floor(l) + '%)';
	color.innerHTML = theColor;
	color.style.color = theColor;
});	