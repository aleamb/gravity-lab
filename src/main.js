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
const vue = require("vue");
const numberFormatter = require('number-formatter');

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

let context = {
    velocityScale : 0,
    scale: 0,
    G: 0,
    timeScale: 0,
    gridSize: 0,
    totalTime: { total: 0, y: 0, d: 0, h: 0, m: 0, s: 0 },
    mx: 0,
    my: 0,
    xpos: 0,
    ypos: 0
};

let current_body = null;

// reactive variables
let generalParametersFormData = {
    velocityScale : 0,
    scale: 0,
    G: 0,
    timeScale: 0,
    gridSize: 0,
    totalTime: { total: 0, y: 0, d: 0, h: 0, m: 0, s: 0 }
};

let coordInfo = {
    screen_x:0,
    screen_y: 0,
    universe_x: 0,
    universe_y: 0
};

let timeInfo = {
    year: 0.0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0
};

let bodyFormData = {
    ux:0,
    uy:0,
    mass:0,
    positionEditable: true,
    velocityVectorEditable: true,
    velocityVectorToggle: true,
    vx: 0,
    vy: 0,
    diameter: 0,
    color: '#000000'
};

// end of reactive variables

function init() {
    initVueApp();
    controls.init(document);
    gravityLab.init();
    renderer.init(controls.getCanvas(), controls.getBackCanvas());
    reset();
    registerEvents();
}

function currentBody(b) {
    if (b !== undefined) {
        current_body = b;  
    }
    return current_body;
}

function resetMode() {
    mode = MODES.POINTER;
}

function setDefaults() {
    context.velocityScale = Constants.DEFAULT_VELOCITY_SCALE;
    context.scale = Constants.DEFAULT_SCALE;
    context.G = Constants.G;
    context.timeScale = Constants.DEFAULT_TIME_SCALE;
    context.gridSize = Constants.DEFAULT_GRID_SIZE;

    renderer.setScale(Constants.DEFAULT_SCALE);
    gravityLab.setScale(Constants.DEFAULT_SCALE);
    gravityLab.setTimeScale (Constants.DEFAULT_TIME_SCALE);
    gravityLab.setG(Constants.G);

    updateGeneralParametersFormData(context);
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
    currentBody(null);
    updateFormData(null);
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

    context.mx = px - controls.getCanvas().offsetLeft - renderer.getXOffset();
    context.my = renderer.getYOffset() - (py - controls.getCanvas().offsetTop);

    context.xpos = (context.mx * context.scale); 
    context.ypos = (context.my * context.scale);

    updateCoordInfo(context);

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
            currentBody().x = context.xpos;
            currentBody().y = context.ypos;
            updateFormData(currentBody());
            break;
        case MODES.BODY_POINTING:
            currentBody().x = context.xpos;
            currentBody().y = context.ypos;
            updateFormData(currentBody());
            break;
        case MODES.BODY_VELOCITY:
            currentBody().vx = (context.xpos - currentBody().x) / context.scale * context.velocityScale;
            currentBody().vy = (context.ypos -currentBody().y) / context.scale * context.velocityScale;
            updateFormData(currentBody());
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
            object = currentBody()
            gravityLab.addBody(object);
            mode = bodyFormData.velocityVectorToggle ? MODES.BODY_VELOCITY : MODES.POINTER;
            setSelectedBody(object);
            break;
        case MODES.BODY_POINTING:
            mode = bodyFormData.velocityVectorToggle ? MODES.BODY_VELOCITY : MODES.POINTER;
            if (mode == MODES.POINTER)  {
                object = currentBody()
                gravityLab.addBody(object);
                setSelectedBody(object);
            }
            break;
        case MODES.BODY_VELOCITY:
            object = currentBody()
            gravityLab.addBody(object);
            setSelectedBody(object);
            mode = MODES.POINTER;
    }
}

function onMouseDown(e) {
    let px = e.clientX;
    let py = e.clientY;
    switch (mode) {
        case MODES.POINTER:
            mx = e.clientX;
            my = e.clientY;
            bodySelected = setSelected(renderer.clientToXViewport(px) , renderer.clientToYViewport(py));
            mode = MODES.MOVE;
            if (!bodySelected) {
                updateFormData(null);
            }
            break;
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

    renderer.renderGrid(context.gridSize);

    renderState();

    if (playing) {
        countTime(delta);
        gravityLab.updateState(delta);
        updateTimeInfo(context);
    }

    if (currentBody()) {
        if (mode === MODES.BODY_POINTING || mode === MODES.STAR) {
            renderer.renderBody(currentBody());
            renderer.renderDistance(currentBody(), gravityLab.getBodies());
        } else if (mode === MODES.BODY_VELOCITY) {
            renderer.renderBody(currentBody());
            renderer.renderBodyVelocity(currentBody(), context.velocityScale);
            gravityLab.calculateOrbit(currentBody(), orbit_coords);
            renderer.renderOrbitPoints(orbit_coords);
        }
        updateFormData(currentBody());
    }
    requestAnimationFrame(frame);
}

function renderState() {
    let bodies = gravityLab.getBodies();
    for (var b = 0; b < bodies.length; b++) {
        let body = bodies[b];
        renderer.renderBody(body);
        renderer.traceOrbitsPosition(gravityLab.getBodies());
    }
}

function countTime(t) {
    let st = t * context.timeScale;
    let timeObject = context.totalTime;
    timeObject.total += st;
    st = timeObject.total;
    timeObject.y = (st / (86400 * 365));
    timeObject.d = (st / 86400 % 365);
    timeObject.h = ((st / 3600) % 24) ;
    timeObject.m = (st / 60 % 60);
    timeObject.s = (st % 60);
}

function bodyCoordsToClientViewport(body) {
    return [(body.x / (context.scale))|0, (body.y / (context.scale))|0];
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
      } else {
        body.selected = false;
      }
    }
    if (!selected) {
        currentBody(null);
    }
    return selected;
}

