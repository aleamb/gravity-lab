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

let Renderer = function () {
  this.canvas = null;
  this.back_canvas = null;
  this.context = null;
  this.orbits_context = null;
  this.width = 0;
  this.height = 0;
  this.offset_x = 0;
  this.offset_y = 0;
  this.renderDiameter = false;
};

Renderer.prototype.init = function (pCanvas, pBackCanvas) {
  this.canvas = pCanvas;
  this.back_canvas = pBackCanvas;
  this.context = pCanvas.getContext('2d');
  this.orbits_context = pBackCanvas.getContext('2d');
};

Renderer.prototype.resizeCanvas = function () {
  this.clearOrbits();
  this.width = this.canvas.clientWidth;
  this.height = this.canvas.clientHeight;

  this.canvas.width = this.width;
  this.canvas.height = this.height;

  this.back_canvas.width = this.width;
  this.back_canvas.height = this.height;
};

Renderer.prototype.center = function () {
  this.clearOrbits();
  this.offset_x = this.width / 2;
  this.offset_y = this.height / 2;
};

Renderer.prototype.getXOffset = function () {
  return this.offset_x;
};

Renderer.prototype.getYOffset = function () {
  return this.offset_y;
};


Renderer.prototype.clear = function () {
  this.canvas.width |= 0;
};


Renderer.prototype.renderGrid = function (pGridSize) {

  let g = isNaN(pGridSize) ? Constants.DEFAULT_GRID_SIZE : pGridSize;
  let g2 = g / 2;

  this.context.strokeStyle = GRID_STYLE;

  for (let i = (this.offset_x % g) - g2; i < this.width; i += g) {

    this.context.beginPath();
    this.context.moveTo(i + g2, 0);
    this.context.lineTo(i + g2, this.height);
    this.context.stroke();
  }

  for (let i = this.offset_y % g - g2; i < this.height; i += g) {
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

};

Renderer.prototype.move = function (dx, dy) {
  this.back_canvas.width |= 0;
  this.offset_x += dx;
  this.offset_y += dy;
  
};

Renderer.prototype.renderBodyOn = function (body, x, y) {
  this.context.beginPath();
  this.context.fillStyle = body.color;
  this.context.arc(x - this.canvas.offsetLeft, y - this.canvas.offsetTop,  this.renderDiameter ? body.diameter  / 2 * this.scale : 8, 0, 2 * Math.PI);
  this.context.fill();
};

Renderer.prototype.clientToXViewport = function (clientX) {
  return clientX - this.canvas.offsetLeft - this.offset_x;
 
};

Renderer.prototype.clientToYViewport = function (clientY) {
  return this.offset_y - clientY + this.canvas.offsetTop;
};


Renderer.prototype.renderBody = function (body) {
  this.context.beginPath();
  this.context.fillStyle = body.color;
  this.context.arc((body.x * this.scale) + this.offset_x, this.offset_y - (body.y * this.scale), this.renderDiameter ? body.diameter  / 2 * this.scale : 8, 0, 2 * Math.PI);
  this.context.fill();
  if (body.selected) {
    this.context.beginPath();
    this.context.strokeStyle = 'gray';
    this.context.arc((body.x * this.scale) + this.offset_x, this.offset_y - (body.y * this.scale), this.renderDiameter ? body.diameter  / 2 * this.scale + 5 : 12, 0, 2 * Math.PI);
    this.context.stroke();
  }
};

Renderer.prototype.renderBodyVelocity = function (body, vscale) {
  var px = body.tx - this.canvas.offsetLeft;
  var py = body.ty - this.canvas.offsetTop;
  var pvx = body.tvx - this.canvas.offsetLeft;
  var pvy = body.tvy - this.canvas.offsetTop;

  this.context.moveTo(px, py);
  this.context.lineTo(pvx, pvy);
  this.context.stroke();
  this.context.fillText('Vx:' + ((body.tvx - body.tx) * vscale).toFixed(3) + ' Km/s, Vy: ' + ((body.ty - body.tvy) * vscale).toFixed(3) + ' Km/s', pvx, pvy);
};


Renderer.prototype.setScale = function (scale) {
  this.scale = 1 / (scale);
  this.renderDiameter = scale <= Constants.DIAMETER_SCALE_THRESHOLD;
};

Renderer.prototype.renderDistance = function (cx, cy, bodies) {
  for (var i = 0; i < bodies.length; i++) {

    var tx = (bodies[i].x) * this.scale + this.offset_x;
    var ty = this.offset_y - (bodies[i].y) * this.scale;


    this.context.strokeStyle = 'black';
    this.context.beginPath();
    this.context.moveTo(cx - this.canvas.offsetLeft, cy - this.canvas.offsetTop);
    this.context.lineTo(tx, ty);
    this.context.stroke();
    this.context.fillStyle = 'black';
    this.context.globalCompositeOperation = 'xor';
    this.context.fillText(this.distanceString(cx - this.canvas.offsetLeft, cy - this.canvas.offsetTop, tx, ty), tx + 15, ty - 15);
  }
};

Renderer.prototype.distanceString = function (cx, cy, tx, ty) {

  var distance = this.calculateDistance(cx, cy, tx, ty);

  if (distance > Constants.UA) {
    return ((distance /Constants.UA).toLocaleString()) + ' UA';
  } else {
    return (distance).toLocaleString() + ' Km.';
  }
};
Renderer.prototype.calculateDistance = function (cx, cy, tx, ty) {
  var dx = cx - tx;
  var dy = cy - ty;
  return Math.sqrt(dx * dx + dy * dy) / this.scale;
};

Renderer.prototype.renderOrbitPoints = function (points) {

  this.context.beginPath();
  let npoints = points.length >> 1;

  this.context.strokeStyle = 'black';


  this.context.moveTo(points[0] * this.scale + this.offset_x, this.offset_y - points[1] * this.scale);

  for (let p = 2; p < npoints; p += 2) {
    this.context.lineTo(points[p] * this.scale + this.offset_x, this.offset_y - points[p + 1] * this.scale);
    this.context.stroke();

  }
};

Renderer.prototype.traceOrbitsPosition = function (bodies) {
  for (let b = 0; b < bodies.length; b++) {
    let body = bodies[b];

    this.orbits_context.beginPath();
    this.orbits_context.fillStyle = body.color;
    this.orbits_context.arc((body.x * this.scale) + this.offset_x, + this.offset_y - (body.y * this.scale), 2, 0, 2 * Math.PI);
    this.orbits_context.fill();
  }
  if (bodies.length)
    this.context.drawImage(this.back_canvas, 0, 0);

};

Renderer.prototype.clearOrbits = function() {
  this.back_canvas.width |= 0;
};

module.exports = new Renderer();
