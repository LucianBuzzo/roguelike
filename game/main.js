
global.DEBUG = false;

// Awkward configuration to get Phaser to work in electron
const PIXI = require('../deps/pixi/pixi.js');
const p2 = require('p2');
global.PIXI = PIXI;
global.p2 = p2;
const Phaser = require('phaser');
global.Phaser = Phaser;
// Iso plugin not available on NPM :(
require('../deps/phaser-plugin-isometric/dist/phaser-plugin-isometric.js');

const environment = require('./environment');

const game = new Phaser.Game(1800, 1800, Phaser.AUTO, 'test', null, true, false);

const BasicGame = function () { };
BasicGame.Boot = function () { };

let isoGroup;
let cursorPos;
let cursors;
let player;

BasicGame.Boot.prototype =
{
  preload: function () {
    game.load.image('tile', './assets/tile.png');
    game.load.image('cube', './assets/cube.png');

    game.time.advancedTiming = true;

    // Add and enable the plug-in.
    game.plugins.add(new Phaser.Plugin.Isometric(game));

    // Start the IsoArcade physics system.
    game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);

    // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
    // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
    game.iso.anchor.setTo(0.5, 0);

    game.world.setBounds(0, 0, 12000, 12000);
  },
  create: function () {
    let projector = new Phaser.Plugin.Isometric.Projector();
    let startPoint = new Phaser.Point();
    projector.game = game;

    // Create a group for our tiles.
    isoGroup = game.add.group();

    // Let's make a load of tiles on a grid.
    this.spawnTiles();


    // Provide a 3D position for the cursor
    cursorPos = new Phaser.Plugin.Isometric.Point3();
    cursors = game.input.keyboard.createCursorKeys();

    // Create another cube as our 'player', and set it up just like the cubes above.
    let [startX, startY] = environment.findStart();
    projector.project(new Phaser.Plugin.Isometric.Point3(startX * 38, startY * 38), startPoint);
    // Multiplied by 5 because we use fineMatrix
    player = game.add.isoSprite(startX * 5 * 38, startY * 5 * 38, 0, 'cube', 0, isoGroup);
    player.matrixCoordinates = { x: startX * 5, y: startY * 5 };
    player.tint = 0x86bfda;
    player.anchor.set(0.5);
    console.log('PLAYER', player);

    game.physics.isoArcade.enable(player);
    game.camera.follow(player);
  },
  update: function () {
    // Update the cursor position.
    // It's important to understand that screen-to-isometric projection means you have to specify a z position manually, as this cannot be easily
    // determined from the 2D pointer position without extra trickery. By default, the z position is 0 if not set.
    game.iso.unproject(game.input.activePointer.position, cursorPos);

    // Loop through all tiles and test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
    isoGroup.forEach(function (tile) {
      var inBounds = tile.isoBounds.containsXY(cursorPos.x, cursorPos.y);
      // If it does, do a little animation and tint change.
      if (inBounds && game.input.activePointer.isDown) {
        console.log('pointer down');
        let path = environment.findPath(player.matrixCoordinates, tile.matrixCoordinates);
        game.physics.isoArcade.moveToXYZ(player, path[0][0] * 38, path[0][1] * 38, 0);
        console.log(path);
      }
      if (!tile.selected && inBounds) {
        tile.selected = true;
        tile.tint = 0x86bfda;
        game.add.tween(tile).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);
        console.log(tile.matrixCoordinates);
        // If not, revert back to how it was.
      } else if (tile.selected && !inBounds) {
        tile.selected = false;
        tile.tint = 0xffffff;
        game.add.tween(tile).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
      }
    });

    // Move the player at this speed.
    var speed = 500;

    /*
    if (cursors.up.isDown) {
      player.body.velocity.y = -speed;
    } else if (cursors.down.isDown) {
      player.body.velocity.y = speed;
    } else {
      player.body.velocity.y = 0;
    }

    if (cursors.left.isDown) {
      player.body.velocity.x = -speed;
    } else if (cursors.right.isDown) {
      player.body.velocity.x = speed;
    } else {
      player.body.velocity.x = 0;
    }
    */

  },
  render: function () {
    game.debug.text("Move your mouse around!", 2, 36, "#ffffff");
    game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");
  },
  spawnTiles: function () {
    var tile;
    var tileWidth = 38;
    var tileHeight = 38;
    var xx;
    var yy;
    environment.fineMatrix.forEach((col, colIndex) => {
      yy = colIndex * tileWidth;
      col.forEach((node, rowIndex) => {
        if (node === 1 && rowIndex !== 0 && colIndex !== 0) {
          return;
        }
        xx = rowIndex * tileHeight;
        // Create a tile using the new game.add.isoSprite factory method at the specified position.
        // The last parameter is the group you want to add it to (just like game.add.sprite)
        tile = game.add.isoSprite(xx, yy, 0, 'tile', 0, isoGroup);
        tile.anchor.set(0.5, 0);
        tile.matrixCoordinates = { x: rowIndex, y: colIndex };
      });
    });
  }
};

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');

