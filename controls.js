/**
 * @file controls.js
 * 
 * @author Alejandro Ambroa <jandroz@gmail.com>
 * @version 1.0.0
 */
let numberFormatter = require('number-formatter');

let Controls = function() {
    this.container = null;
    this.scaleField = null;
    this.velScaleField = null;
    this.gridSizeField = null;
    this.mouseXField = null;
    this.mouseYField = null;
    this.timeScaleField = null;
    this.timeInfoYears = null;
    this.timeInfoMonths = null;
    this.timeInfoDays = null;
    this.timeInfoMinutes = null;
    this.timeInfoSeconds = null;
    this.gridSize = 0;
    this.velocityScale = 0;
    this.scale = 0;
};

Controls.prototype.init = function(pContainer) {

    this.container = pContainer;

    this.scaleField = pContainer.querySelector('#field-scale');
    this.velScaleField = pContainer.querySelector('#field-vscale');
    this.gridSizeField = pContainer.querySelector('#field-grid');
    this.canvas = pContainer.querySelector('#c');
    this.backCanvas = pContainer.querySelector('#backcanvas');
    this.mouseXField = pContainer.querySelector('#mx');
    this.mouseYField = pContainer.querySelector('#my');
    this.timeScaleField = pContainer.querySelector('#field-tscale');

    this.timeInfoYears = pContainer.querySelector("#info-years");
    this.timeInfoMonths = pContainer.querySelector("#info-days");
    this.timeInfoDays = pContainer.querySelector("#info-hours");
    this.timeInfoMinutes = pContainer.querySelector("#info-minutes");
    this.timeInfoSeconds =  pContainer.querySelector("#info-seconds");
}

Controls.prototype.setGridSize = function(pValue) {
    this.gridSizeField.value = Number(pValue);
    this.gridSize = Number(pValue);
}
Controls.prototype.setVelocityScale = function(pValue) {
    this.velScaleField.value = Number(pValue);
    this.velocityScale = Number(pValue);
}

Controls.prototype.setScale = function(pValue) {
    this.scaleField.value = Number(1 / pValue / 1000).toFixed(1);
    this.scale = Number(pValue);
}

Controls.prototype.getCanvas = function() {
    return this.canvas;
}

Controls.prototype.getBackCanvas = function() {
    return this.canvas;
}

Controls.prototype.getGridSize = function() {
    return this.gridSize;
}

Controls.prototype.getVelocityScale = function() {
    return this.velocityScale;
}

Controls.prototype.getScale = function() {
    return this.scale;
}

Controls.prototype.setOffsets = function(offset_x, offset_y) {
    this.offset_x = offset_x;
    this.offset_y = offset_y;
}

Controls.prototype.mouseMove = function(mx, my) {
    var x = mx - this.canvas.offsetLeft;
    var y = my - this.canvas.offsetTop;

    this.mouseXField.innerHTML = x - this.offset_x; 
    this.mouseYField.innerHTML = y - this.offset_y;

}

Controls.prototype.showTime = function(t) {
    var st = t * this.timeScale;
    this.timeInfoYears.innerHTML = numberFormatter('000', (st / (86400 * 365))|0);
    this.timeInfoMonths.innerHTML = numberFormatter('000', (st / 86400 % 365) | 0);
    this.timeInfoDays.innerHTML = numberFormatter('00', ((st / 3600) % 24) | 0);
    this.timeInfoMinutes.innerHTML = numberFormatter('00', (st / 60 % 60) | 0);
    this.timeInfoSeconds.innerHTML = numberFormatter('00', (st % 60)|0);
}

Controls.prototype.setTimeScale = function(timeScale) {
    this.timeScale = timeScale;
    this.timeScaleField.value = timeScale;
}

module.exports = new Controls();
