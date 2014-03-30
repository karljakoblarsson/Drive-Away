var canvas = document.getElementById("a");
canvas.width *= window.devicePixelRatio; // high-dpi adjustment
canvas.height *= window.devicePixelRatio;
var c = canvas.getContext("2d");

var rand = function(min, max) {
    return Math.random() * (max - min) + min;
};
var w = canvas.width;
var h = canvas.height;

c.fillStyle = "#FF00EE";

var x = w/2;
var y = h/2;

var state = {
    gameover: false,
    pos: {
        x: w/2,
        y: h/2,
    },
};

function draw() {
    c.clearRect(0,0,w,h);
    c.fillRect(state.pos.x, state.pos.y, 20, 20);
    //x += rand(-10,10);
    //y += rand(-10,10);
    
}

function update() {
  if (state.key.up()) y--;
  if (state.key.left()) x--;
  if (state.key.down()) y++;
  if (state.key.right()) x++;
}

function render() {
    draw();
    update()
    requestAnimationFrame(render);
}
requestAnimationFrame(render);


state.key = {
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
  
  left: function() {return this.isDown(state.key.LEFT)},
  up: function() {return this.isDown(state.key.UP)},
  right: function() {return this.isDown(state.key.RIGHT)},
  down: function() {return this.isDown(state.key.DOWN)},
};

window.addEventListener('keyup', function(event) { state.key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { state.key.onKeydown(event); }, false);