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
  //gravityLab.configure(Constants.DEFAULT_TIME_SCALE, );
  time_scale = Constants.DEFAULT_TIME_SCALE;
  controls.setTimeScale(time_scale);
  controls.setGridSize(Constants.DEFAULT_GRID_SIZE);
  controls.setVelocityScale(Constants.DEFAULT_VELOCITY_SCALE);
  controls.setScale(Constants.DEFAULT_SCALE);


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

    switch (mode) {
      case MODES.POINTER:
        controls.mouseMove(e.clientX, e.clientY);
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
        
        break;
      case MODES.BODY_VELOCITY:

       // var vxInput = document.querySelector('#field-vx');
       // var vyInput = document.querySelector('#field-vy');


        //vxInput.value = (newbody.tvx - newbody.tx) * V_SCALE / 1000;
        //vyInput.value = (newbody.tvy - newbody.ty) * V_SCALE / 1000;
  
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
      gravityLab.addBody(newbody);
      newbody = null;
      mode = MODES.POINTER;
      break;
      /*
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
      */
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
      //gravityÑab.updateState(totalTime);
    } 


    if (mode === MODES.STAR) {
      renderer.renderBodyOn(newbody, newbody.tx, newbody.ty);
    } else if (mode === MODES.BODY_POINTING) {
        //renderSelectBody(newbody, context);
        //renderDistance(newbody, bodies, context);
    } else if (mode === MODES.BODY_VELOCITY) {
        //renderSelectBody(newbody, context);
        //renderBodyVelocityVector(newbody, context);
        //renderOrbitOnPosition(newbody, bodies,  context);
    }

    /*

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
    */
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
      renderer.renderInfo(body);
      
    }
  }
 
/*

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
