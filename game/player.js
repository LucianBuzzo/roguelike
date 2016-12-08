const Player = function Player() {
  var playerImageMoving = new Image();
  playerImageMoving.src = './assets/player/knight-idle.png';

  var playerImageIdle = new Image();
  playerImageIdle.src = './assets/player/knight-idle.png';

  this.debug = global.DEBUG;
  this.loaded = false;
  this.speed = 2;
  this.imgMoving = playerImageMoving;
  this.imgIdle = playerImageIdle;
  this.width = 64;
  this.height = 64;
  this.frame = 0;
  this.tickCount = 0;
  this.x = 80;
  this.y = 80;
  this.idleDirection = 'down';
  this.direction = [];
  this.moving = false;
  this.frames = {
    up: [{ x: 0, y: 0 }],
    down: [{ x: 64, y: 0 }],
    left: [{ x: 128, y: 0 }],
    right: [{ x: 192, y: 0 }],
  };
  this.idleFrames = {
    up: { x: 0, y: 0 },
    down: { x: 64, y: 0 },
    left: { x: 128, y: 0 },
    right: { x: 192, y: 0 },
  };
};

Player.prototype.render = function render(ctx, camera) {
  var dir = this.moving ? this.direction[0] : this.idleDirection;
  ctx.save();

  let [posX, posY] = [this.x, this.y];

  ctx.translate(camera.offsetX, camera.offsetY);

  if (this.debug) {
    let box = this.getBB();
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'red';
    let boxWidth = box.right - box.left;
    let boxHeight = box.bottom - box.top;
    ctx.moveTo(box.left, box.top);

    ctx.lineTo(box.left + boxWidth / 2, box.top + boxHeight / 2);

    ctx.lineTo(box.left, box.top + boxHeight);

    ctx.lineTo(box.left - boxWidth / 2, box.top + boxHeight / 2);

    ctx.lineTo(box.left, box.top);


    ctx.stroke();
  }


  if (this.moving) {
    ctx.drawImage(
      this.imgMoving,
      this.frames[dir][this.frame].x,
      this.frames[dir][this.frame].y,
      this.width,
      this.height,
      posX,
      posY,
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
      posX,
      posY,
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
  let boundY = this.y + this.height / 2;
  let boundX = this.x + this.width / 2;

  return {
    top: boundY,
    left: boundX,
    right: boundX + this.width,
    bottom: boundY + this.width / 2
  };
};

Player.prototype.addDirection = function addDirection(dir) {
  if (this.direction.indexOf(dir) === -1) {
    this.direction.push(dir);
  }
  this.moving = true;
  this.idleDirection = dir;
};

Player.prototype.removeDirection = function removeDirection(dir) {
  this.direction = this.direction.filter(d => d !== dir);
  this.moving = this.direction.length > 0;
};

module.exports = new Player();
