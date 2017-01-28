
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

    // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
    // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
    game.iso.anchor.setTo(0.5, 0);
    // game.iso.anchor.setTo(startX * 38, startY * 38);
    let [startX, startY] = environment.findStart();
//    console.log(startX, startY);
//    let start = new Phaser.Plugin.Isometric.Point3(startX * 38, startY * 38);
//    game.camera.x = start.x;
//    game.camera.y = start.y;

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
    console.log(startX, startY);
    projector.project(new Phaser.Plugin.Isometric.Point3(startX * 38, startY * 38), startPoint);
    console.log(startPoint);
    player = game.add.isoSprite(0, 0, 0, 'cube', 0, isoGroup);
    console.log(player);
    player.tint = 0x86bfda;
    player.anchor.set(0.5);
    // game.physics.isoArcade.enable(player);
    // Make the camera follow the player.
    // game.camera.position = startPoint;
    player.position = startPoint;
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
      if (!tile.selected && inBounds) {
        tile.selected = true;
        tile.tint = 0x86bfda;
        game.add.tween(tile).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);
        // If not, revert back to how it was.
      } else if (tile.selected && !inBounds) {
        tile.selected = false;
        tile.tint = 0xffffff;
        game.add.tween(tile).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
      }
    });

    if (cursors.up.isDown) {
      game.camera.y -= 16;
    } else if (cursors.down.isDown) {
      game.camera.y += 16;
    }

    if (cursors.left.isDown) {
      game.camera.x -= 16;
    } else if (cursors.right.isDown) {
      game.camera.x += 16;
    }
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
      xx = colIndex * tileWidth;
      col.forEach((node, rowIndex) => {
        if (node === 1) {
          return;
        }
        yy = rowIndex * tileHeight;
        // Create a tile using the new game.add.isoSprite factory method at the specified position.
        // The last parameter is the group you want to add it to (just like game.add.sprite)
        tile = game.add.isoSprite(xx, yy, 0, 'tile', 0, isoGroup);
        tile.anchor.set(0.5, 0);
      });
    });
    console.log(tile)
  }
};

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');

console.log(game);

/*
var game = new Phaser.Game(800, 400, Phaser.AUTO, 'test', null, true, false);

var BasicGame = function (game) { };

BasicGame.Boot = function (game) { };

var isoGroup, player;

BasicGame.Boot.prototype = {
    preload: function () {
        game.load.image('cube', './assets/cube.png');

        game.time.advancedTiming = true;

        // Add and enable the plug-in.
        game.plugins.add(new Phaser.Plugin.Isometric(game));

        // In order to have the camera move, we need to increase the size of our world bounds.
        game.world.setBounds(0, 0, 2048, 1024);

        // Start the IsoArcade physics system.
        game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);

        // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
        // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
        // When using camera following, it's best to keep the Y anchor set to 0, which will let the camera
        // cover the full size of your world bounds.
        game.iso.anchor.setTo(0.5, 0);
    },
    create: function () {
        // Create a group for our tiles, so we can use Group.sort
        isoGroup = game.add.group();

        // Set the global gravity for IsoArcade.
        game.physics.isoArcade.gravity.setTo(0, 0, -500);

        // Let's make a load of cubes on a grid, but do it back-to-front so they get added out of order.
        var cube;
        for (var xx = 1024; xx > 0; xx -= 140) {
            for (var yy = 1024; yy > 0; yy -= 140) {
                // Create a cube using the new game.add.isoSprite factory method at the specified position.
                // The last parameter is the group you want to add it to (just like game.add.sprite)
                cube = game.add.isoSprite(xx, yy, 0, 'cube', 0, isoGroup);
                cube.anchor.set(0.5);

                // Enable the physics body on this cube.
                game.physics.isoArcade.enable(cube);

                // Collide with the world bounds so it doesn't go falling forever or fly off the screen!
                cube.body.collideWorldBounds = true;

                // Add a full bounce on the x and y axes, and a bit on the z axis.
                cube.body.bounce.set(1, 1, 0.2);

                // Add some X and Y drag to make cubes slow down after being pushed.
                cube.body.drag.set(100, 100, 0);
            }
        }

        // Create another cube as our 'player', and set it up just like the cubes above.
        player = game.add.isoSprite(128, 128, 0, 'cube', 0, isoGroup);
        player.tint = 0x86bfda;
        player.anchor.set(0.5);
        game.physics.isoArcade.enable(player);
        player.body.collideWorldBounds = true;

        // Set up our controls.
        this.cursors = game.input.keyboard.createCursorKeys();

        this.game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.UP,
            Phaser.Keyboard.DOWN,
            Phaser.Keyboard.SPACEBAR
        ]);

        var space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        space.onDown.add(function () {
            player.body.velocity.z = 300;
        }, this);

        // Make the camera follow the player.
        game.camera.follow(player);
    },
    update: function () {
        // Move the player at this speed.
        var speed = 100;

        if (this.cursors.up.isDown) {
            player.body.velocity.y = -speed;
        }
        else if (this.cursors.down.isDown) {
            player.body.velocity.y = speed;
        }
        else {
            player.body.velocity.y = 0;
        }

        if (this.cursors.left.isDown) {
            player.body.velocity.x = -speed;
        }
        else if (this.cursors.right.isDown) {
            player.body.velocity.x = speed;
        }
        else {
            player.body.velocity.x = 0;
        }

        // Our collision and sorting code again.
        game.physics.isoArcade.collide(isoGroup);
        game.iso.topologicalSort(isoGroup);
    },
    render: function () {
        game.debug.text("Move with cursors, jump with space!", 2, 36, "#ffffff");
        game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");
    }
};

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');
*/


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
