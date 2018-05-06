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
  this.velocityScale = null;
  this.cBody = {};
  this.F = {};
  this.time_scale = null;
  this.g = 0;
};

GravityLab.prototype.init = function () {
  this.reset();
};

GravityLab.prototype.reset = function () {
  this.bodies = [];
  this.t1 = 0;
  this.totalTime = 0;
};

GravityLab.prototype.setG = function(value) {
  this.g = Number(value);
};

GravityLab.prototype.setScale = function (pScale) {
  this.scale = 1 / (pScale);
};

GravityLab.prototype.setTimeScale = function (value) {
  this.time_scale = value;
};

GravityLab.prototype.createStar = function () {

  this.newbody = new Body();
  this.newbody.gravity = false;
  this.newbody.diameter = Constants.STAR_DEFAULT_DIAMETER;
  this.newbody.mass = Constants.STAR_DEFAULT_MASS;
  this.newbody.type = Body.BODY_TYPES.STAR;
  this.newbody.color = Constants.STAR_DEFAULT_COLOR;
  return this.newbody;
};

GravityLab.prototype.createBody = function () {

  this.newbody = new Body();
  this.newbody.diameter = Constants.BODY_DEFAULT_DIAMETER;
  this.newbody.mass = Constants.BODY_DEFAULT_MASS;
  this.newbody.type = Body.BODY_TYPES.BODY;
  this.newbody.color = '#' + (Math.random() * 255 | 0).toString(16).toUpperCase() + (Math.random() * 255 | 0).toString(16).toUpperCase() +  (Math.random() * 255 | 0).toString(16).toUpperCase() ;
  return this.newbody;
};

GravityLab.prototype.addBody = function (body, xPos, yPos) {

  if (xPos !== undefined)
    body.x = xPos / this.scale;
  if (yPos !== undefined)
    body.y = yPos / this.scale;

  this.bodies.push(body);
};

GravityLab.prototype.getBodies = function () {
  return this.bodies;
};

/**
 * Calculate position of all bodies for step time using Euler's integration
 * @param {*} t 
 */

GravityLab.prototype.updateState = function (t) {

  let body;
  let dt = 100;
  let timestep = t * this.time_scale;
  let limit = (timestep / dt) | 0;
  let bodies = this.bodies;
  let F = this.F;
  let G = this.g;

  this.scaleBodies();
 
  for (let l = 0; l < limit; l++) {
    for (let i = 0; i < bodies.length; i++) {
      body = bodies[i];
      if (body.gravity) {
        let fx = 0;
        let fy = 0;
        for (let b = 0; b < bodies.length; b++) {
          if (i !== b) {
            this.calculateForce(body, bodies[b], F, G);
            fx += F.x;
            fy += F.y;
          }
        }
        body.vx += fx / body.mass * dt;
        body.vy += fy / body.mass * dt;
      }
    }
    for (let b = 0; b < bodies.length; b++) {
      body = bodies[b];
      if (body.gravity) {
        body.x += body.vx * dt;
        body.y += body.vy * dt;
      }
    }
  }
  this.undoScaleBodies();
};

GravityLab.prototype.calculateForce = function (body1, body2, force, g) {

  let dx = (body2.x - body1.x) ;
  let dy = (body2.y - body1.y) ;
  let d2 = dx * dx + dy * dy;
  let d = Math.sqrt(d2);

  force.mod = - (g * (body1.mass * body2.mass / (d * d * d)) * (d));

  force.x = force.mod * (dx / d);
  force.y = force.mod * (dy / d);

  return force;
};

/**
 * Calculate orbit points using Verlet's integration
 * 
 * @param {*} body 
 * @param {*} outOrbitPoints 
 */

GravityLab.prototype.calculateOrbit = function (body, x, y, outOrbitPoints) {

  if (this.bodies.length >= 1) {
    let dt = 667;
    let g = this.g / 1000;
    let cBody = this.cBody;
    let F = this.F;
    let pBodies = this.bodies;

    cBody.mass = body.mass;
    cBody.x = x / (this.scale ) * 1000;
    cBody.y = y / (this.scale ) * 1000;
    cBody.vx = body.vx * 1000;
    cBody.vy = body.vy * 1000;

    let fx = 0;
    let fy = 0;

    let integration_steps = 80000;
    let register_point_threshold = (integration_steps / (outOrbitPoints.length / 2 - 1)) | 0;

    this.scaleBodies();

    for (let i = 0, point = 0; i < integration_steps; i++) {

      if (i === 0 || i > (register_point_threshold * point)) {
        outOrbitPoints[point] = cBody.x;
        outOrbitPoints[point + 1] = cBody.y;
        point += 2;
      }

      for (var b = 0; b < pBodies.length; b++) {
        this.calculateForce(cBody, pBodies[b], F, g);
        fx += F.x;
        fy += F.y;
      }

      let ax = fx / cBody.mass * dt;
      let ay = fy / cBody.mass * dt;

      cBody.x = cBody.x + cBody.vx * dt + ax * dt / 2;
      cBody.y = cBody.y + cBody.vy * dt + ay * dt / 2;

      let prev_ax = ax;
      let prev_ay = ay;
      fx = fy = 0;

      for (let b = 0; b < pBodies.length; b++) {
        this.calculateForce(cBody, pBodies[b], F, g);
        fx += F.x;
        fy += F.y;
      }
      ax = fx / cBody.mass * dt;
      ay = fy / cBody.mass * dt;

      cBody.vx = cBody.vx + (prev_ax + ax) / 2 * dt;
      cBody.vy = cBody.vy + (prev_ay + ay) / 2 * dt;

    }

    this.undoScaleBodies();

    for (let i = 0; i < outOrbitPoints.length; i++) {
      outOrbitPoints[i] /= 1000;
    }
    
  }
};

GravityLab.prototype.deleteBody = function(body) {
  let index = 0;
  for (let i = 0; i < this.bodies.length; i++) {
    if (body === this.bodies[i]) {
      index = i;
      break;
    }
  }
  this.bodies.splice(index, 1);
};

GravityLab.prototype.scaleBodies = function() {
  for (let i = 0; i < this.bodies.length; i++) {
    let body = this.bodies[i];
    body.x *= 1000;
    body.y *= 1000;
    body.vx *= 1000;
    body.vy *= 1000;
  }
};

GravityLab.prototype.undoScaleBodies = function() {
  for (let i = 0; i < this.bodies.length; i++) {
    let body = this.bodies[i];
    body.x /= 1000;
    body.y /= 1000;
    body.vx /= 1000;
    body.vy /= 1000;
  }
};

module.exports = new GravityLab();
