const Camera = function Camera(canvas, startX, startY) {
	this.offsetX = startX - canvas.width / 2;
	this.offsetY = startY - canvas.height / 2;
	this.width = canvas.width;
	this.height = canvas.height;
};

Camera.prototype.update = function update(ctx, player) {
//  this.offsetX = ctx.canvas.width / 2 - player.x - player.width;
//  this.offsetY = ctx.canvas.height / 2 - player.y - player.height;
  this.offsetX = ctx.canvas.width / 2 - player.x - player.width;
  this.offsetY = ctx.canvas.height / 2 - player.y - player.height;
};

module.exports = Camera;
