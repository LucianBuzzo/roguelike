const Player = function Player() {
  var playerImageMoving = new Image();
  playerImageMoving.src = './assets/player/player-spritesheet.png';

  var playerImageIdle = new Image();
  playerImageIdle.src = './assets/player/player-idle.png';

  this.debug = global.DEBUG;
  this.loaded = false;
  this.speed = 2;
  this.imgMoving = playerImageMoving;
  this.imgIdle = playerImageIdle;
  this.width = 32;
  this.height = 32;
  this.frame = 0;
  this.tickCount = 0;
  this.x = 12;
  this.y = 65;
  this.direction = [];
  this.moving = false;
  this.frames = {
    up: [
      { x: 0, y: 0 },
      { x: 32, y: 0 },
      { x: 64, y: 0 },
      { x: 96, y: 0 },
      { x: 128, y: 0 },
      { x: 160, y: 0 },
      { x: 192, y: 0 },
      { x: 224, y: 0 },
      { x: 256, y: 0 },
      { x: 288, y: 0 },
      { x: 320, y: 0 },
      { x: 352, y: 0 },
    ],
    down: [
      { x: 0, y: 32 },
      { x: 32, y: 32 },
      { x: 64, y: 32 },
      { x: 96, y: 32 },
      { x: 128, y: 32 },
      { x: 160, y: 32 },
      { x: 192, y: 32 },
      { x: 224, y: 32 },
      { x: 256, y: 32 },
      { x: 288, y: 32 },
      { x: 320, y: 32 },
      { x: 352, y: 32 },
    ],
    left: [
      { x: 0, y: 64 },
      { x: 32, y: 64 },
      { x: 64, y: 64 },
      { x: 96, y: 64 },
      { x: 128, y: 64 },
      { x: 160, y: 64 },
      { x: 192, y: 64 },
      { x: 224, y: 64 },
      { x: 256, y: 64 },
      { x: 288, y: 64 },
      { x: 320, y: 64 },
      { x: 352, y: 64 },
    ],
    right: [
      { x: 0, y: 96 },
      { x: 32, y: 96 },
      { x: 64, y: 96 },
      { x: 96, y: 96 },
      { x: 128, y: 96 },
      { x: 160, y: 96 },
      { x: 192, y: 96 },
      { x: 224, y: 96 },
      { x: 256, y: 96 },
      { x: 288, y: 96 },
      { x: 320, y: 96 },
      { x: 352, y: 96 },
    ],
  };
  this.idleFrames = {
    up: { x: 0, y: 0 },
    down: { x: 0, y: 32 },
    left: { x: 0, y: 64 },
    right: { x: 0, y: 96 },
  };
};

Player.prototype.render = function render(ctx, camera) {
  var dir = this.direction.length ? this.direction[0] : 'down';
  ctx.save();

  ctx.translate(camera.offsetX, camera.offsetY);

  if (this.debug) {
    let box = this.getBB();
    ctx.strokeStyle = 'red';
    ctx.strokeRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
  }


  if (this.moving) {
    ctx.drawImage(
      this.imgMoving,
      this.frames[dir][this.frame].x,
      this.frames[dir][this.frame].y,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  } else {
    ctx.drawImage(
      this.imgIdle,
      this.idleFrames[dir].x,
      this.idleFrames[dir].y,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
    ctx.restore();
    return;
  }
  ctx.restore();

  this.tickCount++;

  if (this.tickCount < 5) {
    return;
  }

  this.tickCount = 0;
  this.frame++;
  if (this.frame >= this.frames[dir].length) {
    this.frame = 0;
  }
};

Player.prototype.update = function update(environment) {
  let speed = this.speed;
  let origY = this.y;
  let origX = this.x;
  this.direction.forEach(dir => {
    if (dir === 'up') {
      this.y -= speed;
    }
    if (dir === 'down') {
      this.y += speed;
    }
    if (dir === 'left') {
      this.x -= speed;
    }
    if (dir === 'right') {
      this.x += speed;
    }
  });

  // Chec to see if we bumped into anything! if we did, reset the position
  if (environment.isOutOfBounds(this.getBB())) {
    this.x = origX;
    this.y = origY;
  }
};

// Returns bounding box, this is the players 'footprint';
Player.prototype.getBB = function getBoundingBox() {
  return {
    top: this.y + this.height - 7,
    right: this.x + this.width - 6,
    bottom: this.y + this.height,
    left: this.x + 6,
  };
};

Player.prototype.addDirection = function addDirection(dir) {
  if (this.direction.indexOf(dir) === -1) {
    this.direction.push(dir);
  }
  this.moving = this.direction.length > 0;
};

Player.prototype.removeDirection = function removeDirection(dir) {
  this.direction = this.direction.filter(d => d !== dir);
  this.moving = this.direction.length > 0;
};

module.exports = new Player();
