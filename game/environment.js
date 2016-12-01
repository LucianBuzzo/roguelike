var Environment = function Environment() {
  var img = new Image();
  img.src = './assets/environment/street/street1-small.png';
  this.img = img;
  this.x = 0;
  this.y = 0;
  this.height = 2000;
  this.width = 2000;
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
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.save();

  ctx.translate(this.x, this.y);
  ctx.drawImage(this.img, 0, 0);

  ctx.restore();
};

module.exports = new Environment();
