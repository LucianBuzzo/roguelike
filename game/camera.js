const Camera = function Camera(canvas, startX, startY) {
	this.x = startX;
	this.y = startY
	this.width = canvas.width;
	this.height = canvas.height;
}

Camera.prototype.update = function update(x, y) {
	
}

module.exports = Camera;