/**
 * @file gravity-lab.
 * 
 * @author Alejandro Ambroa <jandroz@gmail.com>
 * @version 1.0.0
 */
const Constants = require('./constants');

let GravityLab = function() {
    this.bodies = null;
    this.t1 = null;
    this.totalTime = null;
}

GravityLab.prototype.init = function() {
  this.reset();
}
GravityLab.prototype.reset = function() {
    this.bodies = [];
    this.t1 = 0;
    this.totalTime = 0;
}
GravityLab.prototype.createStar = function() {
    return {
        gravity: false,
        vx: 0,
        vy: 0,
        radius: Constants.STAR_DEFAULT_RADIUS,
        x: 0,
        y: 0,
        mass: Constants.STAR_DEFAULT_MASS,
        tx: 0,
        ty: 0,
        type: BODY_TYPES.STAR,
        color: Constants.STAR_DEFAULT_COLOR
      };
}

module.exports = new GravityLab();
