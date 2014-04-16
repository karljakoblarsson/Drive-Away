
// All units in SI (seconds, pixels, meters etc) unless otherwise noted.

var canvas = document.getElementById("a");
canvas.width *= window.devicePixelRatio; // high-dpi adjustment
canvas.height *= window.devicePixelRatio;
var pixRat = window.devicePixelRatio;
var c = canvas.getContext("2d");

var rand = function(min, max) {
    return Math.random() * (max - min) + min;
};
var w = canvas.width;
var h = canvas.height;

// Constants
var obstacleHoleSize = 70;

var state = {
    gameover: false,
    pos: {
        x: w/2,
        y: h/2,
    },
    obstacles: {
        halfWidth: 10*pixRat,
        number: 0,
    },
};

//state.obstacles[0] = randObstacle();
//state.obstacles[1] = getObstacleCorners(500, 0.7, 100);
//state.obstacles.number = 2;

var prevTime = 0;


function update(t, dt) {
  
    
  if ( (state.gameover) && key.space()) newGame();
  else if (checkIfPlayerIntersect()) state.gameover = true;
  else if (outOfBounds(state.pos)) state.gameover = true;
  else if (key.up()) state.pos.y -= 3;
  else if (key.left()) state.pos.x -= 3;
  else if (key.down()) state.pos.y += 3;
  else if (key.right()) state.pos.x += 3;

}

function draw(t) {
    if (state.gameover) {
      drawGameover();
    } else {
      c.clearRect(0,0,w,h);
      c.fillStyle = "#FF00EE";
      c.fillRect(state.pos.x -10, state.pos.y -10, 20, 20);
      
      for(var i = 0; i < state.obstacles.number; i++) {
        drawObstacle(state.obstacles[i]);
      }
      
      c.font = "12pt Arial";
      c.fillStyle = "#000";
      c.fillText(t - state.startTime, 10, 10);
    }
}

function randObstacle() {
  return getObstacleCorners(rand(20, w - 20), rand(0.2,0.7), rand(75, 400));
}

function addObstacle() {
  
}

function drawObstacle(obstacle) {
  c.fillStyle = "#060";
  var top = obstacle.top;
  var bot = obstacle.bottom;
  
  c.fillRect(top[0], top[1], state.obstacles.halfWidth*2, top[3]); // top
  c.fillRect(bot[0], bot[1], state.obstacles.halfWidth*2, bot[3]); // bottom
}

// Corners return a simple array [left, top, right, bottom]
function getObstacleCorners(x, holePos, holeSize) {
  var halfWidth = state.obstacles.halfWidth;
  
  return {
    top: [x - halfWidth, 0, x + halfWidth, holePos*h - holeSize/2],
    bottom: [x - halfWidth, holePos*h + holeSize/2, x + halfWidth, h],
  };
}

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
  for(var i = 0; i < state.obstacles.number; i++) {
    intersects = intersects || intersect(state.obstacles[i].top, getPlayerCorners()) ||
                               intersect(state.obstacles[i].bottom, getPlayerCorners())
  }
  return intersects;
}

function newGame() {
  c.clearRect(0,0,w,h);
  c.fillStyle = "#FF00EE";
  state.gameover = false;
  state.pos = {
        x: w/2,
        y: h/2,
    },
  //state.obstacles = {};
  state.startTime = null;
}

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

function outOfBounds(p) {
  return ((p.x < 0) ||  (p.x > w) || (p.y < 0) || (p.y > h));
}

// ----- play --------------------------

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

// ----- keys ---------------------------

key = {
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