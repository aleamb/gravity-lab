
MODES = {
    POINTER: 1,
    STAR: 2,
    BODY_POINTING: 3,
    BODY_VELOCITY: 4,
    MOVE: 5
  };
  
  BODY_TYPES = {
    STAR: 1,
    PLANET: 2
  }
  var UA = 149597870700; // meters
  var G = 6.67428e-11
  var SCALE = 1 / (1e9); // 1px = SCALE meters
  var V_SCALE = 1000; // 1px = 1000 m/S
  var update_time = 50 // each second
  var timestep =  1* 24 * 3600; // advance one day
  var dt = 3600; // integrate with intervales of seconds
  var GRID_SIZE = 100; // px
  var RADIUS_SCALE_THRESHOLD = 100000;  
  var time_scale = 525600; // each second is X seconds
  var canvas = document.getElementById('c');
  var context = canvas.getContext('2d');

  var orbits_canvas = document.getElementById('backcanvas');
  var orbits_context = orbits_canvas.getContext('2d');

  var WIDTH = canvas.width;
  var HEIGHT = canvas.height;
  
  var t1 = 0;
  var mode = MODES.pointer;
  var DESP_X = WIDTH / 2;
  var DESP_Y = HEIGHT / 2;
  var mx = 0;
  var my = 0;
  var orbits_buffer;
  
  var newbody = null;
  var newstar = null;
  
  var cBody= {};

  var bodies = [
  ];
  
  function calculateGForce(body1, body2) {
    var dx = body2.x - body1.x;
    var dy = body2.y - body1.y;
    var F = {};
    var d2 = dx * dx + dy * dy;
    var d = Math.sqrt(d2);
    
    F.mod = -G * (body1.mass * body2.mass / d2);
  
    // calcular componentes x, y de la fuerza
    F.x = F.mod * (dx / d);
    F.y = F.mod * (dy / d);
  
    return F;
  }
  
  function updatePos(pBodies, pBodyIndex, delta) {
    var body = pBodies[pBodyIndex];
    var timestep = (delta * time_scale / 1000);

    var dt = 0.5;
    var limit = (timestep / dt) | 0;
    for (var l = 0; l < limit; l++) {
      var vx = 0;
    var vy = 0;
      for (var i = 0; i < pBodies.length; i++) {
        if (i !== pBodyIndex) {
            var g_force = calculateGForce(body, pBodies[i]);
            vx -= g_force.x / body.mass * dt;
            vy -= g_force.y / body.mass * dt;
        }
      }
      body.vx += vx;
      body.vy += vy;
      body.x += body.vx * dt;
      body.y += body.vy * dt;
    }
    body.t += timestep;
  }
  
  function frame(t) {    
    var delta = t - t1;
    canvas.width|=0;

    for (var b = 0; b < bodies.length; b++) {
       //for (var i = 0; i < timestep; i+=dt) {
      if (bodies[b].proc) {
         updatePos(bodies, b, delta)
      }
       //} 
      renderBody(bodies[b], context);
      renderInfo(bodies[b], context);
      if (bodies[b].proc) {
        renderOrbit(bodies[b], bodies, orbits_canvas, orbits_context, context);
      }
     }
    
      
    t1 = t;
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
    
    t1 = t;

    requestAnimationFrame(frame);
  }
  
  window.createStar = function() {
    mode = MODES.STAR;
    newstar = {
      proc: false,
      vx: 0,
      vy: 0,
      radius: 15,
      x: 0,
      y: 0,
      mass: 1.98e30,
      tx: 0,
      ty: 0,
      type: BODY_TYPES.STAR
    };
    
    var massInput = document.querySelector('#field-mass');
    document.querySelector('#field-proc').checked = false;
    massInput.disabled = false;
    massInput.value = newstar.mass;
    massInput.focus();
  }
  canvas.onmousemove=(e)=>{
    renderMousePos(e.layerX, e.layerY);
    switch (mode) {
      case MODES.MOVE:
        DESP_X += (e.layerX - mx);
        DESP_Y += (e.layerY - my);
        orbits_canvas.width |= 0;
        mx = e.layerX;
        my = e.layerY;
        break;
      case MODES.STAR:
        newstar.tx = e.layerX;
        newstar.ty = e.layerY;
        break;
      case MODES.BODY_POINTING:
        newbody.tx = e.layerX;
        newbody.ty = e.layerY;
        break;
      case MODES.BODY_VELOCITY:
        newbody.tvx = e.layerX;
        newbody.tvy = e.layerY;
        
        var vxInput = document.querySelector('#field-vx');
        var vyInput = document.querySelector('#field-vy');
        
        vxInput.value = (newbody.tvx - newbody.tx) * V_SCALE;
        vyInput.value = (newbody.tvy - newbody.ty) * V_SCALE;
        
        break;
    }
  }
  
  canvas.onmouseup=(e)=>{
    switch (mode) {
      case MODES.MOVE:
        mode = MODES.POINTER;
        break;
      case MODES.STAR:
        bodies.push(
          {
             type : BODY_TYPES.STAR,
            vx: 0,
            vy: 0,
            proc: document.querySelector('#field-proc').checked,
            radius: Number(document.querySelector('#field-radius').value) * 1000,
            x: (e.layerX - DESP_X) / SCALE,
            y: (e.layerY - DESP_Y) / SCALE,
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
            t: 0,
            orbit: [],

            mass: Number(document.querySelector('#field-mass').value)
          }
        );
        mode = MODES.POINTER;
        break;
      case MODES.BODY_POINTING:
        newbody.tx = e.layerX;
        newbody.ty = e.layerY;
        newbody.tvx = newbody.tx;
        newbody.tvy = newbody.ty;
        mode = MODES.BODY_VELOCITY;
    }
  }
  
  canvas.onmousedown=(e)=>{
    
    switch (mode) {
      case MODES.POINTER:
        mx = e.layerX;
        my = e.layerY;
        mode = MODES.MOVE;
        break;
    }
  }
  
  function eraseAll() {
    bodies = [];
    mode = MODES.POINTER;
    center();
    showProperties();
    GRID_SIZE = 100;
    V_SCALE = 500;
    SCALE = 1 / (10e8);
  }
  
  
  function createBody() {
     mode = MODES.BODY_POINTING;
     newbody = 
     { 
        vx: 10,
      vy: 10,
      radius: 8,
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
      t: 0
   };
    
    var massInput = document.querySelector('#field-mass');
    var vxInput = document.querySelector('#field-vx');
    var vyInput = document.querySelector('#field-vy');
    document.querySelector('#field-proc').checked = true;
    massInput.disabled = false;
    vxInput.disabled = false;
    vyInput.disabled = false;
    massInput.value = newbody.mass;
    
    vxInput.value = newbody.vx;
    vyInput.value = newbody.vy;
    
    massInput.focus();
  }
  
  function doScale(obj) {
    scale(Number(obj.value));
  }
  
  function scale(v) {
    orbits_canvas.width |= 0;
    SCALE = 1 / (1000 * v);
  }
  
  function doProc(obj) {
    
  }
  
  function center() {
    orbits_canvas.width |= 0;
    DESP_X = WIDTH / 2;
    DESP_Y = HEIGHT / 2;
  }
  //
  
  function renderSelectStar(body, context) {
    context.fillStyle = 'black';
    context.beginPath();
   context.arc((body.tx) ,  (body.ty) , (1/SCALE >= RADIUS_SCALE_THRESHOLD) ? 8 : 
               Number(document.querySelector('#field-radius').value) * SCALE * 1000, 0, 2 * Math.PI);
    context.fill();
  }
  function renderSelectBody(body, context) {
    context.fillStyle = 'black';
    context.beginPath();
    context.arc((body.tx) ,  (body.ty) , (1/SCALE >= RADIUS_SCALE_THRESHOLD) ? 8 : 
               Number(document.querySelector('#field-radius').value) * SCALE * 1000, 0, 2 * Math.PI);
    
    context.fill();
  }
  function renderBodyVelocityVector(body, context) {
   context.moveTo(body.tx , body.ty );
   context.lineTo(body.tvx, body.tvy);
    context.stroke();
  }
  
  function renderBody(body, ctx, render_radius) {
    ctx.fillStyle = body.color;
    ctx.beginPath();
    
    ctx.arc((body.x * SCALE) + DESP_X,  (body.y * SCALE) + DESP_Y, render_radius ? body.radius : (((1/SCALE >= RADIUS_SCALE_THRESHOLD)) ? 8 : (body.radius) * SCALE), 0, 2 * Math.PI);
    ctx.fill();
  }

  function renderInfo(body, context) {
    context.fillText((body.t / 86400).toFixed(2), toCanvasCoordX(body)- 15, toCanvasCoordY(body) - 15);
  }
  
  
  function renderDistance(body, bodies, context) {
    for (var i = 0; i < bodies.length; i++) {
      
          var tx = (bodies[i].x) * SCALE + DESP_X;
          var ty = (bodies[i].y)* SCALE + DESP_Y;
          context.strokeStyle = 'black';
          context.beginPath();
          context.moveTo(body.tx, body.ty);
          context.lineTo(tx,ty);
          context.stroke();
          context.fillStyle = 'black';
      context.globalCompositeOperation = 'xor';
          context.fillText(distanceString(body, tx, ty), toCanvasCoordX(bodies[i]) + 15, toCanvasCoordY(bodies[i]) - 15);
      
    }
  }

  function renderOrbitOnPosition(body, pBodies, context) {
    var bx,by, nx, ny;

    cBody.mass = body.mass;
    cBody.x = toUniverseCoordX(body);
    cBody.y = toUniverseCoordY(body);
    cBody.vx = (body.tvx - body.tx) * V_SCALE;
    cBody.vy = (body.tvy - body.ty) * V_SCALE;
    cBody.radius = 1;
    cBody.color = 'red';
    cBody.tx = body.tx;
    cBody.ty = body.ty;
    
    context.beginPath();
    context.moveTo(cBody.tx, cBody.ty);

    var dt  = 0.5;
    var calculate = true;
    var iterations = 0;

    bx = cBody.tx;
    by = cBody.ty;
    var angle = 0;
    // al menos 1000 iteraciones
    while (iterations < 10000 || (calculate && pBodies.length >= 1 && iterations < 10e5)) {
      
        var vx = 0;
        var vy = 0;
        for (var i = 0; i < pBodies.length; i++) {
            var g_force = calculateGForce(cBody, pBodies[i]);
            vx -= g_force.x / cBody.mass * dt;
            vy -= g_force.y / cBody.mass * dt;
        }
        cBody.vx += vx;
        cBody.vy += vy;
        cBody.x += cBody.vx * dt;
        cBody.y += cBody.vy * dt;
 
        nx = toCanvasCoordX(cBody);
        ny = toCanvasCoordY(cBody);

        context.lineTo(nx, ny);

        iterations++;

        if (iterations > 1000) {
          calculate = !( (nx > (bx - 10)) 
            && (nx < (bx + 10)) 
            && (ny > (by - 10)) && (ny < (by + 10))
          );
        }
    }
    context.stroke();
  }

  function renderOrbit(body, pBodies, orbits_canvas, orbit_context, context) {
   var nx = toCanvasCoordX(body);
   var ny = toCanvasCoordY(body);
   orbit_context.fillRect(nx, ny, 2, 2);
   context.drawImage(orbits_canvas, 0, 0);
  }

  function toCanvasCoordX(body) {
    return ((body.x * SCALE)|0) +DESP_X;
    
  }
  
  function toCanvasCoordY(body) {
    
    return ((body.y * SCALE)|0) +DESP_Y;
    
  }

  function toUniverseCoordX(body) {
    return (body.tx-DESP_X) / SCALE;
    
  }
  
  function toUniverseCoordY(body) {
    
    return (body.ty-DESP_Y) / SCALE;
    
  }
  
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
  
  function doVScale(obj) {
    V_SCALE = Number(obj.value);
  }
  
  function doGrid(obj) {
    GRID_SIZE = Number(obj.value);
  }
  
  function renderGrid(w, h, g, context) {
    if (g <= 0) {
      g = 100;
    }
    context .strokeStyle = 'rgba(100,100,100, 0.5)';
    for (var i = (DESP_X - w/2)%g ; i < w; i+=g) {
  
        context.beginPath();
      context.moveTo(i+(g/2), 0);
       context.lineTo(i+(g/2), h);
        
      context.stroke();
      
      
    }
    for (var i = (DESP_Y - h/2)%g; i < h; i+=g) {
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
  
  function showProperties() {
    document.querySelector('#field-scale').value = (1 / SCALE / 1000).toFixed(1);
  document.querySelector('#field-vscale').value = (V_SCALE);
  document.querySelector('#field-grid').value = (GRID_SIZE);
  }
  
  function renderMousePos(x, y) {
    document.querySelector('#mx').innerHTML = x - DESP_X;
    document.querySelector('#my').innerHTML = y - DESP_Y;
    
  }

  eraseAll();
  t1 = 0;
  requestAnimationFrame(frame);
  