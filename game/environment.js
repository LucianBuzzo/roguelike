var Dungeon = require('./dungeonGenerator.js');

var Environment = function Environment() {
  this.numTilesX = 51;
  this.numTilesY = 51;
  this.dungeon = new Dungeon().generate({
    width: this.numTilesX,
    height: this.numTilesY
  });

  this.tileWidth = 80;
  this.tileHeight = 40;

  this.debug = global.DEBUG;
  this.x = 0;
  this.y = 0;
  this.bounds = [{
    top: 80,
    left: -4,
    right: -1,
    bottom: 110
  }];
};

Environment.prototype.update = function update() {
};

Environment.prototype.render = function render(ctx, camera) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.save();

  ctx.translate(camera.offsetX, camera.offsetY);

  ctx.fillStyle = 'red';

  this.dungeon.rooms.forEach((room) => {
    ctx.fillRect(
      room.x * this.tileWidth,
      room.y * this.tileHeight,
      room.width * this.tileWidth,
      room.height * this.tileHeight
    );
  });

  for (var i = 0; i < this.dungeon.tiles.length; i++) {
    for (var j = 0; j < this.dungeon.tiles.length; j++) {
      if (this.dungeon.tiles[i][j].type === 'floor') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(i * this.tileWidth, j * this.tileHeight, this.tileWidth, this.tileHeight);
      }
      if (this.dungeon.tiles[i][j].type === 'door') {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(i * this.tileWidth, j * this.tileHeight, this.tileWidth, this.tileHeight);
      }
    }
  }


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
  // ctx.drawImage(this.foregroundImg, 0, 0);
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
