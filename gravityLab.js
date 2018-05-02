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

GravityLab.prototype.createBody = function() {

  this.newbody = new Body();
  this.newbody.radius = Constants.BODY_DEFAULT_RADIUS;
  this.newbody.mass = Constants.BODY_DEFAULT_MASS;
  this.newbody.type = Body.BODY_TYPES.BODY;
  this.newbody.color = 'rgba(' + (Math.random() * 255|0) + ',' + (Math.random() * 255|0) + ',' + (Math.random() * 255|0) +', 1.0)';
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
