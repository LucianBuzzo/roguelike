const Player = function Player() {
  var playerImageMoving = new Image();
  playerImageMoving.src = './assets/player/player-spritesheet.png';

  var playerImageIdle = new Image();
  playerImageIdle.src = './assets/player/player-idle.png';

  this.loaded = false;
  this.speed = 6;
  this.imgMoving = playerImageMoving;
  this.imgIdle = playerImageIdle;
  this.width = 128;
  this.height = 128;
  this.frame = 0;
  this.tickCount = 0;
  this.direction = 'down';
  this.moving = false;
  this.frames = {
    up: [
      { x: 0, y: 0 },
      { x: 128, y: 0 },
      { x: 256, y: 0 },
      { x: 384, y: 0 },
      { x: 512, y: 0 },
      { x: 640, y: 0 },
      { x: 768, y: 0 },
      { x: 896, y: 0 },
      { x: 1024, y: 0 },
      { x: 1152, y: 0 },
      { x: 1280, y: 0 },
      { x: 1408, y: 0 },
    ],
    down: [
      { x: 0, y: 128 },
      { x: 128, y: 128 },
      { x: 256, y: 128 },
      { x: 384, y: 128 },
      { x: 512, y: 128 },
      { x: 640, y: 128 },
      { x: 768, y: 128 },
      { x: 896, y: 128 },
      { x: 1024, y: 128 },
      { x: 1152, y: 128 },
      { x: 1280, y: 128 },
      { x: 1408, y: 128 },
    ],
    left: [
      { x: 0, y: 256 },
      { x: 128, y: 256 },
      { x: 256, y: 256 },
      { x: 384, y: 256 },
      { x: 512, y: 256 },
      { x: 640, y: 256 },
      { x: 768, y: 256 },
      { x: 896, y: 256 },
      { x: 1024, y: 256 },
      { x: 1152, y: 256 },
      { x: 1280, y: 256 },
      { x: 1408, y: 256 },
    ],
    right: [
      { x: 0, y: 384 },
      { x: 128, y: 384 },
      { x: 256, y: 384 },
      { x: 384, y: 384 },
      { x: 512, y: 384 },
      { x: 640, y: 384 },
      { x: 768, y: 384 },
      { x: 896, y: 384 },
      { x: 1024, y: 384 },
      { x: 1152, y: 384 },
      { x: 1280, y: 384 },
      { x: 1408, y: 384 },
    ],
  };
  this.idleFrames = {
    up: { x: 0, y: 0 },
    down: { x: 0, y: 128 },
    left: { x: 0, y: 256 },
    right: { x: 0, y: 384 },
  };
};

Player.prototype.render = function render(ctx) {
  if (this.moving) {
    ctx.drawImage(
      this.imgMoving,
      this.frames[this.direction][this.frame].x,
      this.frames[this.direction][this.frame].y,
      this.width,
      this.height,
      ctx.canvas.width / 2 - this.width / 2,
      ctx.canvas.height / 2 - this.height / 2,
      this.width,
      this.height
    );
  } else {
    ctx.drawImage(
      this.imgIdle,
      this.idleFrames[this.direction].x,
      this.idleFrames[this.direction].y,
      this.width,
      this.height,
      ctx.canvas.width / 2 - this.width / 2,
      ctx.canvas.height / 2 - this.height / 2,
      this.width,
      this.height
    );
    return;
  }

  this.tickCount++;

  if (this.tickCount < 5) {
    return;
  }

  this.tickCount = 0;
  this.frame++;
  if (this.frame >= this.frames[this.direction].length) {
    this.frame = 0;
  }
};

Player.prototype.update = function update(velocity, position) {
   this.rotation = Math.min(velocity / 10 * 90, 90);
   this.position = position;
};

Player.prototype.getBoundingBox = function getBoundingBox() {
  return {
    top: this.position,
    right: this.width + 60,
    bottom: this.position + this.height,
    left: 60
  };
};

module.exports = new Player();
