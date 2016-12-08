const Dungeon = require('./dungeonGenerator.js');
const U = require('./utils.js');
const PF = require('pathfinding');
const turf = require('turf');
const overlaps = require('turf-overlaps');
const _ = require('underscore');

const intersectRect = function intersectRect(r1, r2) {
  return !(r2.left > r1.right ||
           r2.right < r1.left ||
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
};

var Environment = function Environment() {
  this.numTilesX = 21;
  this.numTilesY = 21;
  this.dungeon = new Dungeon().generate({
    width: this.numTilesX,
    height: this.numTilesY
  });

   this.tileWidth = 160;
   this.tileHeight = 80;
//   this.tileWidth = 20;
//   this.tileHeight = 10;

  this.debug = global.DEBUG;
  this.x = 0;
  this.y = 0;
  this.bounds = [];

  this.setBounds();

  this.matrix = [];

  for (var y = 0; y < this.dungeon.tiles[0].length; y++) {
    this.matrix.push([]);

    for (var x = 0; x < this.dungeon.tiles.length; x++) {
      this.matrix[y].push(this.dungeon.tiles[x][y].type === 'wall' ? 1 : 0);
    }
  }

  console.log(this.matrix[0]);

  let fineMatrix = _.range(1, this.dungeon.tiles[0].length * 5);

  let mat = this.matrix;
  let yLen = mat.length * 5;
  let xLen = mat[0].length * 5;
  let range = _.range(1, this.dungeon.tiles.length * 5);
  for (y = 0; y < yLen; y += 5) {
    fineMatrix[y] = range.slice();

    for (x = 0; x < xLen; x += 5) {
      let bit = this.matrix[y / 5][x / 5];
      fineMatrix[y][x] = bit;
      fineMatrix[y][x + 1] = bit;
      fineMatrix[y][x + 2] = bit;
      fineMatrix[y][x + 3] = bit;
      fineMatrix[y][x + 4] = bit;
    }

    fineMatrix[y + 1] = fineMatrix[y];
    fineMatrix[y + 2] = fineMatrix[y];
    fineMatrix[y + 3] = fineMatrix[y];
    fineMatrix[y + 4] = fineMatrix[y];
  }

  this.fineMatrix = fineMatrix;

  this.pathFinder = new PF.AStarFinder({
    allowDiagonal: true,
    dontCrossCorners: true
  });
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

  return U.cart2Iso(startX, startY);
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
  ctx.lineTo(isoX + this.tileWidth / 2, isoY + this.tileHeight / 2);
  ctx.lineTo(isoX, isoY + this.tileHeight);
  ctx.lineTo(isoX - this.tileWidth / 2, isoY + this.tileHeight / 2);
  ctx.lineTo(isoX, isoY);
  ctx.fill();
};

Environment.prototype.outlineBounds = function outlineBounds(x, y, width, height, ctx) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width / 2, y + height / 2);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x - width / 2, y + height / 2);
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
    if (this.intersectIsometric(boundingBox, this.bounds[i])) {
      oob = true;
      break;
    }
  }

  return oob;
};

Environment.prototype.intersectIsometric = function(r1, r2) {
  // Check outer bounding box first
  if (!intersectRect(r1, r2)) {
    return false;
  }

  let r1w = r1.right - r1.left;
  let r1h = r1.bottom - r1.top;

  let r2w = r2.right - r2.left;
  let r2h = r2.bottom - r2.top;

  var poly1 = turf.polygon([[
    [r1.left, r1.top],
    [r1.left + r1w / 2, r1.top + r1h / 2],
    [r1.left, r1.top + r1h],
    [r1.left - r1w / 2, r1.top + r1h / 2],
    [r1.left, r1.top]
  ]]);

  var poly2 = turf.polygon([[
    [r2.left, r2.top],
    [r2.left + r2w / 2, r2.top + r2h / 2],
    [r2.left, r2.top + r2h],
    [r2.left - r2w / 2, r2.top + r2h / 2],
    [r2.left, r2.top]
  ]]);

  var overlapping = overlaps(poly1, poly2);
  return overlapping;
};

