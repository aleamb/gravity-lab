/**
 * @file gravity-lab main program
 * 
 * @author Alejandro Ambroa <jandroz@gmail.com>
 * @version 1.0.0
 */

const Constants = require('./constants');
const gravityLab = require('./gravityLab');
const controls = require('./controls');

const glb = typeof window !== 'undefined' ? window : global;

const MODES = {
  POINTER: 1,
  STAR: 2,
  BODY_POINTING: 3,
  BODY_VELOCITY: 4,
  MOVE: 5
};

const BODY_TYPES = {
  STAR: 1,
  PLANET: 2
}

var gridSize = null;
var velocityScale = null;
var scale = null;
var requestCenter = null;

function init() {

  gravityLab.init(glb);
  controls.init();
  reset();
}

function resetMode() {
  mode = MODES.POINTER;
}

function setDefaults() {
  gridSize = Constants.DEFAULT_GRID_SIZE;
  velocityScale = Constants.DEFAULT_VELOCITY_SCALE;
  scale = Constants.DEFAULT_SCALE;
}

function requestGridCenter() {
  requestCenter = true;
}

function reset() {
  gravityLab.reset();
  resetMode();
  setDefaults();
  requestGridCenter();
  showProperties();
}


function showProperties() {
  controls.setScale(scale);
  controls.setScale(scale);

  document.querySelector('#field-scale').value = (1 / (SCALE*1000)).toFixed(0);
  document.querySelector('#field-vscale').value = (V_SCALE);
  document.querySelector('#field-grid').value = (GRID_SIZE);
}

