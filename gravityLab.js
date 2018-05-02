/**
 * @file gravity-lab.
 * 
 * @author Alejandro Ambroa <jandroz@gmail.com>
 * @version 1.0.0
 */


const Constants = require('./constants');
let Body = require('./body.js');

let GravityLab = function () {
  this.bodies = null;
  this.t1 = null;
  this.totalTime = null;
  this.newbody = null;
  this.scale = null;
  this.cBody = {};
  this.F = {};
}

GravityLab.prototype.init = function () {
  this.reset();
}
GravityLab.prototype.reset = function () {
  this.bodies = [];
  this.t1 = 0;
  this.totalTime = 0;
}
GravityLab.prototype.setScale = function (pScale) {
  this.scale = pScale;
}
GravityLab.prototype.createStar = function () {

  this.newbody = new Body();
  this.newbody.radius = Constants.STAR_DEFAULT_RADIUS;
  this.newbody.mass = Constants.STAR_DEFAULT_MASS;
  this.newbody.type = Body.BODY_TYPES.STAR;
  this.newbody.color = Constants.STAR_DEFAULT_COLOR;
  return this.newbody;
}

GravityLab.prototype.createBody = function () {

  this.newbody = new Body();
  this.newbody.radius = Constants.BODY_DEFAULT_RADIUS;
  this.newbody.mass = Constants.BODY_DEFAULT_MASS;
  this.newbody.type = Body.BODY_TYPES.BODY;
  this.newbody.color = 'rgba(' + (Math.random() * 255 | 0) + ',' + (Math.random() * 255 | 0) + ',' + (Math.random() * 255 | 0) + ', 1.0)';
  return this.newbody;
}

GravityLab.prototype.addBody = function (body, xPos, yPos) {
  body.x = xPos / this.scale;
  body.y = yPos / this.scale;
  this.bodies.push(body);
}

GravityLab.prototype.getBodies = function () {
  return this.bodies;
}

GravityLab.prototype.updateState = function (t) {

}

GravityLab.prototype.calculateForce = function(body1, body2, force, g) {

  var dx = body2.x - body1.x;
  var dy = body2.y - body1.y;
  var d2 = dx * dx + dy * dy;
  var d = Math.sqrt(d2);
  
  force.mod = - (g * (body1.mass * body2.mass / (d*d*d))*(d));

  force.x = force.mod * (dx / d);
  force.y = force.mod * (dy / d);

  return force;
}
/**
 * Calculate orbit points using Verlet's integration
 * 
 * @param {*} body 
 * @param {*} outOrbitPoints 
 */
GravityLab.prototype.calculateOrbit = function (body, x, y, outOrbitPoints) {

  if (this.bodies.length >= 1) {
    var bx, by, nx, ny;
    var dt = 667;
    var g = Constants.G / 1000;

    cBody.mass = body.mass;
    cBody.x = x / this.scale;
    cBody.y = y / this.scale;
    cBody.vx = (body.tvx - body.tx) * V_SCALE;
    cBody.vy = (body.tvy - body.ty) * V_SCALE;
    cBody.radius = 1;
    cBody.color = 'red';
    cBody.tx = body.tx;
    cBody.ty = body.ty;

    var fx = 0;
    var fy = 0;

    // verlet velocity integration method

    this.context.beginPath();
    this.context.moveTo(cBody.tx, cBody.ty);



    for (var i = 0; i < 20000; i++) {

      for (var b = 0; b < pBodies.length; b++) {
        if (body !== pBodies[b]) {
          calculateForce(cBody, pBodies[b], F, g);
          fx += F.x;
          fy += F.y;
        }
      }

      var ax = fx / cBody.mass * dt;
      var ay = fy / cBody.mass * dt;

      cBody.x = cBody.x + cBody.vx * dt + ax * dt / 2;
      cBody.y = cBody.y + cBody.vy * dt + ay * dt / 2;

      var prev_ax = ax;
      var prev_ay = ay;
      fx = fy = 0;

      for (var b = 0; b < pBodies.length; b++) {
        if (body !== pBodies[b]) {
          calculateForce(cBody, pBodies[b], F, g);
          fx += F.x;
          fy += F.y;
        }
      }
      ax = fx / cBody.mass * dt;
      ay = fy / cBody.mass * dt;

      cBody.vx = cBody.vx + (prev_ax + ax) / 2 * dt
      cBody.vy = cBody.vy + (prev_ay + ay) / 2 * dt

      this.context.lineTo(toCanvasCoordX(cBody), toCanvasCoordY(cBody));
    }
    this.context.stroke();
  }
}

module.exports = new GravityLab();
