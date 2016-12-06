
global.DEBUG = false;

const player = require('./player');
const Camera = require('./camera');
const environment = require('./environment');

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

ctx.imageSmoothingEnabled = false;

canvas.width = 480;
canvas.height = 270;

canvas.style.width = '960px';
canvas.style.height = '540px';

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
  console.log(e);
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
  console.log(e);
});

// main();

var Dungeon = require('./dungeonGenerator.js');

var dungeon = new Dungeon().generate({
  width: 51,
  height: 51
});

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
