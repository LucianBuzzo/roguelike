var Environment = function Environment() {
  var img = new Image();
  img.src = './assets/environment/background-tile.png';
  this.img = img;
  this.x = 0;
  this.y = 0;
  this.height = 128;
  this.width = 128;
};

Environment.prototype.update = function update(dir, speed) {
  if (dir === 'up') {
    this.y += speed;
  }
  if (dir === 'down') {
    this.y -= speed;
  }
  if (dir === 'left') {
    this.x += speed;
  }
  if (dir === 'right') {
    this.x -= speed;
  }
  if (Math.abs(this.x) >= this.width) {
    this.x = 0;
  }
  if (Math.abs(this.y) >= this.height) {
    this.y = 0;
  }
};

Environment.prototype.render = function render(ctx) {
  var pattern = ctx.createPattern(this.img, 'repeat');

  ctx.save();

  ctx.translate(this.x, this.y);
  ctx.fillStyle = pattern;
  ctx.fillRect(0 - this.width, 0 - this.height, ctx.canvas.width + this.width * 2, ctx.canvas.width + this.height * 2);

  ctx.restore();
};

module.exports = new Environment();
