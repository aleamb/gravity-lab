/**
 * @file controls.js
 * 
 * Warpper for HTML page elements.
 * 
 * @author Alejandro Ambroa <jandroz@gmail.com>
 * @version 1.0.0
 */

let Controls = function() {
    this.container = null;
    this.canvas = null;
    this.backCanvas = null;

};

Controls.prototype.init = function(pContainer) {

    this.container = pContainer;
    this.canvas = pContainer.querySelector('#c');
    this.backCanvas = pContainer.querySelector('#backcanvas');

};

Controls.prototype.getCanvas = function() {
    return this.canvas;
};

Controls.prototype.getBackCanvas = function() {
    return this.backCanvas;
};


module.exports = new Controls();
