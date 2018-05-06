/**
 * @file controls.js
 * 
 * @author Alejandro Ambroa <jandroz@gmail.com>
 * @version 1.0.0
 */
let numberFormatter = require('number-formatter');
let Constants = require('./constants');

const UA_VALUE = 'ua';


let Controls = function() {

    this.container = null;
    this.canvas = null;
    this.backCanvas = null;

};

Controls.prototype.init = function(pContainer) {

    this.container = pContainer;
    this.canvas = pContainer.querySelector('#c');
    this.backCanvas = pContainer.querySelector('#backcanvas');

}


Controls.prototype.getCanvas = function() {
    return this.canvas;
}

Controls.prototype.getBackCanvas = function() {
    return this.backCanvas;
}


module.exports = new Controls();
