var Environment = function Environment() {
  var img = new Image();
  img.src = './assets/environment/street/street1-small.png';

  var foregroundImg = new Image();
  foregroundImg.src = './assets/environment/street/street1-foreground.png';

  var backgroundImg1 = new Image();
  backgroundImg1.src = './assets/environment/street/street1-background1.png';

  var backgroundImg2 = new Image();
  backgroundImg2.src = './assets/environment/street/street1-background2.png';

  this.debug = global.DEBUG;
  this.img = img;
  this.foregroundImg = foregroundImg;
  this.backgroundImgs = [backgroundImg1, backgroundImg2];
  this.bgImageIndex = 0;
  this.x = 0;
  this.y = 0;
  this.height = 500;
  this.width = 500;
  this.bounds = [{
    top: 80,
    left: -4,
    right: -1,
    bottom: 110
  }, {
    top: 80,
    left: 188,
    right: 200,
    bottom: 96
  }, {
    top: 122,
    left: 188,
    right: 500,
    bottom: 400
  }, {
    top: 80,
    left: 203,
    right: 500,
    bottom: 120
  }, {
    top: 105,
    left: 0,
    right: 96,
    bottom: 365
  }, {
    top: 0,
    left: 0,
    right: 500,
    bottom: 82
  }];
};

Environment.prototype.update = function update() {
  this.bgImageIndex++;
  if (this.bgImageIndex > 100) {
    this.bgImageIndex = 0;
  }
};

Environment.prototype.render = function render(ctx, camera) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.save();

  ctx.translate(camera.offsetX, camera.offsetY);

  let index = this.bgImageIndex < 50 ? 0 : 1;
  ctx.drawImage(this.backgroundImgs[index], 40 - camera.offsetX / 5, 40 - camera.offsetY / 5);

  ctx.drawImage(this.img, 0, 0);


  if (this.debug) {
    ctx.strokeStyle = 'red';
    this.bounds.forEach((box) => {
      ctx.strokeRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
    });
  }

  ctx.restore();
};

Environment.prototype.renderForeground = function renderForeground(ctx, camera) {
  ctx.save();
  ctx.translate(camera.offsetX, camera.offsetY);
  ctx.drawImage(this.foregroundImg, 0, 0);
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