function setSelectedBody(object) {
    let bodies = gravityLab.getBodies();
    for (var i = 0; i < bodies.length; i++) {
        if (bodies[i] === object) {
            bodies[i].selected = true;
        } else {
            bodies[i].selected = false;
        }
    }
}

function initVueApp() {

    generalParametersFormData = vue.reactive(generalParametersFormData);
    bodyFormData = vue.reactive(bodyFormData)
    coordInfo = vue.reactive(coordInfo);
    timeInfo = vue.reactive(timeInfo);

    gravityLabApp = vue.createApp({
        watch: {
            'generalParametersFormData.scale': function(newValue) {
                renderer.clearOrbits();
                gravityLab.setScale(newValue);
                renderer.setScale(newValue);
                context.scale = newValue;
                if (currentBody() && currentBody().selected) {
                    glb.centerSelected();
                }
            },
            'generalParametersFormData.timeScale': function(newValue) {
                gravityLab.setTimeScale(newValue);
                context.timeScale = newValue;
            },
            'generalParametersFormData.G': function(newValue) {
                gravityLab.setG(newValue);
            },
            'generalParametersFormData.gridSize': function(newValue) {
                context.gridSize = newValue;
            },
            'generalParametersFormData.velocityScale': function(newValue) {
                context.velocityScale = newValue;
            },
            'bodyFormData.color': function(newValue) {
                b = currentBody();
                if (b) {
                    b.color = newValue;
                }
            },
            'bodyFormData.mass': function(newValue) {
                b = currentBody();
                if (b) {
                    b.mass = newValue;
                }
            },
            'bodyFormData.diameter': function(newValue) {
                b = currentBody();
                if (b) {
                    b.diameter = newValue;
                }
            }
        },
        setup: function() {
            return  {
                generalParametersFormData,
                bodyFormData,
                coordInfo,
                timeInfo
            }
        },
        computed: {
            //formatTotalTime_Y: function() {
                //return numberFormatter('000', context.y);
            //}
        }
    });

    gravityLabApp.mount('#gravity-lab')
}

glb.presetStar = function () {
    setSelected(-1, -1);
    mode = MODES.STAR;
    star = gravityLab.createStar();
    currentBody(star);
    bodyFormData.positionEditable = false;
    bodyFormData.velocityVectorEditable = false;
    bodyFormData.velocityVectorToggle = false;
    updateFormData(star);
};

glb.presetBody = function () {
    setSelected(-1, -1);
    mode = MODES.BODY_POINTING;
    b = gravityLab.createBody();
    bodyFormData.positionEditable = false;
    bodyFormData.velocityVectorEditable = false;
    bodyFormData.velocityVectorToggle = true;
    currentBody(b);
    updateFormData(b);
};

glb.cancelPreset = function () {
    mode = MODES.POINTER;
    bodyFormData.positionEditable = true;
};

glb.resetTime = function () {
    context.totalTime.total = 0;
};

glb.createNewBody = function() {
    if (bodyFormData.mass < 1) {
        alert("Mass must be greater or equal to 1kg");
        return;
    }
    let body = gravityLab.createBody();
    body.x = bodyFormData.ux;
    body.y = bodyFormData.uy;
    body.vx = bodyFormData.vx;
    body.vy = bodyFormData.vy;
    body.mass = bodyFormData.mass;
    body.color = bodyFormData.color;
    body.diameter = bodyFormData.diameter;
    gravityLab.addBody(body);
    currentBody(body);
    setSelectedBody(object);
    updateFormData(body)

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
            break;
        }
    }
    currentBody(null);
    updateFormData(null);
};

glb.eraseAll = function() {
    gravityLab.reset();
};

// update reactive variables

glb.updateFormData = function(obj) {
    if (!obj) {
        bodyFormData.ux = 0;
        bodyFormData.uy = 0;
        bodyFormData.mass = 0;
        bodyFormData.diameter = 0;
        bodyFormData.vx = 0;
        bodyFormData.vy = 0;
        bodyFormData.positionEditable = true;
        bodyFormData.velocityVectorEditable = true;
        bodyFormData.velocityVectorToggle = true;
    } else {
        bodyFormData.ux = obj.x;
        bodyFormData.uy = obj.y;
        bodyFormData.mass = obj.mass;
        bodyFormData.diameter = obj.diameter;
        bodyFormData.vx = obj.vx;
        bodyFormData.vy = obj.vy;
        bodyFormData.color = obj.color;
    }
}

glb.updateGeneralParametersFormData = function(ctx) {

    generalParametersFormData.velocityScale = ctx.velocityScale;
    generalParametersFormData.scale = ctx.scale;
    generalParametersFormData.G = ctx.G;
    generalParametersFormData.timeScale = ctx.timeScale;
    generalParametersFormData.gridSize = ctx.gridSize;
    generalParametersFormData.totalTime = ctx.totalTime;
}

glb.updateCoordInfo = function(ctx) {

    coordInfo.screen_x = context.mx;
    coordInfo.screen_y = context.my;

    coordInfo.universe_x = context.xpos;
    coordInfo.universe_y = context.ypos;
}

glb.updateTimeInfo = function(ctx) {

    timeInfo.year = Math.trunc(ctx.totalTime.y);
    timeInfo.day = Math.trunc(ctx.totalTime.d);
    timeInfo.hour = Math.trunc(ctx.totalTime.h);
    //timeInfo.minute = ctx.totalTime.m;
    //timeInfo.second = ctx.totalTime.s;
}


init();
requestAnimationFrame(frame);
