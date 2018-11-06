/**
 * @file body.js
 * 
 * CLas for objects in the universe.
 * 
 * @author Alejandro Ambroa <jandroz@gmail.com>
 */

const Body = function () {
  this.gravity = true;
  this.vx = 0;
  this.vy = 0;
  this.diameter = 0;
  this.x = 0;
  this.y = 0;
  this.mass = 0;
  this.type = 0;
  this.color = '#000000';
};

Body.BODY_TYPES = {
  STAR: 1,
  PLANET: 2,
};

module.exports = Body;
