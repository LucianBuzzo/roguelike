var Dungeon = require('./dungeonGenerator.js');
var U = require('./utils.js');

const intersectRect = function intersectRect(r1, r2) {
  return !(r2.left > r1.right ||
           r2.right < r1.left ||
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
};

const intersectIsometric = function(r1, r2) {
  // Check outer bounding box first
  if (!intersectRect(r1, r2)) {
    return false;
  }

  let conv1 = {
    top: r1.top - (r1.bottom - r1.top) / 2,
    left: r1.left,
    right: r1.right,
    bottom: r1.bottom + (r1.bottom - r1.top) / 2
  };

  let conv2 = {
    top: r2.top - (r2.bottom - r2.top) / 2,
    left: r2.left,
    right: r2.right,
    bottom: r2.bottom + (r2.bottom - r2.top) / 2
  };

  return intersectRect(conv1, conv2);
};


var Environment = function Environment() {
  this.numTilesX = 51;
  this.numTilesY = 51;
  this.dungeon = new Dungeon().generate({
    width: this.numTilesX,
    height: this.numTilesY
  });

   this.tileWidth = 80;
   this.tileHeight = 40;
//   this.tileWidth = 20;
//   this.tileHeight = 10;

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
        let cartX = i * this.tileWidth / 2;
        let cartY = j * this.tileHeight;
        let isoX = cartX - cartY;
        let isoY = (cartX + cartY) / 2;

        this.bounds.push({
          top: isoY,
          left: isoX,
          right: isoX + this.tileWidth,
          bottom: isoY + this.tileHeight
        });
      }
    }
  }
};

Environment.prototype.findStart = function findStart() {
  var startX;
  var startY;
  var done = false;
  for (var x = 0; x < this.dungeon.tiles.length; x++) {
    if (done) {
      break;
    }
    for (var y = 0; y < this.dungeon.tiles.length; y++) {
      if (this.dungeon.tiles[x][y].type !== 'wall') {
        console.log(x, y);
        // startX = x * this.tileWidth / 2 + this.tileWidth / 2;
        // startY = y * this.tileHeight + this.tileHeight / 2;
        startX = x * this.tileWidth / 2;
        startY = y * this.tileHeight;
        done = true;
        break;
      }
    }
  }

  return [startX, startY];
};

Environment.prototype.update = function update() {
};

Environment.prototype.render = function render(ctx, camera) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.save();

  ctx.translate(camera.offsetX, camera.offsetY);

  ctx.fillStyle = 'red';

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
      this.outlineBounds(box.left, box.top, box.right - box.left, box.bottom - box.top, ctx);
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

Environment.prototype.outlineBounds = function outlineBounds(x, y, width, height, ctx) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width / 2, y - height / 2);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width / 2, y + height / 2);
  ctx.lineTo(x, y);
  ctx.stroke();
};

Environment.prototype.renderForeground = function renderForeground(ctx, camera) {
  ctx.save();
  ctx.translate(camera.offsetX, camera.offsetY);
  // ctx.drawImage(this.foregroundImg, 0, 0);
  ctx.restore();
};

Environment.prototype.isOutOfBounds = function(boundingBox) {
  let oob = false;
  for (var i = 0; i < this.bounds.length; i++) {
    if (intersectIsometric(boundingBox, this.bounds[i])) {
      oob = true;
      break;
    }
  }

  return oob;
};

module.exports = new Environment();
