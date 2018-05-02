/**
 * @file renderer.js
 * 
 * Render functions.
 * 
 * @author Alejandro Ambroa <jandroz@gmail.com>
 * @version 1.0.0
 */

const Constants = require('./constants');

const GRID_STYLE = 'rgba(100,100,100, 0.5)';
const CENTER_STYLE = 'rgba(100,100,100, 0.8)';

const UA = 1.496e11;

let Renderer = function() {
  this.canvas = null;
  this.back_canvas = null;
  this.context = null;
  this.orbits_context = null;
  this.width = 0;
  this.height = 0;
  this.offset_x = 0;
  this.offset_y = 0;
}

Renderer.prototype.init = function(pCanvas, pBackCanvas) {
  this.canvas = pCanvas;
  this.back_canvas = pBackCanvas;
  this.context = pCanvas.getContext('2d');
  this.orbits_context = pBackCanvas.getContext('2d');
}

Renderer.prototype.resizeCanvas = function() {
  this.width = this.canvas.clientWidth;
  this.height = this.canvas.clientHeight;

  this.canvas.width = this.width;
  this.canvas.height = this.height;

  this.back_canvas.width = this.width;
  this.back_canvas.height =  this.height;
}

Renderer.prototype.center = function() {
  this.offset_x = this.width / 2;
  this.offset_y = this.height / 2;
}

Renderer.prototype.getXOffset = function() {
  return this.offset_x;
}

Renderer.prototype.getYOffset = function() {
  return this.offset_y;
}


Renderer.prototype.clear = function() {
  this.canvas.width |= 0;
}


Renderer.prototype.renderGrid = function(pGridSize) {

  let g  = isNaN(pGridSize) ? Constants.DEFAULT_GRID_SIZE : pGridSize;
  let g2 = g / 2;

  this.context.strokeStyle = GRID_STYLE;

  for (var i = (this.offset_x % g) - g2 ; i < this.width; i += g) {
    
    this.context.beginPath();
    this.context.moveTo(i + g2, 0);
    this.context.lineTo(i + g2, this.height);
    this.context.stroke();    
  }

  for (var i = this.offset_y % g - g2; i < this.height; i += g) {
    this.context.beginPath();
    this.context.moveTo(0, i + g2);
    this.context.lineTo(this.width, i + g2);
    this.context.stroke();

  }
  if (this.offset_x >= 0 && this.offset_x <= this.width) {

    this.context.strokeStyle = CENTER_STYLE;

    this.context.beginPath();
    this.context.moveTo(this.offset_x, 0);
    this.context.lineTo(this.offset_x, this.height);
    this.context.stroke();
  }
  if (this.offset_y >= 0 && this.offset_y <= this.height) {
    this.context.beginPath();
    this.context.moveTo(0, this.offset_y);
    this.context.lineTo(this.width, this.offset_y);
    this.context.stroke();
  }

}

Renderer.prototype.move = function(dx, dy) {
  this.offset_x += dx;
  this.offset_y += dy;

}

Renderer.prototype.renderBodyOn = function(body, x, y) {
  this.context.beginPath();
  this.context.fillStyle = body.color;
  this.context.arc(x - this.canvas.offsetLeft, y - this.canvas.offsetTop, 
             //(1 / SCALE >= RADIUS_SCALE_THRESHOLD) ? 8 : body.radius * SCALE * 1000,
             8, 0, 2 * Math.PI);
  this.context.fill();
}

  
Renderer.prototype.renderBody = function(body) {
  this.context.beginPath();
  this.context.fillStyle = body.color;
  this.context.arc((body.x * this.scale) + this.offset_x,  (body.y * this.scale) + this.offset_y, 8 , 0, 2 * Math.PI);
  this.context.fill();
}

Renderer.prototype.renderBodyVelocity = function(body, vscale) {
  var px = body.tx - this.canvas.offsetLeft;
  var py = body.ty - this.canvas.offsetTop;
  var pvx = body.tvx - this.canvas.offsetLeft;
  var pvy = body.tvy - this.canvas.offsetTop;

  this.context.moveTo(px , py);
  this.context.lineTo(pvx, pvy);
  this.context.stroke();
  this.context.fillText('Vx:' + ((body.tvx - body.tx) * vscale / 1000) + ' km/s, Vy: ' + ((body.ty - body.tvy) * vscale / 1000)+ ' km/s', pvx, pvy );
}


Renderer.prototype.setScale = function(scale) {
  this.scale = scale;
}

Renderer.prototype.clientToXViewport = function(clientX) {
  return clientX - this.canvas.offsetLeft - this.offset_x;
}

Renderer.prototype.clientToYViewport = function(clientY) {
  return clientY - this.canvas.offsetTop - this.offset_y;
}

Renderer.prototype.renderDistance = function(cx, cy, bodies) {
    for (var i = 0; i < bodies.length; i++) {

      var tx = (bodies[i].x) * this.scale + this.offset_x;
      var ty = (bodies[i].y) * this.scale + this.offset_y;
      

      this.context.strokeStyle = 'black';
      this.context.beginPath();
      this.context.moveTo(cx - this.canvas.offsetLeft, cy - this.canvas.offsetTop);
      this.context.lineTo(tx, ty);
      this.context.stroke();
      this.context.fillStyle = 'black';
      this.context.globalCompositeOperation = 'xor';
      this.context.fillText(this.distanceString(cx - this.canvas.offsetLeft, cy - this.canvas.offsetTop, tx, ty), tx + 15, ty - 15);
    }
  }

Renderer.prototype.distanceString = function(cx, cy, tx, ty) {

  var distance = this.calculateDistance(cx, cy, tx, ty);

  if (distance > UA) {
    return ((distance / UA).toLocaleString()) + ' UA';
  } else {
    return (distance / 1000).toLocaleString() + ' Km.';
  }
}

Renderer.prototype.calculateDistance = function(cx, cy, tx, ty) {
  var dx = cx - tx;
  var dy = cy - ty;
  return Math.sqrt(dx * dx + dy * dy) / this.scale;
}

module.exports = new Renderer();
