/**
 * @file gravity-lab.
 * 
 * @author Alejandro Ambroa <jandroz@gmail.com>
 * @version 1.0.0
 */

 
const Constants = require('./constants');
let Body = require('./body.js');

let GravityLab = function() {
    this.bodies = null;
    this.t1 = null;
    this.totalTime = null;
    this.newbody = null;
    this.scale = null;
}

GravityLab.prototype.init = function() {
  this.reset();
}
GravityLab.prototype.reset = function() {
    this.bodies = [];
    this.t1 = 0;
    this.totalTime = 0;
}
GravityLab.prototype.setScale = function(pScale) {
  this.scale = pScale;
}
GravityLab.prototype.createStar = function() {

    this.newbody = new Body();
    this.newbody.radius = Constants.STAR_DEFAULT_RADIUS;
    this.newbody.mass = Constants.STAR_DEFAULT_MASS;
    this.newbody.type = Body.BODY_TYPES.STAR;
    this.newbody.color = Constants.STAR_DEFAULT_COLOR;
    return this.newbody;
}

GravityLab.prototype.addBody = function(body, xPos, yPos) {
    body.x = xPos / this.scale;
    body.y = yPos / this.scale;
    this.bodies.push(body);
}

GravityLab.prototype.getBodies = function() {
    return this.bodies;
}

GravityLab.prototype.updateState = function(t) {

}

module.exports = new GravityLab();

/*
  var orbits_canvas;
  var orbits_context;
  var canvas = null;
  var context = null;
  var playing = true;
  var totalTime = 0;
  var selected = null;

  var WIDTH = 0;
  var HEIGHT = 0;
  
  var t1 = 0;
  var mode = MODES.pointer;
  var DESP_X = 0;
  var DESP_Y = 0;
  var mx = 0;
  var my = 0;
  var orbits_buffer;
  
  var newbody = null;
  var newstar = null;
  
  var cBody= {};
  var cBody2= {};
  var cBody3= {};


  var d0 = d1 = d2 = d3 = d4 = {x:0, y: 0, vx: 0, vy: 0};

  var F = {};

  var requestCenter = true;
  var requestResizeBackCanvas = true;
  
  function calculateGForce(body1, body2, force, g) {
    var dx = body2.x - body1.x;
    var dy = body2.y - body1.y;
    if (dx === 0 && dy === 0) {
      return { x:0, y:0, mod: 0 };
    } 
    var d2 = dx * dx + dy * dy;
    var d = Math.sqrt(d2);
    force.mod = - (g * (body1.mass * body2.mass / (d*d*d))*(d));
  
    // calcular componentes x, y de la fuerza
    force.x = force.mod * (dx / d);
    force.y = force.mod * (dy / d);
  
    return force;
  }
  */


/*
 if (playing) {  
    totalTime += timestep;
  } 
  if (bodies.length > 0) {
    var body;
    var dt = 100;
    var limit = (timestep / dt) | 0;
    if (playing) {
      for (var l = 0; l < limit; l++) {
        for (var i = 0; i < bodies.length; i++) {
          body = bodies[i];
          if (body.proc) {

            var fx = fy = f = 0;

            for (var b = 0; b < bodies.length; b++) {
              if (i !== b) {
                calculateGForce(body, bodies[b], F, G);
                fx += F.x;
                fy += F.y;
              }
            }
            body.fx = fx;
            body.fy = fy;
            body.vx += fx / body.mass * dt;
            body.vy += fy / body.mass * dt;
          }
        }
        for (var b = 0; b < bodies.length; b++) {
          body = bodies[b];
          if (body.proc) {
            body.x += body.vx * dt;
            body.y += body.vy * dt;
          }
        }
      }
    }
    */