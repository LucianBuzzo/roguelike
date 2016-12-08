const Camera = function Camera(canvas, startX, startY) {
	this.offsetX = startX - canvas.width / 2;
	this.offsetY = startY - canvas.height / 2;
	this.width = canvas.width;
	this.height = canvas.height;
};

Camera.prototype.update = function update(ctx, player) {
  this.offsetX = ctx.canvas.width / 2 - player.x - player.width / 2;
  this.offsetY = ctx.canvas.height / 2 - player.y - player.height / 2;
};

module.exports = Camera;
