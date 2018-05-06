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
const Body = require('./body');
const Vue = require("vue");
let numberFormatter = require('number-formatter');

const glb = typeof window !== 'undefined' ? window : global;

const MODES = {
    POINTER: 1,
    STAR: 2,
    BODY_POINTING: 3,
    BODY_VELOCITY: 4,
    MOVE: 5
};

let requestResizeCheck = null;
let requestCenterCheck = null;
let t1 = 0;
let playing = true;
let mode = 0;
let mx, my = 0;
let orbit_coords = new Array(100 * 2);
let gravityLabApp = null;

function init() {
    initVueApp();
    controls.init(document);
    gravityLab.init();
    renderer.init(controls.getCanvas(), controls.getBackCanvas());
    reset();
    registerEvents();

}

function currentBody(b) {
    if (!gravityLabApp) {
        return null;
    }
    if (b) {
        gravityLabApp.newbody = b;
    }
    return gravityLabApp.newbody;
}

function resetMode() {
    mode = MODES.POINTER;
}

function setDefaults() {
    gravityLabApp.generalParameters.velocityScale = Constants.DEFAULT_VELOCITY_SCALE;
    gravityLabApp.generalParameters.scale = Constants.DEFAULT_SCALE;
    gravityLabApp.generalParameters.g = Constants.G;
    gravityLabApp.generalParameters.timeScale = Constants.DEFAULT_TIME_SCALE;
    gravityLabApp.generalParameters.gridSize = Constants.DEFAULT_GRID_SIZE;
    renderer.setScale(Constants.DEFAULT_SCALE);
    gravityLab.setScale(Constants.DEFAULT_SCALE);
    gravityLab.setTimeScale (Constants.DEFAULT_TIME_SCALE);
    gravityLab.setG(Constants.G);
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

    gravityLabApp.generalParameters.mx = px - controls.getCanvas().offsetLeft - renderer.getXOffset();
    gravityLabApp.generalParameters.my = renderer.getYOffset() - (py - controls.getCanvas().offsetTop);

    gravityLabApp.generalParameters.xpos = (gravityLabApp.generalParameters.mx * gravityLabApp.generalParameters.scale).toLocaleString(); 
    gravityLabApp.generalParameters.ypos = (gravityLabApp.generalParameters.my * gravityLabApp.generalParameters.scale ).toLocaleString();

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
            currentBody().tx = px;
            currentBody().ty = py;
            break;
        case MODES.BODY_POINTING:
            currentBody().tx = px;
            currentBody().ty = py;
            break;
        case MODES.BODY_VELOCITY:
            currentBody().tvx = px;
            currentBody().tvy = py;
            currentBody().vx = (currentBody().tvx - currentBody().tx) * gravityLabApp.generalParameters.velocityScale;
            currentBody().vy = (currentBody().ty - currentBody().tvy) * gravityLabApp.generalParameters.velocityScale;
            break;
    }
}

function onMouseUp(e) {
    var px = e.clientX;
    var py = e.clientY;

    switch (mode) {
        case MODES.MOVE:
            mode = MODES.POINTER;
            break;
        case MODES.STAR:
            gravityLab.addBody(currentBody(), renderer.clientToXViewport(px), renderer.clientToYViewport(py));
            currentBody(new Body());
            mode = MODES.POINTER;
            break;
        case MODES.BODY_POINTING:
            currentBody().tx = px;
            currentBody().ty = py;
            currentBody().tvx = currentBody().tx;
            currentBody().tvy = currentBody().ty;
            mode = MODES.BODY_VELOCITY;
            break;
        case MODES.BODY_VELOCITY:
            gravityLab.addBody(currentBody(),
                renderer.clientToXViewport(currentBody().tx),
                renderer.clientToYViewport(currentBody().ty));
            currentBody(new Body());
            mode = MODES.POINTER;
    }
}

function onMouseDown(e) {
    switch (mode) {
        case MODES.POINTER:
            let px = e.clientX;
            let py = e.clientY;
            setSelected(renderer.clientToXViewport(px) , renderer.clientToYViewport(py));
            mx = e.clientX;
            my = e.clientY;
            mode = MODES.MOVE;
        default:
            break;
    }
}

function frame(t) {
    
    var delta = (t - t1) / 1000;
    t1 = t;
    renderer.clear();

    if (isResizeRequested()) {
        renderer.resizeCanvas();
        cancelResizeRequest();
    }

    if (isCenterRequested()) {
        renderer.center();
        cancelCenterRequest();
    }

    renderer.renderGrid(gravityLabApp.generalParameters.gridSize);

    renderState();

    if (playing) {
        countTime(delta);
        gravityLab.updateState(delta);
    }

    if (mode === MODES.STAR) {
        renderer.renderBodyOn(currentBody(), currentBody().tx, currentBody().ty);
    } else if (mode === MODES.BODY_POINTING) {
        renderer.renderBodyOn(currentBody(), currentBody().tx, currentBody().ty);
        renderer.renderDistance(currentBody().tx, currentBody().ty, gravityLab.getBodies());
    } else if (mode === MODES.BODY_VELOCITY) {
        renderer.renderBodyOn(currentBody(), currentBody().tx, currentBody().ty);
        renderer.renderBodyVelocity(currentBody(), gravityLabApp.generalParameters.velocityScale);
        gravityLab.calculateOrbit(currentBody(),
            renderer.clientToXViewport(currentBody().tx),
            renderer.clientToYViewport(currentBody().ty),
            orbit_coords);
        renderer.renderOrbitPoints(orbit_coords);
    }
    requestAnimationFrame(frame);
}

