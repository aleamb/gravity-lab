/**
 * @file gravity-lab.
 * 
 * @author Alejandro Ambroa <jandroz@gmail.com>
 * @version 1.0.0
 */
const Constants = require('./constants');

var GravityLab = function() {
    this.bodies = [];
    this.t1 = 0;
    this.totalTime = 0;
}

GravityLab.prototype.init = function() {
  this.eraseAll();
}
GravityLab.prototype.reset = function() {
    bodies = [];
}

