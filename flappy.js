/* Flappy Summer Internship (Resumé game)
 * Karl Jakob Larsson Spring 2014
 * <k.jakob.larsson@gmail.com>
 * MIT License
 */
 
/* ---- TODO ----
 * Max speed
 * High score (done-ish)
 * Split 'state' into state and parameters.
 * Graphics
 * Sound
 * Overlay text
 * CV
 */

// All units in SI (seconds, pixels, meters etc) unless otherwise noted.


// ---- Init????asasgasd???lize ----

var canvas = document.getElementById("a");
canvas.width *= window.devicePixelRatio; // high-dpi adjustment
canvas.height *= window.devicePixelRatio;


// --- Convinience ----

var pixRat = window.devicePixelRatio;
var c = canvas.getContext("2d");

var rand = function(min, max) {
    return Math.random() * (max - min) + min;
};
var w = canvas.width;
var h = canvas.height;


// ---- Setup ----

var state = {
    gameover: false,
    score: 0,
    passedObst: 0, // Used for counting score.
    highscore: 0,
    pos: {
        x: 6*w/7,
        y: h/2,
    },
    vel: {
      x: 0,
      y: 0,
    },
    acc: {
      x: 0,
      y: 0,
    },
    acceleration : 0.0007,
    accelerationUp: 0.004,
    maxVelX: 0.5,
    maxVelY: 0.3,
    gravity: 0.0007,
    obstacle: {
        halfWidth: 20*pixRat,
        speed: 1.4*pixRat ,
        spacing: 1 - 0.32,
    },
    obstacles: {}
};

// var oneObstacle = {x: 270, holePos: 0.7, holeSize: 0.3};
state.obstacles[0] = randObstacle();

var prevTime = 0;


// ---- Main game-functions ----

function draw(t) {
    if (state.gameover) {
      drawGameover();
    } else {
      c.clearRect(0,0,w,h);
      c.fillStyle = "#FF00EE";
      c.fillRect(state.pos.x -10, state.pos.y -10, 20, 20);
      
      
      for(var k in state.obstacles) {
        drawObstacle(getObstacleCorners(state.obstacles[k]));
      }
      
      c.font = "24pt Arial";
      c.fillStyle = "#000";
      c.fillText(t - state.startTime, 30, 30);
      c.fillText("Score: " + state.score, w - 140, 30);
      c.fillText("Highscore: " + state.highscore, w - 440, 30);
    }
}

function update(t, dt) {  
  
  // Check the gamestate  
  if ( (state.gameover) && key.space()) newGame();
  else if (checkIfPlayerIntersect()) state.gameover = true;
  else if (outOfBounds(state.pos)) state.gameover = true;
  
  // Input
  if (key.up()) {
    state.acc.y = -state.accelerationUp;
  } else if (key.down()) {
    state.acc.y = state.acceleration;
  } else {
    state.acc.y = 0;
  }
  
  if (key.left()) {
    state.acc.x = -state.acceleration;
  } else if (key.right()) {
    state.acc.x = state.acceleration;
  } else {
    state.acc.x = 0;
  }
  
  state.acc.y += state.gravity;

  
  state.vel.x += state.acc.x * dt;
  state.vel.y += state.acc.y * dt;
    
  state.pos.x += state.vel.x * dt;
  state.pos.y += state.vel.y * dt;
  
  var passedObst = 0;
  // The Obstacles
  for(var k in state.obstacles) {
    if (state.obstacles[k].x < 0) {
      delete(state.obstacles[k]);
    } else if (state.obstacles[k].x < state.pos.x) {
      passedObst += 1;
    }
  }
  
  if (passedObst > state.passedObst) {
    state.score += 1;
  }
  state.passedObst = passedObst;
  
  loopObstacles(function(obst) {obst.x -= state.obstacle.speed;});
  if (rightMost() < (w * state.obstacle.spacing)) addObstacle(t);
  
  
}


