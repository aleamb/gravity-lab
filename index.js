
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
  var G = -6.67428e-11
  var SCALE = 1 / (1e9); // 1px = SCALE meters
  var V_SCALE = 1000; // 1px = 1000 m/s
  var update_time = 50 // each second
  var timestep =  1* 24 * 3600; // advance one day
  var dt = 3600; // integrate with intervales of seconds
  var GRID_SIZE = 100; // px
  var RADIUS_SCALE_THRESHOLD = 100000;
  var time_scale = 800000; // each second is X seconds
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

  var bodies = [
  ];

  var d0 = d1 = d2 = d3 = d4 = {x:0, y: 0, vx: 0, vy: 0};

  var F = {};

  var requestCenter = true;
  var requestResizeBackCanvas = true;
  
  function calculateGForce(body1, body2, force, g) {
    var dx = body2.x - body1.x;
    var dy = body2.y - body1.y;
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

              var fx = fy = 0;
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
  
  function resizeCanvas(ctx, orbit_ctx) {
    WIDTH = canvas.clientWidth;
    HEIGHT = canvas.clientHeight;

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    if (requestCenter) {
     DESP_X = WIDTH / 2;
     DESP_Y = HEIGHT / 2;
     center();
     requestCenter = false;
    }
    if (requestResizeBackCanvas) {
      orbits_canvas.width = WIDTH;
      orbits_canvas.height = HEIGHT;
      requestResizeBackCanvas = false;
    }
  }
  function createStar() {
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
  
  
  function eraseAll() {
    bodies =   [];
    mode = MODES.POINTER;
    GRID_SIZE = 100;
    V_SCALE = 1000;
    SCALE = 1 / (1e9);
    requestCenter = true;
    showProperties();
  }


  function createBody() {
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
  
  function doScale(obj) {
    scale(Number(obj.value));
  }
  
  function scale(v) {
    orbits_canvas.width |= 0;
    SCALE = 1 / (1000 * v);
    if (selected) {
      DESP_X += WIDTH / 2 - toCanvasCoordX(selected);
      DESP_Y +=  HEIGHT /2- toCanvasCoordY(selected);
    }
  }
  
  function doProc(obj) {
    
  }

  function doGChange(obj) {
    G = Number(obj.value);
  }
  
  function center() {
    orbits_canvas.width |= 0;
    DESP_X = WIDTH / 2;
    DESP_Y = HEIGHT / 2;
    if (selected) {
      DESP_X += WIDTH / 2 - toCanvasCoordX(selected);
      DESP_Y +=  HEIGHT /2- toCanvasCoordY(selected);
    }
  }

  function doTScale(obj) {
    time_scale = Number(obj.value);
  }
  //
  
  function renderSelectStar(body, context) {
    context.beginPath();
    context.fillStyle = body.color;
   context.arc((body.tx) ,  (body.ty) , (1/SCALE >= RADIUS_SCALE_THRESHOLD) ? 8 : 
               Number(document.querySelector('#field-radius').value) * SCALE * 1000, 0, 2 * Math.PI);
    context.fill();
  }
  function renderSelectBody(body, context) {
    context.beginPath();
    context.fillStyle = body.color;
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

    ctx.beginPath();
    ctx.fillStyle = body.color;
    ctx.arc((body.x * SCALE) + DESP_X,  (body.y * SCALE) + DESP_Y, render_radius ? body.radius/2 : (((1/SCALE >= RADIUS_SCALE_THRESHOLD)) ? 8 : ((body.radius/2) * SCALE)|0), 0, 2 * Math.PI);
    ctx.fill();
  }

  function renderInfo(body, context) {
    //context.fillText((body.t / time_scale).toFixed(2), toCanvasCoordX(body)- 15, toCanvasCoordY(body) - 15);
    if (selected) {
      var is_ua_x = document.querySelector("input[name='scale-pos-x']:checked").value === 'ua';
      var is_ua_y = document.querySelector("input[name='scale-pos-y']:checked").value === 'ua';

     // document.querySelector('#field-radius').value = selected.radius * 2;
      document.querySelector('#body-info-mass').innerHTML = selected.mass.toExponential();
      //document.querySelector('#field-proc').checked = selected.proc;
      //document.querySelector('#field-coor').value = selected.color;

      document.querySelector('#field-posx').value = (selected.x / (is_ua_x ?  UA : 1000)).toFixed(4);
      document.querySelector('#field-posy').value  = (selected.y / (is_ua_y ? UA : 1000)).toFixed(4);
      document.querySelector('#field-vx').value = (selected.vx / 1000).toFixed(2);
      document.querySelector('#field-vy').value = (selected.vy / 1000).toFixed(2);
    }
  }

  function renderTime(t) {
    document.querySelector("#info-years").innerHTML = (totalTime / (86400 * 365))|0;
    document.querySelector("#info-days").innerHTML = (totalTime / 86400 % 365) | 0;
    document.querySelector("#info-hours").innerHTML = ((totalTime / 3600) % 24) | 0;
    document.querySelector("#info-minutes").innerHTML = (totalTime / 60 % 60) | 0;
    document.querySelector("#info-seconds").innerHTML = (totalTime % 60)|0;
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

    if (pBodies.length >= 1) {
      var bx,by, nx, ny;
      var dt = 667;
      var g = G / 1000;
      var renderv = true;
      
      cBody.mass = body.mass;
      cBody.x = toUniverseCoordX(body);
      cBody.y = toUniverseCoordY(body);
      cBody.vx = (body.tvx - body.tx) * V_SCALE;
      cBody.vy = (body.tvy - body.ty) * V_SCALE;  
      cBody.radius = 1; 
      cBody.color = 'gray';
      cBody.tx = body.tx;
      cBody.ty = body.ty;

      var fx = 0;
      var fy = 0;

      for (var b = 0; b < pBodies.length; b++) {
        if (body !== pBodies[b]) {
          calculateGForce(cBody, pBodies[b], F, g);
          fx += F.x;
          fy += F.y;
        }
      }
      cBody.fx = fx;
      cBody.fy = fy;
      renderVectors(cBody, context);
      // verlet velocity integration method

      fx = 0;
      fy = 0;
      context.beginPath();
      context.moveTo(cBody.tx, cBody.ty);
      context.strokeStyle = cBody.color;

      for (var i = 0; i < 20000; i++) {

        for (var b = 0; b < pBodies.length; b++) {
          if (body !== pBodies[b]) {
            calculateGForce(cBody, pBodies[b], F, g);
            fx += F.x;
            fy += F.y;
          }
        }
      
        var ax = fx / cBody.mass * dt;
        var ay = fy / cBody.mass * dt;
        
        cBody.x = cBody.x + cBody.vx * dt + ax*dt/2;
        cBody.y = cBody.y + cBody.vy * dt + ay*dt/2;

        var prev_ax = ax;
        var prev_ay = ay;
        fx = fy = 0;

        for (var b = 0; b < pBodies.length; b++) {
          if (body !== pBodies[b]) {
            calculateGForce(cBody, pBodies[b], F, g);
            fx += F.x;
            fy += F.y;
          }
        }
        ax = fx / cBody.mass * dt;
        ay = fy / cBody.mass * dt;

        cBody.vx = cBody.vx + (prev_ax + ax)/2 * dt
        cBody.vy = cBody.vy + (prev_ay + ay)/2 * dt

        context.lineTo(toCanvasCoordX(cBody), toCanvasCoordY(cBody));
      } 
      context.stroke();
      context.closePath();
    }
  }

  function renderVectors(body, context) {
    context.beginPath();
    context.strokeStyle='green';
    context.moveTo(toCanvasCoordX(body), toCanvasCoordY(body));
    context.lineTo(toCanvasCoordX(body)+body.vx/V_SCALE, toCanvasCoordY(body)+body.vy/V_SCALE);
    context.stroke();
    context.closePath();
    context.beginPath();
    context.strokeStyle='red';
    context.moveTo(toCanvasCoordX(body), toCanvasCoordY(body));
    context.lineTo(toCanvasCoordX(body)+body.fx/1e19, toCanvasCoordY(body)+body.fy/1e19);
    context.stroke();
    context.closePath();
  }

  function renderOrbit(body, pBodies, orbits_canvas, orbit_context, context) {
   var nx = toCanvasCoordX(body);
   var ny = toCanvasCoordY(body);
   orbit_context.fillStyle=body.color;
   orbit_context.fillRect(nx, ny, 2, 2);  
   context.drawImage(orbits_canvas, 0, 0);

   /*
   var da = 0.01;
   var ang = da;
   var steps = Math.PI * 2 / da;

   context.beginPath();

   var r = body.sm * (1 - body.e*body.e) / (1 + (body.e));
   cBody.x = body.sm;
   cBody.y=0;

   context.moveTo(toCanvasCoordX(cBody), toCanvasCoordY(cBody));

   for (var i = 0; i < steps; i++, ang+=da) {

    r = (body.sm * (1 - body.e*body.e)) / (1 + (body.e * Math.cos(ang)));
    
    cBody.x = r * Math.cos(ang)
    cBody.y= r * Math.sin(ang);

    /ontext.lineTo(toCanvasCoordX(cBody), toCanvasCoordY(cBody));

   }
   context.stroke();
   context.strokeStyle = 'red';
   renderOrbitOnPosition(body, pBodies, context);
   context.strokeStyle = 'black';
   */
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
  
  function showProperties() {
    document.querySelector('#field-scale').value = (1 / (SCALE*1000));
  document.querySelector('#field-vscale').value = (V_SCALE);
  document.querySelector('#field-grid').value = (GRID_SIZE);
  }
  
  function renderMousePos(x, y) {
    document.querySelector('#mx').innerHTML = x - DESP_X;
    document.querySelector('#my').innerHTML = y - DESP_Y;
    
  }
function resetTime() {
  totalTime = 0;
}
  function play_stop() {
    playing = !playing;
    document.querySelector('#play-button').innerHTML = playing ? '■' : '▶';
  }

  function setNewBody() {
    var is_ua_x = document.querySelector("input[name='scale-pos-x']:checked").value === 'ua';
    var is_ua_y = document.querySelector("input[name='scale-pos-y']:checked").value === 'ua';

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

  function cancel() {
    mode = MODES.POINTER;
    newbody = newstar = null;
  }

  function clearParameters() {

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

  function renderSelected(context) {
    if (selected) {
      var x = toCanvasCoordX(selected);
      var y = toCanvasCoordY(selected);
      context.beginPath();
      context.strokeStyle = 'gray';
      context.arc(x, y, (1/SCALE >= RADIUS_SCALE_THRESHOLD) ? 15 : 15 + ((selected.radius/2 * SCALE)|0), 0, 2 * Math.PI);
      context.stroke();
    }
  }

  function updateBody() {
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
eraseAll();
t1 = 0;
totalTime = 0;

document.querySelector('#field-g').value = G;
document.querySelector('#field-tscale').value = time_scale;
requestAnimationFrame(frame);
  