console.log(game);


/*
const player = require('./player');
const Camera = require('./camera');
const environment = require('./environment');

const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');

// The factor by which the canvas size is increased
const magnification = 2;

ctx.imageSmoothingEnabled = false;

canvas.width = 480;
canvas.height = 270;

canvas.style.width = canvas.width * magnification + 'px';
canvas.style.height = canvas.height * magnification + 'px';

let [startX, startY] = environment.findStart();

player.x = startX;
player.y = startY;

const camera = new Camera(canvas, 0, 0);

// The main game loop
var lastTime;
const main = () => {
  var now = Date.now();
  var dt = (now - lastTime) / 1000.0;

  update(dt);
  render();

  lastTime = now;
  requestAnimationFrame(main);
};

const update = (dt) => {
  environment.update(dt);
  camera.update(ctx, player);
  player.update(environment);
};

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  environment.render(ctx, camera);
  player.render(ctx, camera);

  environment.renderForeground(ctx, camera);
};

document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowUp' || e.key === 'w') {
    player.addDirection('up');
  }
  if (e.key === 'ArrowDown' || e.key === 's') {
    player.addDirection('down');
  }
  if (e.key === 'ArrowLeft' || e.key === 'a') {
    player.addDirection('left');
  }
  if (e.key === 'ArrowRight' || e.key === 'd') {
    player.addDirection('right');
  }
});

document.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowUp' || e.key === 'w') {
    player.removeDirection('up');
  }
  if (e.key === 'ArrowDown' || e.key === 's') {
    player.removeDirection('down');
  }
  if (e.key === 'ArrowLeft' || e.key === 'a') {
    player.removeDirection('left');
  }
  if (e.key === 'ArrowRight' || e.key === 'd') {
    player.removeDirection('right');
  }
});

document.addEventListener('click', function(e) {
  // Click coordinates use the actual pixels dranw on the screen, so we need to
  // scale them down by the amount the canvas is magnified

  // Coordinates are converted into a value relative to the center of the screen
  // and then added to the player coordinates to get the absolute game map coordinates
  let clickX = player.x + e.clientX / magnification - canvas.width / 2 + player.width / 2;
  let clickY = player.y + e.clientY / magnification - canvas.height / 2 + player.height / 2;

  let playerBB = player.getBB();

  let path = environment.findPath([playerBB.left, playerBB.top], [clickX, clickY]);

  if (path.length) {
    player.setPath(path);
  }
});

main();

const debugMap = function(dungeon) {
  const canvas = document.getElementById('debug-canvas');
  const ctx = canvas.getContext('2d');


  window.CTX = ctx;

  ctx.imageSmoothingEnabled = false;

  canvas.width = 110;
  canvas.height = 110;

  // canvas.style.width = '960px';
  // canvas.style.height = '540px';

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = 'red';

  dungeon.rooms.forEach((room) => {
    ctx.fillStyle = 'red';
    ctx.fillRect(room.x * 2, room.y * 2, room.width * 2, room.height * 2);
  });

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  for (var i = 0; i < dungeon.tiles.length; i++) {
    for (var j = 0; j < dungeon.tiles.length; j++) {
      if (dungeon.tiles[i][j].type === 'floor') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(i * 2, j * 2, 2, 2);
      }
      if (dungeon.tiles[i][j].type === 'door') {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(i * 2, j * 2, 2, 2);
      }
    }
  }
};

if (global.DEBUG) {
  debugMap(environment.dungeon);
}
*/
