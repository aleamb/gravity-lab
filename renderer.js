/**
 * @file renderer.js
 * 
 * Render functions.
 * 
 * @author Alejandro Ambroa <jandroz@gmail.com>
 * @version 1.0.0
 */

const Constants = require('./constants');

const GRID_STYLE = 'rgba(100,100,100, 0.5)';
const CENTER_STYLE = 'rgba(100,100,100, 0.8)';

let Renderer = function() {
  this.canvas = null;
  this.back_canvas = null;
  this.context = null;
  this.orbits_context = null;
  this.width = 0;
  this.height = 0;
  this.offset_x = 0;
  this.offset_y = 0;
}

Renderer.prototype.init = function(pCanvas, pBackCanvas) {
  this.canvas = pCanvas;
  this.back_canvas = pBackCanvas;
  this.context = pCanvas.getContext('2d');
  this.orbits_context = pBackCanvas.getContext('2d');
}

Renderer.prototype.resizeCanvas = function() {
  this.width = this.canvas.clientWidth;
  this.height = this.canvas.clientHeight;

  this.canvas.width = this.width;
  this.canvas.height = this.height;

  this.back_canvas.width = this.width;
  this.back_canvas.height =  this.height;
}

Renderer.prototype.center = function() {
  this.offset_x = this.width / 2;
  this.offset_y = this.height / 2;
}

Renderer.prototype.getXOffset = function() {
  return this.offset_x;
}

Renderer.prototype.getYOffset = function() {
  return this.offset_y;
}


Renderer.prototype.clear = function() {
  this.canvas.width |= 0;
}


Renderer.prototype.renderGrid = function(pGridSize) {

  let g  = isNaN(pGridSize) ? Constants.DEFAULT_GRID_SIZE : pGridSize;
  let g2 = g / 2;

  this.context.strokeStyle = GRID_STYLE;

  for (var i = (this.offset_x % g) - g2 ; i < this.width; i += g) {
    
    this.context.beginPath();
    this.context.moveTo(i + g2, 0);
    this.context.lineTo(i + g2, this.height);
    this.context.stroke();    
  }

  for (var i = this.offset_y % g - g2; i < this.height; i += g) {
    this.context.beginPath();
    this.context.moveTo(0, i + g2);
    this.context.lineTo(this.width, i + g2);
    this.context.stroke();

  }
  if (this.offset_x >= 0 && this.offset_x <= this.width) {

    this.context.strokeStyle = CENTER_STYLE;

    this.context.beginPath();
    this.context.moveTo(this.offset_x, 0);
    this.context.lineTo(this.offset_x, this.height);
    this.context.stroke();
  }
  if (this.offset_y >= 0 && this.offset_y <= this.height) {
    this.context.beginPath();
    this.context.moveTo(0, this.offset_y);
    this.context.lineTo(this.width, this.offset_y);
    this.context.stroke();
  }

}

Renderer.prototype.move = function(dx, dy) {
  this.offset_x += dx;
  this.offset_y += dy;

}

module.exports = new Renderer();


/*


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
      var is_ua_x = document.querySelector("input[name='scale-pos']:checked").value === 'ua';
      var is_ua_y = document.querySelector("input[name='scale-pos']:checked").value === 'ua';

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
    document.querySelector("#info-years").innerHTML = numberFormatter('000', (totalTime / (86400 * 365))|0);
    document.querySelector("#info-days").innerHTML = numberFormatter('000', (totalTime / 86400 % 365) | 0);
    document.querySelector("#info-hours").innerHTML = numberFormatter('00', ((totalTime / 3600) % 24) | 0);
    document.querySelector("#info-minutes").innerHTML = numberFormatter('00', (totalTime / 60 % 60) | 0);
    document.querySelector("#info-seconds").innerHTML = numberFormatter('00', (totalTime % 60)|0);
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
      var fmod = 0;

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
    var force_normal;
    context.beginPath();
    context.strokeStyle='green';
    context.moveTo(toCanvasCoordX(body), toCanvasCoordY(body));
    context.lineTo(toCanvasCoordX(body)+body.vx/V_SCALE, toCanvasCoordY(body)+body.vy/V_SCALE);
    context.stroke();
    context.closePath();
    context.beginPath();
    context.strokeStyle='red';
    context.moveTo(toCanvasCoordX(body), toCanvasCoordY(body));
    force_normal = Math.sqrt(body.fx*body.fx+ body.fy*body.fy);
    context.lineTo(toCanvasCoordX(body)+(body.fx/force_normal*30), toCanvasCoordY(body)+(body.fy/force_normal*30));
    context.stroke();
    context.closePath();
  }

  function renderOrbit(body, pBodies, orbits_canvas, orbit_context, context) {
   var nx = toCanvasCoordX(body);
   var ny = toCanvasCoordY(body);
   orbit_context.fillStyle=body.color;
   orbit_context.fillRect(nx, ny, 2, 2);  
   context.drawImage(orbits_canvas, 0, 0);

   
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

    context.lineTo(toCanvasCoordX(cBody), toCanvasCoordY(cBody));

   }
   context.stroke();
   context.strokeStyle = 'red';
   renderOrbitOnPosition(body, pBodies, context);
   context.strokeStyle = 'black';
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
*/