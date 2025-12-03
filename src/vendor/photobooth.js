// Lightweight ESM wrapper for legacy Photobooth.js (v0.7)
// Source provided by user; adapted to export a constructor and expose capture().

function injectPhotoboothStylesOnce() {
  if (document.getElementById('__photobooth_styles__')) return;
  const s = document.createElement('style');
  s.id = '__photobooth_styles__';
  s.innerHTML = ".photobooth{position:relative;font:11px arial,sans-serif;overflow:hidden;user-select:none;-webkit-user-select:none;-moz-user-select:none;-o-user-select:none}.photobooth canvas{position:absolute;left:0;top:0}.photobooth .blind{position:absolute;left:0;top:0;opacity:0;width:100%;height:100%;background:#fff;z-index:1}.photobooth .blind.anim{transition:opacity 1500ms ease-out;-o-transition:opacity 1500ms ease-out;-moz-transition:opacity 1500ms ease-out;-webkit-transition:opacity 1500ms ease-out}.photobooth .warning{position:absolute;top:45%;background:#ffebeb;color:#cf0000;border:1px solid #cf0000;width:60%;left:50%;margin-left:-30%;display:none;padding:5px;z-index:10;text-align:center}.photobooth .warning span{text-decoration:underline;cursor:pointer;color:#333}.photobooth ul{width:30px;position:absolute;right:0;top:0;background:rgba( 0,0,0,.6 );height:190px;z-index:2;border-bottom-left-radius:5px}.photobooth ul li{width:30px;height:38px;background-repeat:no-repeat;background-position:center center;cursor:pointer;position:relative}.photobooth ul li:hover{background-color:#aaa}.photobooth ul li.selected{background-color:#ccc}.photobooth ul.noHSB{height:80px}.photobooth ul.noHSB li.hue,.photobooth ul.noHSB li.saturation,.photobooth ul.noHSB li.brightness{display:none}.photobooth ul li.hue{background-image:url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAZAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQICAgICAgICAgICAwMDAwMDAwMDAwEBAQEBAQECAQECAgIBAgIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD/8AAEQgACAAYAwERAAIRAQMRAf/EAHgAAQEAAAAAAAAAAAAAAAAAAAkIAQEAAwAAAAAAAAAAAAAAAAAKBggLEAAAAwQLAAAAAAAAAAAAAAAAMQZBAjQ4A3MEdMQFdQcICTkRAAEBBAcGBwAAAAAAAAAAABExAAEhElECMjMEBQlhwgNzFDgVNRY3CBgK/9oADAMBAAIRAxEAPwBGOKPmqmNdT5FD2YgarLO67OVueIqrxF2tI/1Kn0jjjKfFcJZEt+5BAUCAaKuw+ThT3vC0wbFof+U4Dnv3WGl8Pu47A8vecwabKy8ZRVNKFdF3dY72fztbVdFu67axelcfrPkYlPTutCW7qqYCkwDf/9k=)}.photobooth ul li.saturation{background-image:url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAZAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQICAgICAgICAgICAwMDAwMDAwMDAwEBAQEBAQECAQECAgIBAgIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD/8AAEQgACAAYAwERAAIRAQMRAf/EAGMAAAMAAAAAAAAAAAAAAAAAAAYICQEBAQEAAAAAAAAAAAAAAAAACAkKEAAABgMBAAAAAAAAAAAAAAAAwYIDMwZxAkQHEQABAgUFAAAAAAAAAAAAAAAAAQYxgQIyM3HBQgMH/9oADAMBAAIRAxEAPwAwo0rWdSFXHBYpnLZmWjVB/fLedIODu5Do81j1y2KE0CJlJA2uK5ZjtY2Kg//Z)}.photobooth ul li.brightness{background-image:url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAZAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQICAgICAgICAgICAwMDAwMDAwMDAwEBAQEBAQECAQECAgIBAgIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD/8AAEQgACAAYAwERAAIRAQMRAf/EAFcAAQAAAAAAAAAAAAAAAAAAAAoBAQAAAAAAAAAAAAAAAAAAAAAQAAAEBQUAAAAAAAAAAAAAAACxAwgBMXECBXJzBDQ1EQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwAcTWfR4GtIwC5mITxNUDgAYA0joY3aRKwB/9k=)}.photobooth ul li.crop{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAICAYAAADjoT9jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEFJREFUeNpi/A8EDAjACMT/qUgzMCJZwMhAXQA2l4VGhsPNZKKR4XBfMMG8QiPASDcf0MIX/2FxgCJARRoMAAIMAK49Iv4yTUj5AAAAAElFTkSuQmCC)}.photobooth ul li.trigger{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAASCAYAAABB7B6eAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAa9JREFUeNqc1M8rRFEUwPF5M4MhP8aPIiIS21lQk1Is5ceChZIdOytlI/+A7Ig/gGRhpYiNbKQsrBRFLPzYWJghNH7MjOd76qhr8m6vOfWpmffevefec987juu6AZ8RQhhBpJHJuT+CfsiEDo6wGjYeKMKn8b8Um/jCG2qQ0skjyOIWB9hFNyaN8bWSwGEHM5q9EVc6mUQ9YpjDHQbwoQkjuspDDKNEF9hjJDjFcoAEx653XEoJMYoVxNGBGPZRhzbL+HTYWLEtpO6V6EQ5kijTc7HFiwyssDwgyXsxhW8tkZSxAAksoj3n7P4G20hatviKE3RpqXKN4V5K4TE+IQ89WBI8ao0DFkP49krw+057xbyWxBY72LIdXsbjnlzf8/kRbtgSeO1APqonnwlu8tlBIYp9JojmkyCiX7Kf6MsngcSsvvO2aMZEPmcgEcea7ua/aNKGaC2RY0lwgTNsYwwNOlkrprGOJe2q/84vvegabdrrQyqomrSTyirHtbPKc+84x4L2qBazORi/s9KuC7QfBY3JC1UVBlGt16PallPap+Tas+7wWc8za1Ql8yPAAAzkXGo1lmDtAAAAAElFTkSuQmCC)}.photobooth .submenu{background:rgba( 0,0,0,.6 );position:absolute;width:100px;opacity:0;height:20px;padding:5px 10px;color:#fff;top:4px;left:-124px;border-radius:5px;-webkit-transition:opacity 500ms ease;-moz-transition:opacity 500ms ease;-o-transition:opacity 500ms ease;-msie-transition:opacity 500ms ease;transition:opacity 500ms ease}.photobooth li:hover .submenu{opacity:1}.photobooth .submenu .tip{width:4px;height:8px;position:absolute;right:-4px;top:50%;margin-top:-2px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAICAYAAADeM14FAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADVJREFUeNpiYGBgmAnEDP///wdjJgYImMnIyAhmwATggowwLTCArAKrQDqyQDrcMGQlAAEGAAGOCdflbyWyAAAAAElFTkSuQmCC)}.photobooth .submenu .slider{width:100px;height:20px;position:relative}.photobooth .submenu .slider .track{height:2px;width:100px;position:absolute;top:9px;background:rgba(255,255,255,.6)}.photobooth .submenu .slider .handle{height:14px;width:2px;position:absolute;top:3;background:#fff;z-index:2}.photobooth .submenu .slider .handle div{position:absolute;z-index:3;width:20px;top:-3px;height:20px;cursor:w-resize;left:-9px}.resizehandle{position:absolute;z-index:1;width:100px;height:100px;left:30px;top:30px;cursor:move;outline:1500px solid rgba( 0,0,0,.35 );box-shadow:2px 2px 10px rgba(0,0,0,.5),0 0 3px #000;opacity:0;transition:opacity 500ms ease;-moz-transition:opacity 500ms ease;-o-transition:opacity 500ms ease;-webkit-transition:opacity 500ms ease}noindex:-o-prefocus,.resizehandle{outline:0!important}@-moz-document url-prefix(){.resizehandle{ box-shadow:none!important}}.resizehandle .handle{width:100%;height:100%;border:2px dashed #0da4d3;margin:-2px 0 0 -2px;z-index:3;position:relative}.resizehandle .handle div{width:18px;height:18px;position:absolute;right:-2px;bottom:-2px;z-index:4;cursor:se-resize;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHdJREFUeNpi/P//PwO5gIlcjXxLr/xnIlujsg7pNsM0AgEjE7kaSfIzusZ/d4n0M1aNxPgZWeMHC4RGIJuREV8847IRpBGvnwlpxBnPRGkEyYOcjYx5l1z+z3/8Pwij8NHlQWwUPxNrI4afSdUI9zNZGoF8gAADAOGvmx/e+CgVAAAAAElFTkSuQmCC);background-position:top left;background-repeat:no-repeat}";
  document.head.appendChild(s);
}

