const storage = require('electron-json-storage');
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

const camera = new Camera(canvas, -93, -38);

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
  if (player.moving) {
    environment.update(player.direction, player.speed);
  }
};

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  environment.render(ctx);
  player.render(ctx);
};

document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowUp' || e.key === 'w') {
    player.direction = 'up';
    player.moving = true;
  }
  if (e.key === 'ArrowDown' || e.key === 's') {
    player.direction = 'down';
    player.moving = true;
  }
  if (e.key === 'ArrowLeft' || e.key === 'a') {
    player.direction = 'left';
    player.moving = true;
  }
  if (e.key === 'ArrowRight' || e.key === 'd') {
    player.direction = 'right';
    player.moving = true;
  }
  console.log(e);
});

document.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowUp' || e.key === 'w') {
    player.moving = false;
  }
  if (e.key === 'ArrowDown' || e.key === 's') {
    player.moving = false;
  }
  if (e.key === 'ArrowLeft' || e.key === 'a') {
    player.moving = false;
  }
  if (e.key === 'ArrowRight' || e.key === 'd') {
    player.moving = false;
  }
  console.log(e);
});

main();