// ---- Obstacle functions ----
function randObstacle() {
  return {x: w + state.obstacle.halfWidth, holePos: rand(0.2,0.7), holeSize: rand(120*pixRat, 400*pixRat)};
}

function addObstacle(t) {
  state.obstacles[t] = randObstacle();
}

function loopObstacles(fn) {
  for(var k in state.obstacles) {
    fn(state.obstacles[k]);
  }
}

function noOfObst() {
  var no = 0;
  loopObstacles(function() {no++;});
  return no;
}

function rightMost() {
  maxX = 0;
  loopObstacles(function(obst) {if (obst.x > maxX) maxX = obst.x;});
  return maxX;
}

function drawObstacle(obstacle) {
  c.fillStyle = "#060";
  var top = obstacle.top;
  var bot = obstacle.bottom;
  
  c.fillRect(top[0], top[1], state.obstacle.halfWidth*2, top[3]); // top
  c.fillRect(bot[0], bot[1], state.obstacle.halfWidth*2, bot[3]); // bottom
}

// Corners return a simple array [left, top, right, bottom] for the top and bottom rect.
function getObstacleCorners(obst) {
  var halfWidth = state.obstacle.halfWidth;
  
  return {
    top: [obst.x - halfWidth, 0, obst.x + halfWidth, obst.holePos*h - obst.holeSize/2],
    bottom: [obst.x - halfWidth, obst.holePos*h + obst.holeSize/2, obst.x + halfWidth, h],
  };
}


// ---- Intersection functions ----

function getPlayerCorners() {
  return [state.pos.x -10, state.pos.y -10, state.pos.x +10, state.pos.y +10];
}

function intersect(a, b) {
  return (a[0] <= b[2] &&
          b[0] <= a[2] &&
          a[1] <= b[3] &&
          b[1] <= a[3])
}

function checkIfPlayerIntersect() {
  var intersects = false;
  for(var k in state.obstacles) {
    var obs = getObstacleCorners(state.obstacles[k]) 
    intersects = intersects || intersect(obs.top, getPlayerCorners()) ||
                               intersect(obs.bottom, getPlayerCorners())
  }
  return intersects;
}

function outOfBounds(p) {
  return ((p.x < 0) ||  (p.x > w) || (p.y < 0) || (p.y > h));
}


// ---- Gamestate functions ----

function newGame() {
  c.clearRect(0,0,w,h);
  c.fillStyle = "#FF00EE";
  state.gameover = false;
  state.pos = {
        x: 3*w/9,
        y: h/2,
    };
  state.vel = { x: 0, y: 0};
  state.acc = { x: 0, y: 0};
  if (state.highscore < state.score) {state.highscore = state.score;}
  state.score = 0;
  state.obstacles = {};
  addObstacle(1);
  
  state.startTime = null;
}


// ---- Drawing functions ----

function drawGameover() {
  c.clearRect(0,0,w,h);
  c.fillStyle = "#333";
  c.fillRect(0, 0, w, h);
  
  c.font = "48pt Arial";
  c.fillStyle = "#F11";
  c.fillText("Game Over", w/4, h/2);
  
  c.font = "24pt Times";
  c.fillStyle = "#FF1";
  c.fillText("Press space for new game.", w/4, 2*h/3);
}


// ---- Run! ----

function render(time) {
    if (state.startTime === null) state.startTime = time;
    var deltaTime = time - prevTime;
    prevTime = time;
    
    update(time, deltaTime);
    draw(time);
    animId = requestAnimationFrame(render);
}

newGame();
var animId = requestAnimationFrame(render);


// ---- Input handler ----

var key = {
  _pressed: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  },
  
  left: function() {return key.isDown(key.LEFT)},
  up: function() {return key.isDown(key.UP)},
  right: function() {return key.isDown(key.RIGHT)},
  down: function() {return key.isDown(key.DOWN)},
  space: function() {return key.isDown(32)},
};

window.addEventListener('keyup', function(event) { key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { key.onKeydown(event); }, false);
