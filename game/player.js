const DIR_UP = 0;
const DIR_DOWN = 1;
const DIR_LEFT = 2;
const DIR_RIGHT = 3;

const Player = function Player() {
  var playerImageMoving = new Image();
  playerImageMoving.src = './assets/player/knight-idle.png';

  var playerImageIdle = new Image();
  playerImageIdle.src = './assets/player/knight-idle.png';

  this.path = [];
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
  this.idleDirection = DIR_DOWN;
  this.direction = [];
  this.moving = false;
  this.frameSize = 64;
  this.rotation = 0;
};

Player.prototype.render = function render(ctx, camera) {
  var dir = this.idleDirection;
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

    if (this.path.length) {
      let playerBB = this.getBB();
      let centerX = playerBB.left;
      let centerY = playerBB.top + (playerBB.bottom - playerBB.top) / 2;

      ctx.moveTo(centerX, centerY);
      this.path.forEach(([x, y]) => {
        ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }

  if (this.moving) {
    ctx.drawImage(
      this.imgMoving,
      this.frame * this.frameSize,
      dir * this.frameSize,
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
      this.frame * this.frameSize,
      dir * this.frameSize,
      this.width,
      this.height,
      posX,
      posY,
      this.width,
      this.height
    );
  }

  ctx.restore();

  this.tickCount++;

  if (this.tickCount < 10) {
    return;
  }

  this.tickCount = 0;
  this.frame++;

  if (this.frame >= 4) {
    this.frame = 0;
  }
};

Player.prototype.update = function update() {
  let speed = this.speed;
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

  if (this.path.length) {
    let [waypointX, waypointY] = this.path[0];
    let playerBB = this.getBB();
    let centerX = playerBB.left;
    let centerY = playerBB.top + (playerBB.bottom - playerBB.top) / 2;
    var run = waypointX - centerX;
    var rise = waypointY - centerY;
    var length = Math.sqrt(rise * rise + run * run);

    if (length > speed) {
      let ratio = speed / length;
      var unitX = ratio * run;
      var unitY = ratio * rise;

      this.x += Math.round(unitX);
      this.y += Math.round(unitY);

      this.rotation = Math.atan2(run, rise) * 180 / Math.PI + 180;
    } else {
      this.path.splice(0, 1);
    }
  }

  if (this.rotation > 315 || this.rotation <= 45) {
    this.idleDirection = DIR_UP;
  } else if (this.rotation > 45 && this.rotation <= 135) {
    this.idleDirection = DIR_LEFT;
  } else if (this.rotation > 135 && this.rotation <= 225) {
    this.idleDirection = DIR_DOWN;
  } else {
    this.idleDirection = DIR_RIGHT;
  }
};

// Returns bounding box, this is the players 'footprint';
Player.prototype.getBB = function getBoundingBox() {
  let boundY = this.y + this.height / 2 + 4;
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

Player.prototype.setPath = function setPath(path) {
  this.path = path;
};

module.exports = new Player();
