var Dungeon = require('./dungeonGenerator.js');

var Environment = function Environment() {
  this.numTilesX = 51;
  this.numTilesY = 51;
  this.dungeon = new Dungeon().generate({
    width: this.numTilesX,
    height: this.numTilesY
  });

  // this.tileWidth = 80;
  // this.tileHeight = 40;
  this.tileWidth = 10;
  this.tileHeight = 5;

  this.debug = global.DEBUG;
  this.x = 0;
  this.y = 0;
  this.bounds = [];

  this.setBounds();
};

Environment.prototype.setBounds = function setBounds() {
  this.bounds = [];

  for (var i = 0; i < this.dungeon.tiles.length; i++) {
    for (var j = 0; j < this.dungeon.tiles.length; j++) {
      if (this.dungeon.tiles[i][j].type === 'wall') {
        this.bounds.push({
          top: j * this.tileHeight,
          left: i * this.tileWidth,
          right: i * this.tileWidth + this.tileWidth,
          bottom: j * this.tileHeight + this.tileHeight
        });
      }
    }
  }
};

Environment.prototype.findStart = function findStart() {
  var startX;
  var startY;
  for (var x = 0; x < this.dungeon.tiles.length; x++) {
    for (var y = 0; y < this.dungeon.tiles.length; y++) {
      if (this.dungeon.tiles[x][y].type !== 'wall') {
        startX = x * this.tileWidth;
        startY = y * this.tileHeight;
      }
    }
  }
  let isoX = startX - startY;
  let isoY = (startX + startY) / 2;

  return [isoX, isoY];
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
        // ctx.fillRect(i * this.tileWidth, j * this.tileHeight, this.tileWidth, this.tileHeight);
        this.drawTile(i, j, ctx);

      }
      if (this.dungeon.tiles[i][j].type === 'door') {
        ctx.fillStyle = 'yellow';
        this.drawTile(i, j, ctx);
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

Environment.prototype.drawTile = function drawTile(x, y, ctx) {
  let cartX = x * this.tileWidth / 2;
  let cartY = y * this.tileHeight;
  let isoX = cartX - cartY;
  let isoY = (cartX + cartY) / 2;

  ctx.beginPath();
  ctx.moveTo(isoX, isoY);
  ctx.lineTo(isoX + this.tileWidth / 2, isoY - this.tileHeight / 2);
  ctx.lineTo(isoX + this.tileWidth, isoY);
  ctx.lineTo(isoX + this.tileWidth / 2, isoY + this.tileHeight / 2);
  ctx.lineTo(isoX, isoY);
  ctx.fill();
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
