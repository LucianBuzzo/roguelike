var Environment = function Environment() {
  var img = new Image();
  img.src = './assets/environment/street/street1-small.png';
  this.img = img;
  this.x = 0;
  this.y = 0;
  this.height = 500;
  this.width = 500;
  this.bounds = [{
    top: 0,
    left: 188,
    right: 500,
    bottom: 500
  }];
};

Environment.prototype.update = function update(dirs, speed) {
  dirs.forEach(dir => {
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
  });
};

Environment.prototype.render = function render(ctx) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.save();

  ctx.translate(this.x, this.y);
  ctx.drawImage(this.img, 0, 0);

  ctx.restore();
};

const intersectRect = function intersectRect(r1, r2) {
  return !(r2.left > r1.right ||
           r2.right < r1.left ||
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
};


Environment.prototype.isOutOfBounds = function(boundingBox) {
  let oob = false;
  for (var i = 0; i < this.bounds.length; i++) {
    if (intersectRect(boundingBox, this.bounds[i])) {
      oob = true;
      break;
    }
  }

  return oob;
};

module.exports = new Environment();