function renderState() {
    let bodies = gravityLab.getBodies();
    for (var b = 0; b < bodies.length; b++) {
        let body = bodies[b];
        if (body.gravity) {
            //renderVectors(body, context);
        }
        renderer.renderBody(body);
        renderer.traceOrbitsPosition(gravityLab.getBodies());
    }
}

function countTime(t) {
    let st = t * gravityLabApp.generalParameters.timeScale;
    let timeObject = gravityLabApp.totalTime;
    timeObject.total += st;
    st = timeObject.total;
    timeObject.y = (st / (86400 * 365)) | 0;
    timeObject.d = (st / 86400 % 365) | 0;
    timeObject.h = ((st / 3600) % 24) | 0;
    timeObject.m = (st / 60 % 60)| 0;
    timeObject.s = (st % 60)| 0;
}

function bodyCoordsToClientViewport(body) {
    return [(body.x / (gravityLabApp.generalParameters.scale))|0, (body.y / (gravityLabApp.generalParameters.scale))|0];
}

function setSelected(px, py) {
    let bodies = gravityLab.getBodies();
    let selected = null;
    for (var i = 0; i < bodies.length; i++) {
      let body = bodies[i];
      body.selected = false;
      let coords = bodyCoordsToClientViewport(body);
      var x = coords[0];
      var y = coords[1];
      if (x - 10 < px && x + 10 > px && y -10 < py && y + 10 > py) {
        body.selected = true;
        selected = body;
        currentBody(body);
      }
    }
    if (!selected) {
        currentBody(new Body());
    }
    return selected;
  }

function initVueApp() {
    Vue.filter('formatTime', function(value) {
        return numberFormatter('000', value);
    });
    gravityLabApp = new Vue({
        el: '#gravity-lab',
        watch: {
            'generalParameters.scale': function(newValue, oldValue) {
                renderer.clearOrbits();
                gravityLab.setScale(newValue);
                renderer.setScale(newValue);
                if (currentBody().selected) {
                    glb.centerSelected();
                }
            },
            'generalParameters.timeScale': function(newValue, oldValue) {
                gravityLab.setTimeScale(newValue);
            },
            'generalParameters.g': function(newValue, oldValue) {
                gravityLab.setG(newValue);
            }
        },
        data: {
            newbody: new Body(),
            generalParameters: {     
                velocityScale: null,
                scale: null,
                g: null,
                timeScale:null,
                gridSize: null,
                scalePos: 'ua',
                mx: 0,
                my: 0,
                xpos: 0,
                ypos: 0
            },
            totalTime: { total: 0, y: 0, d: 0, h: 0, m: 0, s: 0 },
            selected: {}
        }
    });
}

glb.createStar = function () {
    mode = MODES.STAR;
    currentBody(gravityLab.createStar());
};

glb.createBody = function () {
    mode = MODES.BODY_POINTING;
    currentBody(gravityLab.createBody());
};

glb.resetTime = function () {
    gravityLabApp.totalTime.total = 0;
};

glb.cancel = function () {
    mode = MODES.POINTER;
};

glb.createNewBody = function() {
    var body = gravityLab.createBody();
    body.x = currentBody().x;
    body.y = currentBody().y;
    body.vx = currentBody().vx;
    body.vy = currentBody().vy;
    body.mass = currentBody().mass;
    body.color = currentBody().color;
    body.diameter = currentBody().diameter;
    body.gravity = currentBody().gravity;
    gravityLab.addBody(body);
};

glb.play_stop = function() {
    playing = !playing;
    document.querySelector('#play-button').innerHTML = playing ? '■' : '▶';
};

glb.center = function() {
    requestResize();
    requestCenter();
};

glb.doReset = function() {
    reset();
    glb.center();
};

glb.centerSelected = function() {
    var body = currentBody();
    let coords = bodyCoordsToClientViewport(body);
    renderer.move(controls.getCanvas().width / 2 - (renderer.getXOffset() + coords[0]) , controls.getCanvas().height / 2 - (renderer.getYOffset() - coords[1]));
};

glb.deleteSelected = function() {
    let bodies = gravityLab.getBodies();
    for (let i = 0; i < bodies.length; i++) {
        if (bodies[i].selected) {
            gravityLab.deleteBody(bodies[i]);
            return;
        }
    }
};

init();
requestAnimationFrame(frame);