/*
Environment.prototype.findPath = function findPath(start, end) {
  let [startX, startY] = start;
  let [cartStartX, cartStartY] = U.iso2Cart(startX, startY);

  let gridStartX = Math.floor(cartStartX / this.tileWidth * 2);
  let gridStartY = Math.floor(cartStartY / this.tileHeight);

  console.log(gridStartX, gridStartY);

  let [endX, endY] = end;
  let [cartEndX, cartEndY] = U.iso2Cart(endX, endY);

  let gridEndX = Math.floor(cartEndX / this.tileWidth * 2);
  let gridEndY = Math.floor(cartEndY / this.tileHeight);

  console.log(gridEndX, gridEndY);

  let gridMatrix = new PF.Grid(this.matrix);

  let path = this.pathFinder.findPath(gridStartX, gridStartY, gridEndX, gridEndY, gridMatrix);

  console.log(this.getGridEncompassingPath(path));

  // Convert the path back to iso coordinates
  return path.map(coords => {
    let [x, y] = coords;

    let cartX = x * this.tileWidth / 2;
    let cartY = y * this.tileHeight;
    let isoX = cartX - cartY;
    let isoY = (cartX + cartY) / 2;
    return [isoX, isoY + this.tileHeight / 2];
  });
};
*/

Environment.prototype.findPath = function findPath(start, end) {
  let [endX, endY] = end;
  let [cartEndX, cartEndY] = U.iso2Cart(endX, endY);

  let gridEndX = Math.floor(cartEndX / this.tileWidth * 2 * 5);
  let gridEndY = Math.floor(cartEndY / this.tileHeight * 5);
console.log(this.fineMatrix[gridEndY][gridEndX] === 1);
  if (this.fineMatrix[gridEndY][gridEndX] === 1) {
    return;
  }

  let [startX, startY] = start;
  let [cartStartX, cartStartY] = U.iso2Cart(startX, startY);

  let gridStartX = Math.floor(cartStartX / this.tileWidth * 2 * 5);
  let gridStartY = Math.floor(cartStartY / this.tileHeight * 5);

  console.log('gridAreas');
  console.log(gridStartX, gridStartY);

  console.log(gridEndX, gridEndY);

  let gridMatrix = new PF.Grid(this.fineMatrix);

  let path = this.pathFinder.findPath(gridStartX, gridStartY, gridEndX, gridEndY, gridMatrix);

  path = PF.Util.smoothenPath(gridMatrix, path);

  // Convert the path back to iso coordinates
  return path.map(coords => {
    let [x, y] = coords;

    let cartX = x * this.tileWidth / 2 / 5;
    let cartY = y * this.tileHeight / 5;
    let isoX = cartX - cartY;
    let isoY = (cartX + cartY) / 2;
    return [isoX, isoY + this.tileHeight / 2];
  });
};

Environment.prototype.getGridEncompassingPath = function(path) {
  console.log(path);
  let xCoords = path.map(c => c[0]);
  let yCoords = path.map(c => c[1]);
  let xMax = _.max(xCoords);
  let xMin = _.min(xCoords);
  let yMax = _.max(yCoords);
  let yMin = _.min(yCoords);

  let fineGrid = [];

  for (var y = yMin; y <= yMax; x++) {
    fineGrid.push(_.range(yMin, yMax));
    for (var x = xMin; x <= xMax; x++) {
      fineGrid[y][x] = this.matrix[y][x];
      fineGrid[y][x] = this.matrix[y][x];
      fineGrid[y][x] = this.matrix[y][x];
      fineGrid[y][x] = this.matrix[y][x];
    }
  }

  console.log(xMax, yMax);
  console.log(xMin, yMin);
};

module.exports = new Environment();
