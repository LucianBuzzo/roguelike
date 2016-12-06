/**
 * Credit to hauberk on github
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
  var extraConnectorChance = 20;

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

  const setTile = (x, y, tile) => {
    if (tiles[x] && tiles[x][y]) {
      tiles[x][y].type = tile;
    }
  };

  const fill = (type) => {
    for (var y = 0; y < stage.height; y++) {
      tiles.push([]);
      for (var x = 0; x < stage.width; x++) {
        tiles[y].push(new Tile(type));
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
      throw new Error("The stage must be odd-sized.");
    }

    bindStage(stage);

    fill('wall');
    console.log(tiles);
    // _regions = [stage.width, stage.height];

    _addRooms();

    console.log(_rooms);

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

    /*
    _connectRegions();
    _removeDeadEnds();

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

    _startRegion();
    _carve(startX. startY);

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

        let [dirX, dirY] = dir.split(':');

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
    // Find all of the tiles that can connect two (or more) regions.
    var connectorRegions = {};
    for (var pos in bounds.inflate(-1)) {
      // Can't already be part of a region.
      if (getTile(pos) != Tiles.wall) continue;

      var regions = new Set();
      for (var dir in Direction.CARDINAL) {
        var region = _regions[pos + dir];
        if (region != null) regions.add(region);
      }

      if (regions.length < 2) continue;

      connectorRegions[pos] = regions;
    }

    var connectors = connectorRegions.keys.toList();

    // Keep track of which regions have been merged. This maps an original
    // region index to the one it has been merged to.
    var merged = {};
    var openRegions = new Set();
    for (var i = 0; i <= _currentRegion; i++) {
      merged[i] = i;
      openRegions.add(i);
    }

    // Keep connecting regions until we're down to one.
    while (openRegions.length > 1) {
      var connector = rng.item(connectors);

      // Carve the connection.
      _addJunction(connector);

      // Merge the connected regions. We'll pick one region (arbitrarily) and
      // map all of the other regions to its index.
      var regions = connectorRegions[connector]
          .map((region) => merged[region]);
      var dest = regions.first;
      var sources = regions.skip(1).toList();

      // Merge all of the affected regions. We have to look at *all* of the
      // regions because other regions may have previously been merged with
      // some of the ones we're merging now.
      for (var i = 0; i <= _currentRegion; i++) {
        if (sources.contains(merged[i])) {
          merged[i] = dest;
        }
      }

      // The sources are no longer in use.
      openRegions.removeAll(sources);

      // Remove any connectors that aren't needed anymore.
      connectors.removeWhere((pos) => {
        // Don't allow connectors right next to each other.
        if (connector - pos < 2) return true;

        // If the connector no long spans different regions, we don't need it.
        var regions = connectorRegions[pos].map((region) => merged[region])
            .toSet();

        if (regions.length > 1) return false;

        // This connecter isn't needed, but connect it occasionally so that the
        // dungeon isn't singly-connected.
        if (rng.oneIn(extraConnectorChance)) _addJunction(pos);

        return true;
      });
    }
  }

  const _addJunction = (pos) => {
    if (rng.oneIn(4)) {
      setTile(pos, rng.oneIn(3) ? Tiles.openDoor : Tiles.floor);
    } else {
      setTile(pos, Tiles.closedDoor);
    }
  }

  const _removeDeadEnds = () => {
    var done = false;

    while (!done) {
      done = true;

      for (var pos in bounds.inflate(-1)) {
        if (getTile(pos) == Tiles.wall) continue;

        // If it only has one exit, it's a dead end.
        var exits = 0;
        for (var dir in Direction.CARDINAL) {
          if (getTile(pos + dir) != Tiles.wall) exits++;
        }

        if (exits != 1) continue;

        done = false;
        setTile(pos, Tiles.wall);
      }
    }
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
    // _regions[pos] = _currentRegion;
  };

  return {
    generate,
  };
};

module.exports = Dungeon;