/*
  var orbits_canvas;
  var orbits_context;
  var canvas = null;
  var context = null;
  var playing = true;
  var totalTime = 0;
  var selected = null;

  var WIDTH = 0;
  var HEIGHT = 0;
  
  var t1 = 0;
  var mode = MODES.pointer;
  var DESP_X = 0;
  var DESP_Y = 0;
  var mx = 0;
  var my = 0;
  var orbits_buffer;
  
  var newbody = null;
  var newstar = null;
  
  var cBody= {};
  var cBody2= {};
  var cBody3= {};


  var d0 = d1 = d2 = d3 = d4 = {x:0, y: 0, vx: 0, vy: 0};

  var F = {};

  var requestCenter = true;
  var requestResizeBackCanvas = true;
  
  function calculateGForce(body1, body2, force, g) {
    var dx = body2.x - body1.x;
    var dy = body2.y - body1.y;
    if (dx === 0 && dy === 0) {
      return { x:0, y:0, mod: 0 };
    } 
    var d2 = dx * dx + dy * dy;
    var d = Math.sqrt(d2);
    force.mod = - (g * (body1.mass * body2.mass / (d*d*d))*(d));
  
    // calcular componentes x, y de la fuerza
    force.x = force.mod * (dx / d);
    force.y = force.mod * (dy / d);
  
    return force;
  }
  
  function frame(t) {  

    resizeCanvas(context, orbits_context);

    var delta = t - t1;
    var timestep = (delta * time_scale / 1000);

    if (playing) {  
      totalTime += timestep;
    } 
    if (bodies.length > 0) {
      var body;
      var dt = 100;
      var limit = (timestep / dt) | 0;
      if (playing) {
        for (var l = 0; l < limit; l++) {
          for (var i = 0; i < bodies.length; i++) {
            body = bodies[i];
            if (body.proc) {

              var fx = fy = f = 0;

              for (var b = 0; b < bodies.length; b++) {
                if (i !== b) {
                  calculateGForce(body, bodies[b], F, G);
                  fx += F.x;
                  fy += F.y;
                }
              }
              body.fx = fx;
              body.fy = fy;
              body.vx += fx / body.mass * dt;
              body.vy += fy / body.mass * dt;
            }
          }
          for (var b = 0; b < bodies.length; b++) {
            body = bodies[b];
            if (body.proc) {
              body.x += body.vx * dt;
              body.y += body.vy * dt;
            }
          }
        }
      }

      for (var b = 0; b < bodies.length; b++) {
        body = bodies[b];
        if (body.proc) {
          renderOrbit(body, bodies, orbits_canvas, orbits_context, context);
          renderVectors(body, context);
        }
        renderBody(body, context);
        renderInfo(body, context);
        
      }
    }

    if (mode === MODES.STAR) {
      renderSelectStar(newstar, context);
    } else if (mode === MODES.BODY_POINTING) {
        renderSelectBody(newbody, context);
        renderDistance(newbody, bodies, context);
    } else if (mode === MODES.BODY_VELOCITY) {
        renderSelectBody(newbody, context);
        renderBodyVelocityVector(newbody, context);
        renderOrbitOnPosition(newbody, bodies,  context);
    }
    renderGrid(WIDTH, HEIGHT, GRID_SIZE, context);
    renderSelected(context);
    renderTime();
    t1 = t;
    requestAnimationFrame(frame);
  }
  
 

  gbl.createStar = function() {
    mode = MODES.STAR;
    newstar = {
      proc: false,
      vx: 0,
      vy: 0,
      radius: 695700,
      x: 0,
      y: 0,
      mass: 1.98e30,
      tx: 0,
      ty: 0,
      type: BODY_TYPES.STAR,
      color: '#ffff00'
    };
    
    var massInput = document.querySelector('#field-mass');
    document.querySelector('#field-proc').checked = false;
    massInput.disabled = false;
    massInput.value = newstar.mass;
    massInput.focus();
  }
  
  
  gbl.eraseAll = function() {
    bodies =   [];
    mode = MODES.POINTER;
    GRID_SIZE = 100;
    V_SCALE = 1000;
    SCALE = 1 / (1e9);
    requestCenter = true;
    showProperties();
  }


  gbl. createBody = function() {
     mode = MODES.BODY_POINTING;
     newbody = 
     { 
      vx: 0,
      vy: 0,
      radius: 6374,
      x: 0,
      y: 0,
      mass: 5e24,
      tx: 0,
      ty: 0,
      tvx: 0,
      tvy: 0,
      type: BODY_TYPES.PLANET,
      proc: true,
      ox: 0,
      oy: 0,
      t: 0,
      fx: 0,
      fy: 0,
      color: 'rgba(' + (Math.random() * 255|0) + ',' + (Math.random() * 255|0) + ',' + (Math.random() * 255|0) +', 1.0)'
   };
    
    var massInput = document.querySelector('#field-mass');
    var vxInput = document.querySelector('#field-vx');
    var vyInput = document.querySelector('#field-vy');
    document.querySelector('#field-proc').checked = true;
    massInput.value = newbody.mass;
    vxInput.value = newbody.vx;
    vyInput.value = newbody.vy;
    massInput.focus();
  }
  
  gbl. doScale = function(obj) {
    scale(Number(obj.value));
  }
  
  gbl. scale = function(v) {
    orbits_canvas.width |= 0;
    SCALE = 1 / (1000 * v);
    if (selected) {
      DESP_X += WIDTH / 2 - toCanvasCoordX(selected);
      DESP_Y += HEIGHT / 2 - toCanvasCoordY(selected);
    }
  }

  gbl. doGChange = function(obj) {
    G = Number(obj.value);
  }
  
  gbl. center = function() {
    orbits_canvas.width |= 0;
    DESP_X = WIDTH / 2;
    DESP_Y = HEIGHT / 2;
    if (selected) {
      DESP_X += WIDTH / 2 - toCanvasCoordX(selected);
      DESP_Y +=  HEIGHT /2- toCanvasCoordY(selected);
    }
  }

  gbl. doTScale = function(obj) {
    time_scale = Number(obj.value);
  }
  //
  

  function distanceString(body, tx, ty) {
    
    var distance = calculateDistance(body, tx, ty);
      
    if (distance > UA) {
      return "" + ((distance / UA).toFixed(3)) + " UA";
    } else {
      return "" + (distance / 1000).toFixed(3) + " Km.";
    }
  }
  function calculateDistance(body, tx, ty) {
    var dx = body.tx - tx;
    var dy = body.ty - ty;
    return Math.sqrt(dx*dx + dy*dy) / (SCALE);
  }
  
  gbl. doVScale = function(obj) {
    V_SCALE = Number(obj.value);
  }
  
  gbl. doGrid = function(obj) {
    GRID_SIZE = Number(obj.value);
  }
  
  function renderGrid(w, h, g, context) {
    if (g <= 0) {
      g = 100;
    }
    context .strokeStyle = 'rgba(100,100,100, 0.5)';

    for (var i = (DESP_X)%g - (g/2) ; i < w; i+=g) {
  
      context.beginPath();
      context.moveTo(i+(g/2), 0);
      context.lineTo(i+(g/2), h);
        
      context.stroke();
      
      
    }
    for (var i = (DESP_Y)%g - (g/2); i < h; i+=g) {
        context.beginPath();
      context.moveTo(0, i+(g/2));
       context.lineTo(w, i+(g/2));
      context.stroke();
  
    }
    if (DESP_X >= 0 && DESP_X <= WIDTH) {
      context .strokeStyle = 'rgba(100,100,100, 0.8)';
      context.beginPath();
      context.moveTo(DESP_X, 0);
      context.lineTo(DESP_X, h);
      context.stroke();
    }
    if (DESP_Y >= 0 && DESP_Y <= HEIGHT) {
      context.beginPath();
      context.moveTo(0, DESP_Y);
      context.lineTo(w, DESP_Y);
      context.stroke();
    }
  }
  

  
  function renderMousePos(x, y) {
    document.querySelector('#mx').innerHTML = x - DESP_X;
    document.querySelector('#my').innerHTML = y - DESP_Y;
    
  }
  gbl. resetTime = function() {
  totalTime = 0;
}
gbl. play_stop = function() {
    playing = !playing;
    document.querySelector('#play-button').innerHTML = playing ? '■' : '▶';
  }

  gbl. setNewBody = function() {
    var is_ua_x = document.querySelector("input[name='scale-pos']:checked").value === 'ua';
    var is_ua_y = document.querySelector("input[name='scale-pos']:checked").value === 'ua';

    var body = {
      type: BODY_TYPES.PLANET,
      x: Number(document.querySelector('#field-posx').value) * (is_ua_x ? UA : 1000),
      y: Number(document.querySelector('#field-posy').value) * (is_ua_y ? UA : 1000),
      vx: Number(document.querySelector('#field-vx').value) * 1000,
      vy: Number(document.querySelector('#field-vy').value) * 1000,
      radius: Number(document.querySelector('#field-radius').value) / 2,
      mass: Number(document.querySelector('#field-mass').value),
      proc: Number(document.querySelector('#field-proc').checked),
      color: document.querySelector('#field-color').value,
      tx: 0,
      ty: 0,
      tvx: 0,
      tvy: 0,
      ox: 0,
      oy: 0,
      t: 0,
      fx: 0,
      fy: 0
    };

    if (!validateBody(body)) {
      document.querySelector('#messages').innerHTML = 'Datos no válidos';
      return;
    }
    document.querySelector('#messages').innerHTML = '';
    bodies.push(body);
  }

  function validateBody(body) {
    return !isNaN(body.x) && !isNaN(body.y) && !isNaN(body.vx) && !isNaN(body.vy) && !isNaN(body.mass) && !isNaN(body.radius); 
  }

  gbl. cancel = function() {
    mode = MODES.POINTER;
    newbody = newstar = null;
  }


  function getSelected(px, py) {

    for (var i = 0; i < bodies.length; i++) {
      var b = bodies[i];
      var x = toCanvasCoordX(b);
      var y = toCanvasCoordY(b);
      if (x - 10 < px && x + 10 > px && y -10 < py && y + 10 > py) {
        selected = b;
        document.querySelector('#field-mass').value = selected.mass.toExponential();
        document.querySelector('#field-proc').checked = selected.proc;
        return b;
      }
    }
    return null;
  }

 

  gbl. updateBody = function() {
    if (selected) {
      selected.radius =  Number(document.querySelector('#field-radius').value) * 1000 / 2;
      selected.mass = Number(document.querySelector('#field-mass').value);
      selected.proc =  Number(document.querySelector('#field-proc').checked);
       selected.color =  document.querySelector('#field-color').value;
    }
  }

  //

  
  canvas = document.getElementById('c');
  orbits_canvas = document.getElementById('backcanvas');
  context = canvas.getContext('2d');
  orbits_context = orbits_canvas.getContext('2d');

  canvas.onmousemove=(e)=>{

    var px = e.clientX - canvas.offsetLeft;
    var py = e.clientY - canvas.offsetTop;

    renderMousePos(px, py);

    switch (mode) {
      case MODES.MOVE:
        DESP_X += (px - mx);
        DESP_Y += (py - my);
        orbits_canvas.width |= 0;
        mx = px;
        my = py;
        break;
      case MODES.STAR:
        newstar.tx = px;
        newstar.ty = py;
        break;
      case MODES.BODY_POINTING:
        newbody.tx = px;
        newbody.ty = py;
        break;
      case MODES.BODY_VELOCITY:
        newbody.tvx = px;
        newbody.tvy = py;

        var vxInput = document.querySelector('#field-vx');
        var vyInput = document.querySelector('#field-vy');
        
        vxInput.value = (newbody.tvx - newbody.tx) * V_SCALE / 1000;
        vyInput.value = (newbody.tvy - newbody.ty) * V_SCALE / 1000;
  
        break;
    }
  }
  
  canvas.onmouseup=(e)=>{

    var px = e.clientX - canvas.offsetLeft;
    var py = e.clientY - canvas.offsetTop;

    switch (mode) {
      case MODES.MOVE:
        selected = getSelected(px, py);
        mode = MODES.POINTER;
        break;
      case MODES.MOVE:
        mode = MODES.POINTER;
        break;
      case MODES.STAR:
        bodies.push(
          {
            type : BODY_TYPES.STAR,
            vx: 0,
            vy: 0,
            color: newstar.color,
            proc: document.querySelector('#field-proc').checked,
            radius: Number(document.querySelector('#field-radius').value) * 1000,
            x: (px - DESP_X) / SCALE,
            y: (py - DESP_Y) / SCALE,
            mass: Number(document.querySelector('#field-mass').value)
          }
        );
        mode = MODES.POINTER;
        break;
      case MODES.BODY_VELOCITY:
        bodies.push(
          {
            type : BODY_TYPES.PLANET,
            vx: (newbody.tvx - newbody.tx) * V_SCALE,
            vy: (newbody.tvy - newbody.ty) * V_SCALE,
            ox: (newbody.tvx - newbody.tx) * V_SCALE,
            oy: (newbody.tvy - newbody.ty) * V_SCALE,
            radius: Number(document.querySelector('#field-radius').value) * 1000,
            proc: document.querySelector('#field-proc').checked,
            x: (newbody.tx - DESP_X) / SCALE,
            y: (newbody.ty - DESP_Y) / SCALE,
            color: newbody.color,
            t: 0,
            fx: 0,
            fy:0,
            mass: Number(document.querySelector('#field-mass').value)
          }
        );
        mode = MODES.POINTER;
        break;
      case MODES.BODY_POINTING:
        newbody.tx = px;
        newbody.ty = py;
        newbody.tvx = newbody.tx;
        newbody.tvy = newbody.ty;
        mode = MODES.BODY_VELOCITY;
    }
  }
  
  canvas.onmousedown=(e)=>{
    
    switch (mode) {
      case MODES.POINTER:
        mx = e.clientX - canvas.offsetLeft;
        my = e.clientY - canvas.offsetTop;
        mode = MODES.MOVE;
        break;
    }
  }
*/



init();
requestAnimationFrame(frame);
