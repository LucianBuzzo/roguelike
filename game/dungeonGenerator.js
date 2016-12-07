/**
 * Based on Bob Nystrom's procedural dungeon generation logic that he wrote for Hauberk
 * http://journal.stuffwithstuff.com/2014/12/21/rooms-and-mazes/
 */

var _ = require('underscore');

const Rect = function Rect(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
};

Rect.prototype.getBoundingBox = function getBoundingBox() {
  return {
    top: this.y,
    right: this.x + this.width,
    bottom: this.y + this.height,
    left: this.x
  };
};

Rect.prototype.intersects = function intersects(other) {
  var r1 = this.getBoundingBox();
  var r2 = other.getBoundingBox();

  return !(r2.left > r1.right ||
           r2.right < r1.left ||
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
};

const Tile = function Tile(type) {
  this.type = type;
  this.neighbours = [];
};

Tile.prototype.setNeighbours = function(neighbours) {
  this.neighbours = neighbours;
};

// The random dungeon generator.
//
// Starting with a stage of solid walls, it works like so:
//
// 1. Place a number of randomly sized and positioned rooms. If a room
//    overlaps an existing room, it is discarded. Any remaining rooms are
//    carved out.
// 2. Any remaining solid areas are filled in with mazes. The maze generator
//    will grow and fill in even odd-shaped areas, but will not touch any
//    rooms.
// 3. The result of the previous two steps is a series of unconnected rooms
//    and mazes. We walk the stage and find every tile that can be a
//    "connector". This is a solid tile that is adjacent to two unconnected
//    regions.
// 4. We randomly choose connectors and open them or place a door there until
//    all of the unconnected regions have been joined. There is also a slight
//    chance to carve a connector between two already-joined regions, so that
//    the dungeon isn't single connected.
// 5. The mazes will have a lot of dead ends. Finally, we remove those by
//    repeatedly filling in any open tile that's closed on three sides. When
//    this is done, every corridor in a maze actually leads somewhere.
//
// The end result of this is a multiply-connected dungeon with rooms and lots
// of winding corridors.
const Dungeon = function Dungeon() {
  var numRoomTries = 50;

  // The inverse chance of adding a connector between two regions that have
  // already been joined. Increasing this leads to more loosely connected
  // dungeons.
  var extraConnectorChance = 50;

  // Increasing this allows rooms to be larger.
  var roomExtraSize = 0;

  var windingPercent = 0;

  var _rooms = [];

  // For each open position in the dungeon, the index of the connected region
  // that that position is a part of.
  var _regions = [];

  // The index of the current region being carved.
  var _currentRegion = -1;

  var stage;

  const bounds = () => stage.bounds;

  const bindStage = (givenStage) => {
    stage = givenStage;
  };

  const getTile = (x, y) => {
    return tiles[x][y];
  };

  let tiles = [];

  const setTile = (x, y, type) => {
    if (tiles[x] && tiles[x][y]) {
      tiles[x][y].type = type;
      tiles[x][y].region = _currentRegion;
    }
  };

  const fill = (type) => {
    let neighbours = [];
    let nesw = {};

    for (var x = 0; x < stage.width; x++) {
      tiles.push([]);
      for (var y = 0; y < stage.height; y++) {
        tiles[x].push(new Tile(type));
      }
    }

    for (var x = 0; x < stage.width; x++) {
      for (var y = 0; y < stage.height; y++) {
        neighbours = [];
        nesw = {};
        if (tiles[x][y - 1]) {
          neighbours.push(tiles[x][y - 1]);
          nesw.north = tiles[x][y - 1];
        }
        if (tiles[x + 1] && tiles[x + 1][y - 1]) {
          neighbours.push(tiles[x + 1][y - 1]);
        }
        if (tiles[x + 1] && tiles[x + 1][y]) {
          neighbours.push(tiles[x + 1][y]);
          nesw.east = tiles[x + 1][y];
        }
        if (tiles[x + 1] && tiles[x + 1][y + 1]) {
          neighbours.push(tiles[x + 1][y + 1]);
        }
        if (tiles[x] && tiles[x][y + 1]) {
          neighbours.push(tiles[x][y + 1]);
          nesw.south = tiles[x][y + 1];
        }
        if (tiles[x - 1] && tiles[x - 1][y + 1]) {
          neighbours.push(tiles[x - 1][y + 1]);
        }
        if (tiles[x - 1] && tiles[x - 1][y]) {
          neighbours.push(tiles[x - 1][y]);
          nesw.west = tiles[x - 1][y];
        }
        if (tiles[x - 1] && tiles[x - 1][y - 1]) {
          neighbours.push(tiles[x - 1][y - 1]);
        }
        tiles[x][y].setNeighbours(neighbours);
        tiles[x][y].nesw = nesw;
      }
    }
  };

  // Randomly turns some [wall] tiles into [floor] and vice versa.
  const erode = (iterations, {floor, wall}) => {
    if (floor === null) {
      floor = Tiles.floor;
    }
    if (wall === null) {
      wall = Tiles.wall;
    }

    let bounds = stage.bounds.inflate(-1);
    for (var i = 0; i < iterations; i++) {
      // TODO: This way this works is super inefficient. Would be better to
      // keep track of the floor tiles near open ones and choose from them.
      var pos = rng.vecInRect(bounds);

      var here = getTile(pos);
      if (here !== wall) {
        continue;
      }

      // Keep track of how many floors we're adjacent too. We will only erode
      // if we are directly next to a floor.
      var floors = 0;

      for (var dir in Direction.ALL) {
        var tile = getTile(pos + dir);
        if (tile == floor) floors++;
      }

      // Prefer to erode tiles near more floor tiles so the erosion isn't too
      // spiky.
      if (floors < 2) continue;
      if (rng.oneIn(9 - floors)) setTile(pos, floor);
    }
  };

  const generate = (stage) => {
    if (stage.width % 2 === 0 || stage.height % 2 === 0) {
      throw new Error('The stage must be odd-sized.');
    }

    bindStage(stage);

    fill('wall');

    _addRooms();

    // Fill in all of the empty space with mazes.
    for (var y = 0; y < stage.height; y++) {
      for (var x = 0; x < stage.width; x++) {
        //var pos = new Vec(x, y);
        //if (getTile(pos) != Tiles.wall) continue;
        if (getTile(x, y).type === 'floor') {
          continue;
        }
        _growMaze(x, y);
      }
    }


    _connectRegions();

    _removeDeadEnds();

    /*
    _rooms.forEach(onDecorateRoom);
    */

   return {
     rooms: _rooms,
     tiles: tiles,
   };
  };

  const onDecorateRoom = (room) => {};

  // Implementation of the "growing tree" algorithm from here:
  // http://www.astrolog.org/labyrnth/algrithm.htm.
  const _growMaze = (startX, startY) => {
    var cells = [];
    var lastDir;



    if (tiles[startX][startY].neighbours.filter(x => x.type === 'floor').length > 0) {
      return;
    }

    _startRegion();

    _carve(startX, startY);

    cells.push({x: startX, y: startY });
    let count = 0;
    while (cells.length && count < 500) {
      count++;
      var cell = cells[cells.length - 1];
      var x = cell.x;
      var y = cell.y;

      // See which adjacent cells are open.
      var unmadeCells = [];

      if (
        _canCarve(x, y - 1) &&
        _canCarve(x, y - 2) &&
        _canCarve(x - 1, y - 1) &&
        _canCarve(x - 1, y - 2) &&
        _canCarve(x + 1, y - 1) &&
        _canCarve(x + 1, y - 2)
      ) {
        unmadeCells.push(x + ':' + (y - 1));
      }
      if (
        _canCarve(x + 1, y) &&
        _canCarve(x + 2, y) &&
        _canCarve(x + 1, y - 1) &&
        _canCarve(x + 2, y - 2) &&
        _canCarve(x + 1, y + 1) &&
        _canCarve(x + 2, y + 2)
      ) {
        unmadeCells.push(x + 1 + ':' + y);
      }
      if (
        _canCarve(x, y + 1) &&
        _canCarve(x, y + 2) &&
        _canCarve(x - 1, y + 1) &&
        _canCarve(x - 2, y + 2) &&
        _canCarve(x + 1, y + 1) &&
        _canCarve(x + 2, y + 2)
      ) {
        unmadeCells.push(x + ':' + (y + 1));
      }
      if (
        _canCarve(x - 1, y) &&
        _canCarve(x - 2, y) &&
        _canCarve(x - 1, y - 1) &&
        _canCarve(x - 2, y - 2) &&
        _canCarve(x - 1, y - 1) &&
        _canCarve(x - 2, y - 2)
      ) {
        unmadeCells.push(x - 1 + ':' + y);
      }

      if (unmadeCells.length) {
        // Based on how "windy" passages are, try to prefer carving in the
        // same direction.
        var dir;
        if (unmadeCells.indexOf(lastDir) > -1 && _.random(1, 100) > windingPercent) {
          dir = lastDir;
        } else {
          dir = unmadeCells[_.random(0, unmadeCells.length - 1)];
        }

        let [dirX, dirY] = dir.split(':').map(Number);

        _carve(cell.x, cell.y);
        _carve(dirX, dirY);

        cells.push({ x: dirX, y: dirY });
        lastDir = dir;
      } else {
        // No adjacent uncarved cells.
        cells.pop();

        // This path has ended.
        lastDir = null;
      }
    }
  };

  // Places rooms ignoring the existing maze corridors.
  const _addRooms = () => {
    console.log('adding rooms');
    for (var i = 0; i < numRoomTries; i++) {
      // Pick a random room size. The funny math here does two things:
      // - It makes sure rooms are odd-sized to line up with maze.
      // - It avoids creating rooms that are too rectangular: too tall and
      //   narrow or too wide and flat.
      // TODO: This isn't very flexible or tunable. Do something better here.
      var size = _.random(1, 3 + roomExtraSize) * 2 + 1;
      var rectangularity = _.random(0, 1 + Math.floor(size / 2)) * 2;
      var width = size;
      var height = size;
      if (_.random(1, 2) === 1) {
        width += rectangularity;
      } else {
        height += rectangularity;
      }

      var x = _.random(0, Math.floor((stage.width - width) / 2)) * 2 + 1;
      var y = _.random(0, Math.floor((stage.height - height) / 2)) * 2 + 1;

      var room = new Rect(x, y, width, height);

      var overlaps = false;
      for (var other of _rooms) {
        if (room.intersects(other)) {
          overlaps = true;
          break;
        }
      }

      if (overlaps) {
        continue;
      }

      _rooms.push(room);

      _startRegion();

      // room Tiles floor
      carveArea(x, y, width, height);
    }
  };

  const carveArea = (x, y, width, height) => {
    for (var i = x; i < x + width; i++) {
      for (var j = y; j < y + height; j++) {
        _carve(i, j);
      }
    }
  };

  const _connectRegions = () => {
    let regionConnections = {};
    tiles.forEach((row, rowIndex) => {
      row.forEach((tile, tileIndex) => {
        if (tile.type === 'floor') {
          return;
        }

        let tileRegions = _.unique(
          _.values(tile.nesw).map(x => x.region)
          .filter(x => !_.isUndefined(x))
        );
        if (tileRegions.length <= 1) {
          return;
        }

        let key = tileRegions.join('-');
        if (!regionConnections[key]) {
          regionConnections[key] = [];
        }
        regionConnections[key].push(tile);

      });
    });

    _.each(regionConnections, (connections) => {
      let index = _.random(0, connections.length - 1);
      connections[index].type = 'door';
      connections.splice(index, 1);

      // Occasional open up additional connections
      connections.forEach(conn => {
        if (_oneIn(extraConnectorChance)) {
          conn.type = 'door';
        }
      });
    });
  }

  const _oneIn = (num) => {
    return _.random(1, num) === 1;
  };

  const _addJunction = (pos) => {
    if (rng.oneIn(4)) {
      setTile(pos, rng.oneIn(3) ? Tiles.openDoor : Tiles.floor);
    } else {
      setTile(pos, Tiles.closedDoor);
    }
  }

  const _removeDeadEnds = () => {
    var done = false;

    console.log('removing dead ends');
    while (!done) {
      done = true;
      tiles.forEach((row, rowIndex) => {
        row.forEach((tile, tileIndex) => {
          // If it only has one exit, it's a dead end --> fill it in!
          if (tile.type === 'wall') {
            return;
          }
          if (_.values(tile.nesw).filter(t => t.type !== 'wall').length <= 1) {
            tile.type = 'wall';
            done = false;
          }
        });
      });
    }

    console.log('finished removing dead ends');
  };

  // Gets whether or not an opening can be carved from the given starting
  // [Cell] at [pos] to the adjacent Cell facing [direction]. Returns `true`
  // if the starting Cell is in bounds and the destination Cell is filled
  // (or out of bounds).</returns>
  const _canCarve = (x, y) => {
    // Must end in bounds.
    if (!tiles[x] || !tiles[x][y]) {
      return false;
    }

    // Destination must not be open.
    return getTile(x, y).type !== 'floor';
  };

  const _startRegion = () => {
    _currentRegion++;
  };

  const _carve = (x, y, type = 'floor') => {
    setTile(x, y, type);
  };

  return {
    generate,
  };
};

module.exports = Dungeon;