function Photobooth(hostEl) {
  injectPhotoboothStylesOnce();
  if (hostEl && hostEl.length) hostEl = hostEl[0];
  // Cross-browser getUserMedia: prefer modern promise API, fallback to legacy callbacks
  const legacyGetUM = (navigator.getUserMedia||navigator.webkitGetUserMedia||navigator.mozGetUserMedia||navigator.oGetUserMedia||navigator.msieGetUserMedia||false);
  const getUserMedia = (constraints)=>{
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return navigator.mediaDevices.getUserMedia(constraints);
    }
    return new Promise((resolve, reject)=>{
      if (!legacyGetUM) return reject(new Error('getUserMedia not supported'));
      try { legacyGetUM.call(navigator, constraints, resolve, reject); }
      catch(e){ reject(e); }
    });
  };
  this.onImage = function(){};
  this.forceHSB = false;
  this.isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || !!legacyGetUM;

  let hue=0, sat=0, bri=0, isOverlay=false, paused=false, stream=null, self=this;
  let width = hostEl.offsetWidth || 640, height = hostEl.offsetHeight || 480;

  const clamp01 = (v, name) => {
    if (v<-0.5 || v>0.5) throw new Error("Invalid value: "+name+" must be between 0 and 1");
    return true;
  };

  this.getHueOffset = () => hue;
  this.setHueOffset = (v)=>{ if (clamp01(v,'hue')) hue=v; };
  this.getSaturationOffset = () => sat;
  this.setSaturationOffset = (v)=>{ if (clamp01(v,'saturation')) sat=v; };
  this.getBrightnessOffset = () => bri;
  this.setBrightnessOffset = (v)=>{ if (clamp01(v,'brightness')) bri=v; };
  this.pause = ()=>{ if (paused===false){ paused=true; stream&&stream.stop&&stream.stop(); } };
  this.resume = ()=>{ if (paused===true){ paused=false; start(); } };
  this.destroy = ()=>{ this.pause(); hostEl && wrapper && hostEl.removeChild(wrapper); };
  this.resize = (w,h)=>{ 
    // Size internal canvases to match visual wrapper to avoid any stretch/border mismatch
    const min = 160;
    const targetW = Math.max(min, w||0);
    const targetH = Math.max(min, h||0);
    width = targetW; height = targetH;
    crop.setMax(width,height);
    wrapper.style.width = targetW + 'px';
    wrapper.style.height = targetH + 'px';
    canvasRaw.width = width; canvasRaw.height = height; 
    videoCanvas.width = width; videoCanvas.height = height; };

  // DOM helpers
  const q = (cls)=> wrapper.getElementsByClassName(cls)[0];
  const el = (tag)=> document.createElement(tag);

  // Build DOM
  const wrapper = el('div');
  wrapper.className = 'photobooth';
  wrapper.innerHTML = '<div class="blind"></div><canvas></canvas><div class="warning notSupported">Sorry, Photobooth.js is not supported by your browser</div><div class="warning noWebcam">Please give Photobooth permission to use your Webcam. <span>Try again</span></div><ul><li title="hue" class="hue"></li><li title="saturation" class="saturation"></li><li title="brightness" class="brightness"></li><li title="crop" class="crop"></li><li title="take picture" class="trigger"></li></ul>';
  const videoCanvas = el('canvas');
  const vctx = videoCanvas.getContext('2d');
  const canvasRaw = wrapper.getElementsByTagName('canvas')[0];
  const rctx = canvasRaw.getContext('2d');
  const video = el('video');
  video.autoplay = true;

  const noWebcam = q('noWebcam');
  noWebcam.getElementsByTagName('span')[0].onclick = ()=> start();

  // Simple slider widget
  function Slider(controlEl, cb){
    controlEl.innerHTML = '<div class="submenu"><div class="tip"></div><div class="slider"><div class="track"></div><div class="handle" style="left:50px"><div></div></div></div></div>';
    let curr=50, st=50; const handle = controlEl.getElementsByClassName('handle')[0];
    const slider = controlEl.getElementsByClassName('slider')[0];
    const set = (val)=>{ if (val>0 && val<100){ st=val; handle.style.left=val+'px'; cb((val-50)/100);} };
    const onClick = (e)=>{ const rect = slider.getBoundingClientRect(); set(e.clientX - rect.left); curr=st; };
    slider.addEventListener('click', onClick, false);
  }

  // Resize crop handle
  function CropHandle(container, maxW, maxH){
    this.setMax = function(w,h){ maxW=w; maxH=h; };
    this.getData = function(){ return {x:x,y:y,width:w,height:h}; };
    this.isActive = function(){ return active; };
    this.toggle = function(){ active = !active; box.style.opacity = active?1:0; };
    let x=30,y=30,w=100,h=100, nx=30, ny=30, nw=100, nh=100, active=false;
    const box = document.createElement('div');
    box.className = 'resizehandle';
    box.innerHTML = '<div class="handle"><div></div></div>';
    container.appendChild(box);
    const moveEl = box.getElementsByTagName('div')[0];
    let dragging=false, rsx=0,rsy=0;
    moveEl.addEventListener('mousedown', (e)=>{ dragging=true; rsx=e.clientX; rsy=e.clientY; e.preventDefault();}, false);
    document.addEventListener('mousemove', (e)=>{ if(!dragging) return; const dx=e.clientX-rsx, dy=e.clientY-rsy; if(x+dx+w<maxW && x+dx>0){ nx=x+dx; box.style.left=nx+'px'; } if(y+dy+h<maxH && y+dy>0){ ny=y+dy; box.style.top=ny+'px'; } });
    document.addEventListener('mouseup', ()=>{ if(!dragging) return; x=nx; y=ny; dragging=false; });
    const resizeEl = box.getElementsByTagName('div')[1];
    resizeEl.addEventListener('mousedown', (e)=>{ dragging='resize'; rsx=e.clientX; rsy=e.clientY; e.preventDefault();}, false);
    document.addEventListener('mousemove', (e)=>{ if(dragging!=='resize') return; const dx=e.clientX-rsx, dy=e.clientY-rsy; if(x+dx+w<maxW && w+dx>18){ nw=w+dx; box.style.width=nw+'px'; } if(y+dy+h<maxH && h+dy>18){ nh=h+dy; box.style.height=nh+'px'; } });
    document.addEventListener('mouseup', ()=>{ if(dragging!=='resize') return; w=nw; h=nh; dragging=false; });
  }

  const crop = new CropHandle(wrapper, width, height);
  const cropBtn = q('crop');
  cropBtn.onclick = ()=>{ crop.toggle(); cropBtn.className = cropBtn.className === 'crop' ? 'crop selected' : 'crop'; };
  const blind = q('blind');

  // HSB controls
  new Slider(q('hue'), (v)=>{ hue=v; });
  new Slider(q('saturation'), (v)=>{ sat=v; });
  new Slider(q('brightness'), (v)=>{ bri=v; });

  // Capture method (exposed)
  this.capture = ()=>{
    blind.className = 'blind';
    blind.style.opacity = 1;
    setTimeout(()=>{ blind.className = 'blind anim'; blind.style.opacity = 0; }, 50);
    let region;
    if (crop.isActive()) region = crop.getData();
    else if (isOverlay) region = { x:(width-video.videoWidth)/2, y:(height-video.videoHeight)/2, width: video.videoWidth, height: video.videoHeight };
    else region = { x:0, y:0, width:width, height:height };
    const out = document.createElement('canvas');
    out.width = region.width; out.height = region.height;
    if (isOverlay) {
      out.getContext('2d').drawImage(video, Math.max(0, region.x-(width-video.videoWidth)/2), Math.max(region.y-(height-video.videoHeight)/2), region.width, region.height, 0, 0, region.width, region.height);
    } else {
      const id = rctx.getImageData(region.x, region.y, region.width, region.height);
      out.getContext('2d').putImageData(id, 0, 0);
    }
    self.onImage(out.toDataURL());
  };

  // Wire trigger click to capture
  q('trigger').onclick = this.capture;

  // External controls (exposed for React UI)
  this.setCropActive = (active)=>{
    try {
      const curr = crop.isActive();
      if (curr !== active) crop.toggle();
      if (active) wrapper.classList.add('has-crop'); else wrapper.classList.remove('has-crop');
    } catch {}
  };
  this.getCropActive = ()=>{ try { return crop.isActive(); } catch { return false; } };

  // Video init and render loop
  const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || !!legacyGetUM;
  const notSupported = q('notSupported');

  function start(){
    if (!supported) { notSupported.style.display = 'block'; return; }
    noWebcam.style.display = 'none';
    getUserMedia({ video: true }).then(onStream).catch(onFail);
  }
  function onStream(s){
    stream = s;
    try {
      video.srcObject = stream;
      video.play();
      raf(render);
    } catch(err){
      // moz fallback (very old)
      try { video.mozSrcObject = stream; } catch(e) {}
      video.addEventListener('canplay', ()=> raf(render), false);
      video.play();
    }
  }
  function onFail(){ noWebcam.style.display='block'; }

  const raf = (window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(fn){ return setTimeout(fn, 1000/60); });

  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
  function wrapHue(v){ if (v>1) return v-1; if (v<0) return 1+v; return v; }
  function render(){
    try {
      // draw video into offscreen canvas preserving aspect ratio (contain)
      const vw = video.videoWidth || width;
      const vh = video.videoHeight || height;
      const varr = vw / vh;
      const carr = width / height;
      let dw, dh, dx, dy;
      if (carr > varr) {
        // container wider → full height, letterbox left/right
        dh = height; dw = Math.round(dh * varr); dx = Math.round((width - dw) / 2); dy = 0;
      } else {
        // container taller → full width, letterbox top/bottom
        dw = width; dh = Math.round(dw / varr); dx = 0; dy = Math.round((height - dh) / 2);
      }
      vctx.clearRect(0,0,width,height);
      vctx.fillStyle = '#000';
      vctx.fillRect(0,0,width,height);
      vctx.drawImage(video, 0, 0, vw, vh, dx, dy, dw, dh);
    } catch(e) {}
    const img = vctx.getImageData(0,0,width,height);
    const data = img.data;
    for (let i=0;i<data.length;i+=4){
      let r=data[i]/255, g=data[i+1]/255, b=data[i+2]/255;
      const max=Math.max(r,g,b), min=Math.min(r,g,b);
      let h=0, s=0, l=(max+min)/2;
      if (max!==min){
        const d=max-min;
        s = l>0.5 ? d/(2-max-min) : d/(max+min);
        switch(max){
          case r: h=((g-b)/d+(g<b?6:0))/6; break;
          case g: h=((b-r)/d+2)/6; break;
          case b: h=((r-g)/d+4)/6; break;
        }
      }
      h = wrapHue(h + hue);
      s = clamp(s + sat, 0, 1);
      l = clamp(l + bri, 0, 1);
      // hsl -> rgb
      let q = l < 0.5 ? l*(1+s) : l + s - l*s;
      let p = 2*l - q;
      const hc = [h+1/3, h, h-1/3];
      const rgb = hc.map(H=>{
        if (H<0) H+=1; if (H>1) H-=1;
        if (H<1/6) return p + (q-p)*6*H;
        if (H<1/2) return q;
        if (H<2/3) return p + (q-p)*(2/3-H)*6;
        return p;
      });
      data[i] = Math.round(rgb[0]*255);
      data[i+1] = Math.round(rgb[1]*255);
      data[i+2] = Math.round(rgb[2]*255);
    }
    rctx.putImageData(img,0,0);
    if (!paused) raf(render);
  }

  // init sizes and attach
  this.resize(width,height);
  hostEl && hostEl.appendChild(wrapper);
  // Auto-start camera stream on initialization (browsers may still prompt for permission)
  this.start = start;
  if (!supported) { 
    notSupported.style.display='block'; 
  } else {
    // Attempt to start immediately; if permission is required, browser will show prompt.
    try { start(); } catch(e) { /* fallback: user can call instance.start() manually */ }
  }
}

export default Photobooth;
