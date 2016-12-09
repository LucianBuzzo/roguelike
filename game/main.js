
global.DEBUG = false;

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
