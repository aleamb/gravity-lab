/**
 * @file gravity-lab main program
 * 
 * @author Alejandro Ambroa <jandroz@gmail.com>
 * @version 1.0.0
 */

const Constants = require('./constants');
const gravityLab = require('./gravityLab');
const controls = require('./controls');
const renderer = require('./renderer');

const glb = typeof window !== 'undefined' ? window : global;

const MODES = {
  POINTER: 1,
  STAR: 2,
  BODY_POINTING: 3,
  BODY_VELOCITY: 4,
  MOVE: 5
};

let velocityScale = null;
let scale = null;
let requestResizeCheck = null;
let requestCenterCheck = null;
let canvas = null;
let context = null;
let orbits_canvas = null;
let orbits_context = null;
let t1 = 0;
let totalTime = 0;
let time_scale = 0;
let playing = true;
let mode = 0;
let mx, my = 0;
let newbody = null;
let currentBody = null;

function init() {
  controls.init(document);
  renderer.init(controls.getCanvas(), controls.getBackCanvas());
  gravityLab.init();
  reset();
  registerEvents();
}

function resetMode() {
  mode = MODES.POINTER;
}

function setDefaults() {
  time_scale = Constants.DEFAULT_TIME_SCALE;
  controls.setTimeScale(time_scale);
  controls.setGridSize(Constants.DEFAULT_GRID_SIZE);
  controls.setVelocityScale(Constants.DEFAULT_VELOCITY_SCALE);
  controls.setScale(Constants.DEFAULT_SCALE);
  gravityLab.setScale(Constants.DEFAULT_SCALE);
  renderer.setScale(Constants.DEFAULT_SCALE);
}

function requestResize() {
  requestResizeCheck = true;
}

function cancelResizeRequest() {
  requestResizeCheck = false;
}

function isResizeRequested() {
  return requestResizeCheck;
}

function isCenterRequested() {
  return requestCenterCheck;
}

function requestCenter() {
  requestCenterCheck = true;
}

function cancelCenterRequest() {
  requestCenterCheck = false;
}

function reset() {
  gravityLab.reset();
  resetMode();
  setDefaults();
  requestResize();
  requestCenter();
}

function registerEvents() {
  registerMouseEvents();
}

function registerMouseEvents() {
  var canvas = controls.getCanvas();

  canvas.onmousemove = onMouseMove;
  canvas.onmouseup = onMouseUp;
  canvas.onmousedown = onMouseDown;

}

function onMouseMove(e) {
    var px = e.clientX;
    var py = e.clientY;
    
    controls.mouseMove(e.clientX, e.clientY);
    switch (mode) {
      case MODES.POINTER:
      break;
      case MODES.MOVE:
        renderer.clear();
        renderer.move(px - mx, py - my);
        mx = px;
        my = py;
        break;
      case MODES.STAR:
        newbody.tx = px;
        newbody.ty = py;
        break;
      case MODES.BODY_POINTING:
        newbody.tx = px;
        newbody.ty = py;
        break;
      case MODES.BODY_VELOCITY:
        newbody.tvx = px;
        newbody.tvy = py;
        break;
    }
}

function onMouseUp(e) {
  var px = e.clientX;
  var py = e.clientY;

  switch (mode) {
    case MODES.MOVE:
      //selected = getSelected(px, py);
      mode = MODES.POINTER;
      break;
    case MODES.MOVE:
      mode = MODES.POINTER;
      break;
    case MODES.STAR:
      gravityLab.addBody(newbody, renderer.clientToXViewport(px), renderer.clientToYViewport(py));
      newbody = null;
      mode = MODES.POINTER;
      break;
    case MODES.BODY_POINTING:
      newbody.tx = px;
      newbody.ty = py;
      newbody.tvx = newbody.tx;
      newbody.tvy = newbody.ty;
      mode = MODES.BODY_VELOCITY;
    case MODES.BODY_VELOCITY:
      gravityLab.addBody(newbody,
          renderer.clientToXViewport(px), 
          renderer.clientToYViewport(py),
          (body.tvx - body.tx) * controls.getVelocityScale(),
          (body.ty - body.tvy) * controls.getVelocityScale());
      newbody = null;
      mode = MODES.POINTER;
    }
}

function onMouseDown(e) {
  switch (mode) {
    case MODES.POINTER:
      mx = e.clientX;
      my = e.clientY;
      mode = MODES.MOVE;
      break;
  }
} 

window.createStar = function() {
  mode = MODES.STAR;
  newbody = gravityLab.createStar();
}

window.createBody = function() {
  mode = MODES.BODY_POINTING;
  newbody = gravityLab.createBody();
}

  
  function frame(t) {  

    var delta = t - t1;
    t1 = t;
    totalTime += (delta / 1000);

    renderer.clear();

    if (isResizeRequested()) {
      renderer.resizeCanvas(context, orbits_context);
      cancelResizeRequest();
      controls.setOffsets();
    }

    if (isCenterRequested()) {
      renderer.center();
      cancelCenterRequest();
      controls.setOffsets(renderer.getXOffset(), renderer.getYOffset());
    }
    
    renderer.renderGrid(controls.getGridSize());

    renderState();

    if (playing) {
      controls.showTime(totalTime);
      gravityLab.updateState(totalTime);
    } 


    if (mode === MODES.STAR) {
      renderer.renderBodyOn(newbody, newbody.tx, newbody.ty);
    } else if (mode === MODES.BODY_POINTING) {
      renderer.renderBodyOn(newbody, newbody.tx, newbody.ty);
      renderer.renderDistance(newbody.tx, newbody.ty, gravityLab.getBodies());
      
    } else if (mode === MODES.BODY_VELOCITY) {
        renderer.renderBodyOn(newbody, newbody.tx, newbody.ty);
        renderer.renderBodyVelocity(newbody, controls.getVelocityScale());

        //renderOrbitOnPosition(newbody, bodies,  context);
    }

    requestAnimationFrame(frame);
  }
  
  function renderState() {
    let bodies = gravityLab.getBodies();
    for (var b = 0; b < bodies.length; b++) {
      let body = bodies[b];
      if (body.gravity) {
        //renderOrbit(body, bodies, orbits_canvas, orbits_context, context);
        //renderVectors(body, context);
      }
      renderer.renderBody(body);
    }
  }

init();
requestAnimationFrame(frame);
