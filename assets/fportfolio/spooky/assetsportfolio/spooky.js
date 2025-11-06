/* =======================
   spooky.js – Static Live Playground (module-friendly)
   ======================= */
(() => {
  'use strict';

  // ---- Preview fit options: 'width' (auto fit) or 'none' (no scaling)
  const FIT_MODE = 'NONE';

  const STORAGE_NS = 'spooky_animated_playground_v1';
  const PROJECT_NAME =
    (document.body && document.body.dataset.project3) ||
    new URLSearchParams(location.search).get('project3') ||
    (location.pathname.split('/').pop() || '').replace(/\.[a-z0-9]+$/i, '') ||
    'default';
  const STORAGE_KEY = `${STORAGE_NS}:${PROJECT_NAME}`;

  // Elements
  const els = {
    html: document.getElementById('html'),
    css: document.getElementById('css'),
    js: document.getElementById('js'),
    frame: document.getElementById('preview'),
    live: document.getElementById('liveToggle'),
    fills: document.querySelectorAll('[data-fill]'),
    grid: document.getElementById('playground'),
    gutter: document.querySelector('.gutter'),
    navToggle: document.getElementById('navToggle'),
    siteTabs: document.getElementById('siteTabs'),
    resetBlank: document.getElementById('resetBlank')
  };

  /* ======================
     Build iframe document (module-safe)
     ====================== */
  function buildDoc(html, css, js) {
    return `<!doctype html><html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{margin:0;height:100%;min-height:100vh;background:#111}
  ${css || ''}
</style>
</head><body>
${html || ''}

<script type="module">
${js || ''}

// Relay iframe console back to parent (so you can see errors)
const relay=(t,args)=>{try{parent&&parent.console&&parent.console[t](...args)}catch(_){}}; 
['log','warn','error'].forEach(t=>{const o=console[t].bind(console);console[t]=(...a)=>{relay(t,a);o(...a);}});
</script>
</body></html>`;
  }


  /* ======================
     Preview fit
     ====================== */
  let ro = null;
  let fitHandler = null;

  function enhancePreview(iframe) {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc || !doc.body) return;

    if (FIT_MODE === 'none') {
      try { ro && ro.disconnect(); } catch (_) { }
      ro = null;
      if (fitHandler) {
        window.removeEventListener('resize', fitHandler);
        fitHandler = null;
      }
      iframe.style.height = '100%';
      doc.documentElement.style.overflowX = '';
      doc.body.style.overflowX = '';
      doc.body.style.transform = '';
      doc.body.style.transformOrigin = '';
      return;
    }

    const fit = () => {
      const naturalWidth = Math.max(
        doc.documentElement.scrollWidth,
        doc.body.scrollWidth,
        doc.documentElement.clientWidth
      );
      const boxWidth = iframe.clientWidth || 1;
      const scale = Math.min(1, boxWidth / (naturalWidth || boxWidth));
      const body = doc.body;
      body.style.transformOrigin = 'top left';
      body.style.transform = `scale(${scale})`;
      doc.documentElement.style.overflowX = 'hidden';
      body.style.overflowX = 'hidden';

      const naturalHeight = Math.max(
        doc.documentElement.scrollHeight,
        body.scrollHeight
      ) || 0;
      iframe.style.height = (naturalHeight * scale) + 'px';
    };

    try { ro && ro.disconnect(); } catch (_) { }
    ro = new ResizeObserver(fit);
    ro.observe(doc.documentElement);
    ro.observe(doc.body);

    fitHandler = fit;
    window.addEventListener('resize', fitHandler);
    fit();
  }

  /* ======================
     Render & Persist
     ====================== */
  function isLive() {
    if (!els.live) return true;
    return els.live.getAttribute('aria-pressed') === 'true';
  }
  function setLive(on) {
    if (!els.live) return;
    els.live.setAttribute('aria-pressed', on ? 'true' : 'false');
    els.live.textContent = `Live: ${on ? 'ON' : 'OFF'}`;
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        html: els.html?.value || '',
        css: els.css?.value || '',
        js: els.js?.value || '',
        left: getComputedStyle(els.grid).getPropertyValue('--left').trim(),
        liveOn: isLive()
      }));
    } catch (_) { }
  }

  function render() {
    const html = els.html?.value || '';
    const css = els.css?.value || '';
    const js = els.js?.value || '';
    els.frame.srcdoc = buildDoc(html, css, js);
    els.frame.addEventListener('load', () => enhancePreview(els.frame), { once: true });
    persist();
  }

  // Save even when Live OFF; Ctrl/Cmd+Enter to force run
  let timer = null;
  function scheduleRender() {
    clearTimeout(timer);
    timer = setTimeout(isLive() ? render : persist, 160);
  }
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') render();
  });

  /* ======================
     Boot / Prefill (Spectral Ghost)
     ====================== */
  const SPECTRAL_HTML = `<!-- Preloader -->
<div id="preloader" class="preloader">
  <div class="preloader-content">
    <div class="ghost-loader">
      <svg class="ghost-svg" height="80" viewBox="0 0 512 512" width="80" xmlns="http://www.w3.org/2000/svg">
        <path class="ghost-body" d="m508.374 432.802s-46.6-39.038-79.495-275.781c-8.833-87.68-82.856-156.139-172.879-156.139-90.015 0-164.046 68.458-172.879 156.138-32.895 236.743-79.495 275.782-79.495 275.782-15.107 25.181 20.733 28.178 38.699 27.94 35.254-.478 35.254 40.294 70.516 40.294 35.254 0 35.254-35.261 70.508-35.261s37.396 45.343 72.65 45.343 37.389-45.343 72.651-45.343c35.254 0 35.254 35.261 70.508 35.261s35.27-40.772 70.524-40.294c17.959.238 53.798-2.76 38.692-27.94z" fill="white" />
        <circle class="ghost-eye left-eye" cx="208" cy="225" r="22" fill="black" />
        <circle class="ghost-eye right-eye" cx="297" cy="225" r="22" fill="black" />
      </svg>
    </div>
    <div class="loading-text">Summoning spirits</div>
    <div class="loading-progress"><div class="progress-bar"></div></div>
  </div>
</div>

<!-- Main Content -->
<div class="content" id="main-content">
  <div class="quote-container">
    <h1 class="quote">Veil of Dust<br/>Trail of Ash<br/>Heart of Ice</h1>
    <span class="author">Whispers through memory</span>
  </div>
</div>`;

  const SPECTRAL_CSS = `@import url("https://fonts.googleapis.com/css2?family=Boldonse&display=swap");
@font-face{font-family:"PPSupplyMono";src:url("https://assets.codepen.io/7558/PPSupplyMono-Variable.woff2") format("woff2");font-weight:100 900;font-style:normal}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#111;letter-spacing:-.03em}
/* Preloader */
.preloader{position:fixed;inset:0;background:linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 50%,#0a0a0a 100%);display:flex;justify-content:center;align-items:center;z-index:10000;opacity:1;transition:opacity 1s ease-out}
.preloader.fade-out{opacity:0;pointer-events:none}
.preloader-content{text-align:center;color:#e0e0e0}
.ghost-loader{position:relative;width:64px;height:64px;margin:0 auto 30px;display:flex;justify-content:center;align-items:center}
.ghost-svg{filter:drop-shadow(0 0 20px rgba(255,255,255,.3));animation:ghostFloat 3s ease-in-out infinite}
.ghost-body{fill:white;opacity:.9}
.ghost-eye{fill:black;animation:eyePulse 2s ease-in-out infinite;transform-origin:center}
.left-eye{animation-delay:0s}.right-eye{animation-delay:.1s}
@keyframes ghostFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes eyePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
.loading-text{font-family:"PPSupplyMono",monospace;font-size:12px;text-transform:uppercase;opacity:1;margin-bottom:12px;animation:textPulse 2s ease-in-out infinite}
@keyframes textPulse{0%,100%{opacity:1}50%{opacity:.1}}
.loading-progress{width:96px;height:1px;margin:0 auto;border-radius:1px;overflow:hidden}
.progress-bar{height:100%;background:linear-gradient(90deg,#00ff80,#00cc66);opacity:.1;width:0%;transition:width .8s ease}
/* Main content */
.content{position:fixed;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:20px;text-align:center;color:#e0e0e0;opacity:0;transition:opacity 1.5s ease-in}
.content.fade-in{opacity:1}
.quote-container{max-width:90%;overflow:hidden}
.quote{font-family:"Boldonse",system-ui;font-size:6vw;line-height:1.3;font-weight:400;letter-spacing:-.02em;margin-bottom:5vh;text-transform:uppercase}
.author{font-family:"PPSupplyMono",monospace;font-size:12px;text-transform:uppercase;opacity:.7;margin-top:2vh}
/* Canvas fade */
canvas{opacity:0 !important;transition:opacity 2s ease-in}
canvas.fade-in{opacity:1 !important}`;

  const SPECTRAL_JS = `import * as THREE from "https://esm.sh/three";
import { Pane } from "https://cdn.skypack.dev/tweakpane@4.0.4";
import { EffectComposer } from "https://esm.sh/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://esm.sh/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://esm.sh/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "https://esm.sh/three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "https://esm.sh/three/examples/jsm/postprocessing/ShaderPass.js";

/* --- Preloader --- */
class PreloaderManager {
  constructor() {
    this.preloader = document.getElementById("preloader");
    this.mainContent = document.getElementById("main-content");
    this.progressBar = document.querySelector(".progress-bar");
    this.loadingSteps = 0; this.totalSteps = 5; this.isComplete = false;
  }
  updateProgress(step){this.loadingSteps=Math.min(step,this.totalSteps);this.progressBar.style.width=\`\${(this.loadingSteps/this.totalSteps)*100}%\`;}
  complete(canvas){
    if(this.isComplete)return; this.isComplete=true; this.updateProgress(this.totalSteps);
    setTimeout(()=>{ this.preloader.classList.add("fade-out"); this.mainContent.classList.add("fade-in"); canvas.classList.add("fade-in");
      setTimeout(()=>{ this.preloader.style.display="none"; },1000);
    },1500);
  }
}
const preloader = new PreloaderManager();
document.body.style.transform="translateZ(0)"; document.body.style.backfaceVisibility="hidden"; document.body.style.perspective="1000px";
preloader.updateProgress(1);

/* --- Three setup --- */
const scene = new THREE.Scene(); scene.background = null;
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000); camera.position.z = 20;
preloader.updateProgress(2);

const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:"high-performance", alpha:true, premultipliedAlpha:false, stencil:false, depth:true, preserveDrawingBuffer:false });
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.9;
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);
Object.assign(renderer.domElement.style,{position:"absolute",top:"0",left:"0",zIndex:"2",pointerEvents:"auto",background:"transparent"});

/* --- Post FX --- */
const originalBloomSettings={strength:0.3,radius:1.25,threshold:0.0};
const composer=new EffectComposer(renderer); const renderPass=new RenderPass(scene,camera); composer.addPass(renderPass);
const bloomPass=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),originalBloomSettings.strength,originalBloomSettings.radius,originalBloomSettings.threshold); composer.addPass(bloomPass);

/* Analog Decay shader (trimmed to match your paste) */
const analogDecayShader={uniforms:{tDiffuse:{value:null},uTime:{value:0},uResolution:{value:new THREE.Vector2(innerWidth,innerHeight)},uAnalogGrain:{value:.4},uAnalogBleeding:{value:1},uAnalogVSync:{value:1},uAnalogScanlines:{value:1},uAnalogVignette:{value:1},uAnalogJitter:{value:.4},uAnalogIntensity:{value:.6},uLimboMode:{value:0}},vertexShader:\`
varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}
\`,fragmentShader:\`
uniform sampler2D tDiffuse;uniform float uTime;uniform vec2 uResolution;uniform float uAnalogGrain,uAnalogBleeding,uAnalogVSync,uAnalogScanlines,uAnalogVignette,uAnalogJitter,uAnalogIntensity,uLimboMode;varying vec2 vUv;
float random(vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);}
float gaussian(float z,float u,float o){return (1.0/(o*sqrt(2.0*3.1415)))*exp(-(((z-u)*(z-u))/(2.0*(o*o))));}
vec3 grain(vec2 uv,float t,float i){float seed=dot(uv,vec2(12.9898,78.233));float n=fract(sin(seed)*43758.5453+t*2.0);n=gaussian(n,0.0,0.25);return vec3(n)*i;}
void main(){
  vec2 uv=vUv; float time=uTime*1.8; vec2 jUv=uv;
  if(uAnalogJitter>0.01){float j=(random(vec2(floor(time*60.0)))-0.5)*0.003*uAnalogJitter*uAnalogIntensity; jUv.x+=j; jUv.y+=(random(vec2(floor(time*30.0)+1.0))-0.5)*0.001*uAnalogJitter*uAnalogIntensity;}
  if(uAnalogVSync>0.01){float r=sin(time*2.0+uv.y*100.0)*0.02*uAnalogVSync*uAnalogIntensity; float c=step(0.95,random(vec2(floor(time*4.0)))); jUv.y+=r*c;}
  vec4 col=texture2D(tDiffuse,jUv);
  if(uAnalogBleeding>0.01){float b=0.012*uAnalogBleeding*uAnalogIntensity; float p=time*1.5+uv.y*20.0;
    vec2 ro=vec2(sin(p)*b,0.0); vec2 bo=vec2(-sin(p*1.1)*b*0.8,0.0);
    float r=texture2D(tDiffuse,jUv+ro).r; float g=texture2D(tDiffuse,jUv).g; float bl=texture2D(tDiffuse,jUv+bo).b; col=vec4(r,g,bl,col.a);}
  if(uAnalogGrain>0.01){vec3 g=grain(uv,time,0.075*uAnalogGrain*uAnalogIntensity); g*=(1.0-col.rgb); col.rgb+=g;}
  if(uAnalogScanlines>0.01){float f=600.0+uAnalogScanlines*400.0; float pat=sin(uv.y*f)*0.5+0.5; float inten=0.1*uAnalogScanlines*uAnalogIntensity; col.rgb*=(1.0-pat*inten); float h=sin(uv.y*f*0.1)*0.02*uAnalogScanlines*uAnalogIntensity; col.rgb*=(1.0-h);}
  if(uAnalogVignette>0.01){vec2 v=(uv-0.5)*2.0; float vg=1.0-dot(v,v)*0.3*uAnalogVignette*uAnalogIntensity; col.rgb*=vg;}
  if(uLimboMode>0.5){float gray=dot(col.rgb,vec3(0.299,0.587,0.114)); col.rgb=vec3(gray);}
  gl_FragColor=col;
}\`};
const analogDecayPass=new ShaderPass(analogDecayShader); composer.addPass(analogDecayPass);
composer.addPass(new OutputPass());

/* Parameters, atmosphere, lights, ghost geometry … (kept as in your paste, condensed for space) */
const params={bodyColor:0x0f2027,glowColor:"orange",eyeGlowColor:"green",ghostOpacity:.88,ghostScale:2.4,emissiveIntensity:5.8,pulseSpeed:1.6,pulseIntensity:.6,eyeGlowIntensity:4.5,eyeGlowDecay:.95,eyeGlowResponse:.31,rimLightIntensity:1.8,followSpeed:.075,wobbleAmount:.35,floatSpeed:1.6,movementThreshold:.07,particleCount:250,particleDecayRate:.005,particleColor:"orange",createParticlesOnlyWhenMoving:true,particleCreationRate:5,revealRadius:43,fadeStrength:2.2,baseOpacity:.35,revealOpacity:0.0,fireflyGlowIntensity:2.6,fireflySpeed:.04,analogIntensity:.6,analogGrain:.4,analogBleeding:1,analogVSync:1,analogScanlines:1,analogVignette:1,analogJitter:.4,limboMode:false};
const fluorescentColors={cyan:0x00ffff,lime:0x00ff00,magenta:0xff00ff,yellow:0xffff00,orange:0xff4500,pink:0xff1493,purple:0x9400d3,blue:0x0080ff,green:0x00ff80,red:0xff0040,teal:0x00ffaa,violet:0x8a2be2};

const atmosphereGeometry=new THREE.PlaneGeometry(300,300);
const atmosphereMaterial=new THREE.ShaderMaterial({uniforms:{ghostPosition:{value:new THREE.Vector3(0,0,0)},revealRadius:{value:params.revealRadius},fadeStrength:{value:params.fadeStrength},baseOpacity:{value:params.baseOpacity},revealOpacity:{value:params.revealOpacity},time:{value:0}},vertexShader:\`
varying vec2 vUv;varying vec3 vWorldPosition;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.0);vWorldPosition=w.xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}
\`,fragmentShader:\`
uniform vec3 ghostPosition;uniform float revealRadius,fadeStrength,baseOpacity,revealOpacity,time;varying vec2 vUv;varying vec3 vWorldPosition;
void main(){float dist=distance(vWorldPosition.xy,ghostPosition.xy);float dyn=revealRadius+sin(time*2.0)*5.0;float rev=smoothstep(dyn*.2,dyn,dist);rev=pow(rev,fadeStrength);float op=mix(revealOpacity,baseOpacity,rev);gl_FragColor=vec4(0.001,0.001,0.002,op);}
\`,transparent:true,depthWrite:false});
const atmosphere=new THREE.Mesh(atmosphereGeometry,atmosphereMaterial); atmosphere.position.z=-50; atmosphere.renderOrder=-100; scene.add(atmosphere);

const ambientLight=new THREE.AmbientLight(0x0a0a2e,0.08); scene.add(ambientLight);
const ghostGroup=new THREE.Group(); scene.add(ghostGroup);

const ghostGeometry=new THREE.SphereGeometry(2,40,40);
const pos=ghostGeometry.getAttribute("position").array;
for(let i=0;i<pos.length;i+=3){ if(pos[i+1]<-0.2){ const x=pos[i], z=pos[i+2]; const n1=Math.sin(x*5)*.35, n2=Math.cos(z*4)*.25, n3=Math.sin((x+z)*3)*.15; pos[i+1]=-2.0+(n1+n2+n3);} }
ghostGeometry.computeVertexNormals();

const ghostMaterial=new THREE.MeshStandardMaterial({color:params.bodyColor,transparent:true,opacity:params.ghostOpacity,emissive:fluorescentColors[params.glowColor],emissiveIntensity:params.emissiveIntensity,roughness:.02,metalness:0,side:THREE.DoubleSide,alphaTest:.1});
const ghostBody=new THREE.Mesh(ghostGeometry,ghostMaterial); ghostGroup.add(ghostBody);

const rimLight1=new THREE.DirectionalLight(0x4a90e2,params.rimLightIntensity); rimLight1.position.set(-8,6,-4); scene.add(rimLight1);
const rimLight2=new THREE.DirectionalLight(0x50e3c2,params.rimLightIntensity*.7); rimLight2.position.set(8,-4,-6); scene.add(rimLight2);

/* Eyes */
function createEyes(){
  const g=new THREE.Group(); ghostGroup.add(g);
  const socketGeo=new THREE.SphereGeometry(.45,16,16);
  const socketMat=new THREE.MeshBasicMaterial({color:0x000000});
  const Ls=new THREE.Mesh(socketGeo,socketMat); Ls.position.set(-.7,.6,1.9); Ls.scale.set(1.1,1.0,.6); g.add(Ls);
  const Rs=Ls.clone(); Rs.position.x=.7; g.add(Rs);
  const eyeGeo=new THREE.SphereGeometry(.3,12,12);
  const Lm=new THREE.MeshBasicMaterial({color:fluorescentColors[params.eyeGlowColor],transparent:true,opacity:0});
  const Rm=Lm.clone();
  const Le=new THREE.Mesh(eyeGeo,Lm); Le.position.set(-.7,.6,2.0); g.add(Le);
  const Re=new THREE.Mesh(eyeGeo,Rm); Re.position.set(.7,.6,2.0); g.add(Re);
  const glowGeo=new THREE.SphereGeometry(.525,12,12);
  const Lgom=new THREE.MeshBasicMaterial({color:fluorescentColors[params.eyeGlowColor],transparent:true,opacity:0,side:THREE.BackSide});
  const Rgom=Lgom.clone();
  const Lg=new THREE.Mesh(glowGeo,Lgom); Lg.position.set(-.7,.6,1.95); g.add(Lg);
  const Rg=new THREE.Mesh(glowGeo,Rgom); Rg.position.set(.7,.6,1.95); g.add(Rg);
  return {leftEye:Le,rightEye:Re,leftEyeMaterial:Lm,rightEyeMaterial:Rm,leftOuterGlow:Lg,rightOuterGlow:Rg,leftOuterGlowMaterial:Lgom,rightOuterGlowMaterial:Rgom};
}
const eyes=createEyes();

/* Fireflies + Particles (same logic as your paste, lightly condensed) */
const fireflies=[]; const fireflyGroup=new THREE.Group(); scene.add(fireflyGroup);
function createFireflies(){ for(let i=0;i<20;i++){ const core=new THREE.Mesh(new THREE.SphereGeometry(.02,2,2), new THREE.MeshBasicMaterial({color:0xffff44,transparent:true,opacity:.9}));
  core.position.set((Math.random()-.5)*40,(Math.random()-.5)*30,(Math.random()-.5)*20);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(.08,8,8), new THREE.MeshBasicMaterial({color:0xffff88,transparent:true,opacity:.4,side:THREE.BackSide}));
  core.add(glow); const light=new THREE.PointLight(0xffff44,.8,3,2); core.add(light);
  core.userData={velocity:new THREE.Vector3((Math.random()-.5)*params.fireflySpeed,(Math.random()-.5)*params.fireflySpeed,(Math.random()-.5)*params.fireflySpeed),phase:Math.random()*Math.PI*2,pulseSpeed:2+Math.random()*3,glowMaterial:glow.material,fireflyMaterial:core.material,light};
  fireflyGroup.add(core); fireflies.push(core);
}}
createFireflies();

const particles=[]; const particleGroup=new THREE.Group(); scene.add(particleGroup);
const particlePool=[]; const particleGeos=[new THREE.SphereGeometry(.05,6,6),new THREE.TetrahedronGeometry(.04,0),new THREE.OctahedronGeometry(.045,0)];
const particleBaseMat=new THREE.MeshBasicMaterial({color:fluorescentColors[params.particleColor],transparent:true,opacity:0,alphaTest:.1});
function initParticlePool(n){for(let i=0;i<n;i++){const g=particleGeos[Math.floor(Math.random()*particleGeos.length)], m=particleBaseMat.clone(), p=new THREE.Mesh(g,m); p.visible=false; particleGroup.add(p); particlePool.push(p);}}
initParticlePool(100);
function createParticle(){let p;if(particlePool.length){p=particlePool.pop();p.visible=true;}else if(particles.length<params.particleCount){const g=particleGeos[Math.floor(Math.random()*particleGeos.length)], m=particleBaseMat.clone(); p=new THREE.Mesh(g,m); particleGroup.add(p);} else return null;
  const col=new THREE.Color(fluorescentColors[params.particleColor]); col.offsetHSL(Math.random()*0.1-0.05,0,0); p.material.color=col;
  p.position.copy(ghostGroup.position); p.position.z-=0.8+Math.random()*0.6; const r=3.5; p.position.x+=(Math.random()-.5)*r; p.position.y+=(Math.random()-.5)*r-0.8;
  const s=0.6+Math.random()*0.7; p.scale.set(s,s,s);
  p.rotation.set(Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.random()*Math.PI*2);
  p.userData.life=1.0; p.userData.decay=Math.random()*0.003+params.particleDecayRate;
  p.userData.rotationSpeed={x:(Math.random()-.5)*.015,y:(Math.random()-.5)*.015,z:(Math.random()-.5)*.015};
  p.userData.velocity={x:(Math.random()-.5)*.012,y:(Math.random()-.5)*.012-0.002,z:(Math.random()-.5)*.012-0.006};
  p.material.opacity=Math.random()*0.9; particles.push(p); return p;
}

/* GUI (same bindings as your paste) */
const pane=new Pane({title:"Spectral Ghost",expanded:false});
Object.assign(pane.element.style,{position:"fixed",top:"20px",right:"20px",zIndex:"10000",background:"rgba(0,0,0,.9)",borderRadius:"12px",padding:"15px",backdropFilter:"blur(10px)",border:"1px solid rgba(0,212,255,.3)",pointerEvents:"auto"});
const glowFolder=pane.addFolder({title:"Glow Effects",expanded:true});
glowFolder.addBinding(params,"glowColor",{label:"Glow Color",options:{Cyan:"cyan",Lime:"lime",Magenta:"magenta",Yellow:"yellow",Orange:"orange",Pink:"pink",Purple:"purple",Blue:"blue",Green:"green",Red:"red",Teal:"teal",Violet:"violet"}}).on("change",ev=>{ghostMaterial.emissive.set(fluorescentColors[ev.value]);});
glowFolder.addBinding(params,"emissiveIntensity",{label:"Ghost Glow",min:1,max:10,step:.1}).on("change",ev=>{ghostMaterial.emissiveIntensity=ev.value;});
const eyeFolder=pane.addFolder({title:"Eye Controls",expanded:true});
eyeFolder.addBinding(params,"eyeGlowColor",{label:"Eye Glow Color",options:{Cyan:"cyan",Lime:"lime",Magenta:"magenta",Yellow:"yellow",Orange:"orange",Pink:"pink",Purple:"purple",Blue:"blue",Green:"green",Red:"red",Teal:"teal",Violet:"violet"}}).on("change",ev=>{
  const c=fluorescentColors[ev.value];
  eyes.leftEyeMaterial.color.set(c); eyes.rightEyeMaterial.color.set(c);
  eyes.leftOuterGlowMaterial.color.set(c); eyes.rightOuterGlowMaterial.color.set(c);
});
eyeFolder.addBinding(params,"eyeGlowDecay",{label:"Glow Fade Speed",min:.9,max:.99,step:.01});
eyeFolder.addBinding(params,"eyeGlowResponse",{label:"Glow Response",min:.05,max:.5,step:.01});
eyeFolder.addBinding(params,"movementThreshold",{label:"Movement Threshold",min:.01,max:.1,step:.01});

const revealFolder=pane.addFolder({title:"Background Reveal",expanded:true});
revealFolder.addBinding(params,"revealRadius",{label:"Reveal Radius",min:5,max:100,step:2}).on("change",ev=>{atmosphereMaterial.uniforms.revealRadius.value=ev.value;});
revealFolder.addBinding(params,"fadeStrength",{label:"Fade Strength",min:.1,max:3,step:.1}).on("change",ev=>{atmosphereMaterial.uniforms.fadeStrength.value=ev.value;});
revealFolder.addBinding(params,"baseOpacity",{label:"Base Darkness",min:0,max:1,step:.05}).on("change",ev=>{atmosphereMaterial.uniforms.baseOpacity.value=ev.value;});
revealFolder.addBinding(params,"revealOpacity",{label:"Revealed Opacity",min:0,max:.5,step:.01}).on("change",ev=>{atmosphereMaterial.uniforms.revealOpacity.value=ev.value;});

const firefliesFolder=pane.addFolder({title:"Fireflies",expanded:false});
firefliesFolder.addBinding(params,"fireflyGlowIntensity",{label:"Firefly Glow",min:0,max:5,step:.1}).on("change",ev=>{
  fireflies.forEach(f=>{f.userData.glowMaterial.opacity=ev.value*0.4; f.userData.fireflyMaterial.opacity=ev.value*0.9; f.userData.light.intensity=ev.value*0.8;});
});
firefliesFolder.addBinding(params,"fireflySpeed",{label:"Firefly Speed",min:.005,max:.1,step:.005});

const analogFolder=pane.addFolder({title:"Analog Decay",expanded:true});
analogFolder.addBinding(params,"limboMode",{label:"Limbo"}).on("change",ev=>{analogDecayPass.uniforms.uLimboMode.value=ev.value?1:0;});
analogFolder.addBinding(params,"analogIntensity",{label:"Overall Intensity",min:0,max:2,step:.1}).on("change",ev=>{analogDecayPass.uniforms.uAnalogIntensity.value=ev.value;});
analogFolder.addBinding(params,"analogGrain",{label:"Film Grain",min:0,max:3,step:.1}).on("change",ev=>{analogDecayPass.uniforms.uAnalogGrain.value=ev.value;});
analogFolder.addBinding(params,"analogBleeding",{label:"Color Bleeding",min:0,max:3,step:.1}).on("change",ev=>{analogDecayPass.uniforms.uAnalogBleeding.value=ev.value;});
analogFolder.addBinding(params,"analogVSync",{label:"VSync Roll",min:0,max:3,step:.1}).on("change",ev=>{analogDecayPass.uniforms.uAnalogVSync.value=ev.value;});
analogFolder.addBinding(params,"analogScanlines",{label:"Scanlines",min:0,max:3,step:.1}).on("change",ev=>{analogDecayPass.uniforms.uAnalogScanlines.value=ev.value;});
analogFolder.addBinding(params,"analogVignette",{label:"Vignetting",min:0,max:3,step:.1}).on("change",ev=>{analogDecayPass.uniforms.uAnalogVignette.value=ev.value;});
analogFolder.addBinding(params,"analogJitter",{label:"Temporal Jitter",min:0,max:3,step:.1}).on("change",ev=>{analogDecayPass.uniforms.uAnalogJitter.value=ev.value;});

/* Resize */
let resizeTimeout; addEventListener("resize",()=>{
  if(resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout=setTimeout(()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); composer.setSize(innerWidth,innerHeight); bloomPass.setSize(innerWidth,innerHeight); analogDecayPass.uniforms.uResolution.value.set(innerWidth,innerHeight); },250);
});

/* Mouse */
const mouse=new THREE.Vector2(), prevMouse=new THREE.Vector2(), mouseSpeed=new THREE.Vector2();
let lastMouseUpdate=0, isMouseMoving=false, mouseMovementTimer=null;
addEventListener("mousemove",(e)=>{
  const now=performance.now(); if(now-lastMouseUpdate>16){
    prevMouse.copy(mouse);
    mouse.x=e.clientX/innerWidth*2-1; mouse.y=-(e.clientY/innerHeight)*2+1;
    mouseSpeed.subVectors(mouse,prevMouse); isMouseMoving=true; clearTimeout(mouseMovementTimer);
    mouseMovementTimer=setTimeout(()=>{isMouseMoving=false;},80); lastMouseUpdate=now;
}});

/* Animation */
let lastParticleTime=0,time=0,currentMovement=0,lastFrameTime=0,isInitialized=false,frameCount=0;

function forceInitialRender(){
  for(let i=0;i<3;i++) composer.render();
  for(let i=0;i<10;i++) createParticle();
  composer.render(); isInitialized=true;
  preloader.complete(renderer.domElement);
}
preloader.updateProgress(5); setTimeout(forceInitialRender,100);

function animate(ts){
  requestAnimationFrame(animate);
  if(!isInitialized) return;
  const dt=ts-lastFrameTime; lastFrameTime=ts; if(dt>100) return;
  time += (dt/16.67)*0.01; frameCount++;
  atmosphereMaterial.uniforms.time.value=time;
  analogDecayPass.uniforms.uTime.value=time;
  analogDecayPass.uniforms.uLimboMode.value=params.limboMode?1:0;

  const targetX=mouse.x*11, targetY=mouse.y*7;
  const prev=ghostGroup.position.clone();
  ghostGroup.position.x += (targetX-ghostGroup.position.x)*params.followSpeed;
  ghostGroup.position.y += (targetY-ghostGroup.position.y)*params.followSpeed;
  atmosphereMaterial.uniforms.ghostPosition.value.copy(ghostGroup.position);

  const move=prev.distanceTo(ghostGroup.position);
  currentMovement=currentMovement*params.eyeGlowDecay + move*(1-params.eyeGlowDecay);

  const float1=Math.sin(time*params.floatSpeed*1.5)*.03;
  const float2=Math.cos(time*params.floatSpeed*.7)*.018;
  const float3=Math.sin(time*params.floatSpeed*2.3)*.008;
  ghostGroup.position.y += float1+float2+float3;

  const pulse1=Math.sin(time*params.pulseSpeed)*params.pulseIntensity;
  const breathe=Math.sin(time*.6)*.12;
  ghostMaterial.emissiveIntensity=params.emissiveIntensity + pulse1 + breathe;

  fireflies.forEach(f=>{
    const u=f.userData, phase=time+u.phase, p=Math.sin(phase*u.pulseSpeed)*.4+.6;
    u.glowMaterial.opacity=params.fireflyGlowIntensity*.4*p;
    u.fireflyMaterial.opacity=params.fireflyGlowIntensity*.9*p;
    u.light.intensity=params.fireflyGlowIntensity*.8*p;
    u.velocity.x+=(Math.random()-.5)*.001; u.velocity.y+=(Math.random()-.5)*.001; u.velocity.z+=(Math.random()-.5)*.001;
    u.velocity.clampLength(0,params.fireflySpeed); f.position.add(u.velocity);
    if(Math.abs(f.position.x)>30) u.velocity.x*=-.5;
    if(Math.abs(f.position.y)>20) u.velocity.y*=-.5;
    if(Math.abs(f.position.z)>15) u.velocity.z*=-.5;
  });

  const dir=new THREE.Vector2(targetX-ghostGroup.position.x, targetY-ghostGroup.position.y).normalize();
  const tilt=.1*params.wobbleAmount, decay=.95;
  ghostBody.rotation.z=ghostBody.rotation.z*decay + -dir.x*tilt*(1-decay);
  ghostBody.rotation.x=ghostBody.rotation.x*decay +  dir.y*tilt*(1-decay);
  ghostBody.rotation.y=Math.sin(time*1.4)*.05*params.wobbleAmount;

  const scaleVar=1+Math.sin(time*2.1)*.025*params.wobbleAmount + pulse1*.015;
  const scaleBreath=1+Math.sin(time*.8)*.012;
  const s=scaleVar*scaleBreath; ghostBody.scale.set(s,s,s);

  const nSpeed=Math.hypot(mouseSpeed.x,mouseSpeed.y)*8;
  const moving = currentMovement>params.movementThreshold;
  const targetGlow = moving ? 1.0 : 0.0;
  const glowSpeed = moving ? params.eyeGlowResponse*2 : params.eyeGlowResponse;
  const newOp = eyes.leftEyeMaterial.opacity + (targetGlow - eyes.leftEyeMaterial.opacity)*glowSpeed;
  eyes.leftEyeMaterial.opacity=newOp; eyes.rightEyeMaterial.opacity=newOp;
  eyes.leftOuterGlowMaterial.opacity=newOp*.3; eyes.rightOuterGlowMaterial.opacity=newOp*.3;

  const shouldParticles = params.createParticlesOnlyWhenMoving ? (currentMovement>0.005 && (nSpeed>0 || moving)) : (currentMovement>0.005);
  if(shouldParticles && ts-lastParticleTime>100){
    const rate=Math.min(params.particleCreationRate, Math.max(1, Math.floor(nSpeed*3)));
    for(let i=0;i<rate;i++) createParticle();
    lastParticleTime=ts;
  }

  const toUpd=Math.min(particles.length,60);
  for(let i=0;i<toUpd;i++){
    const idx=(frameCount+i)%particles.length;
    const p=particles[idx]; if(!p) continue;
    p.userData.life-=p.userData.decay; p.material.opacity=p.userData.life*.85;
    if(p.userData.velocity){ p.position.x+=p.userData.velocity.x; p.position.y+=p.userData.velocity.y; p.position.z+=p.userData.velocity.z; p.position.x+=Math.cos(time*1.8+p.position.y)*0.0008; }
    if(p.userData.rotationSpeed){ p.rotation.x+=p.userData.rotationSpeed.x; p.rotation.y+=p.userData.rotationSpeed.y; p.rotation.z+=p.userData.rotationSpeed.z; }
    if(p.userData.life<=0){ p.visible=false; p.material.opacity=0; particlePool.push(p); particles.splice(idx,1); i--; }
  }

  composer.render();
}

dispatchEvent(new MouseEvent("mousemove",{clientX:innerWidth/2,clientY:innerHeight/2}));
animate(0);
`;

  (function boot() {
    const saved = (() => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || ''); } catch (_) { return null; }
    })();

    if (saved) {
      if (els.html) els.html.value = saved.html ?? '';
      if (els.css) els.css.value = saved.css ?? '';
      if (els.js) els.js.value = saved.js ?? '';
      if (saved.left && els.grid) els.grid.style.setProperty('--left', saved.left);
      setLive(saved.liveOn !== false);
    } else {
      // Prefill with Spectral Ghost so it runs immediately
      if (els.html) els.html.value = SPECTRAL_HTML + '\n';
      if (els.css) els.css.value = SPECTRAL_CSS + '\n';
      if (els.js) els.js.value = SPECTRAL_JS + '\n';
      setLive(true);
    }
    render();
  })();

  /* ======================
     Editor listeners
     ====================== */
  ['input', 'change', 'paste'].forEach(evt => {
    els.html?.addEventListener(evt, scheduleRender);
    els.css?.addEventListener(evt, scheduleRender);
    els.js?.addEventListener(evt, scheduleRender);
  });

  /* ======================
     Draggable split
     ====================== */
  let dragging = false;
  function setLeft(px) {
    if (!els.grid) return;
    const rect = els.grid.getBoundingClientRect();
    const min = 260, max = rect.width - 300;
    const clamped = Math.min(max, Math.max(min, px));
    els.grid.style.setProperty('--left', `${clamped}px`);
    persist();
  }
  if (els.gutter) {
    els.gutter.style.touchAction = 'none';
    els.gutter.setAttribute('tabindex', '-1');
    els.gutter.addEventListener('pointerdown', (e) => {
      dragging = true;
      els.gutter.setPointerCapture?.(e.pointerId);
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });
  }
  const onMove = (e) => {
    if (!dragging || !els.grid) return;
    const r = els.grid.getBoundingClientRect();
    setLeft(e.clientX - r.left);
  };
  const endDrag = () => { if (dragging) { dragging = false; document.body.style.cursor = ''; } };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  window.addEventListener('mouseleave', endDrag);

  // Collapse on small screens
  const mql = window.matchMedia('(max-width: 980px)');
  function handleMedia() { if (mql.matches && els.grid) els.grid.style.removeProperty('--left'); }
  mql.addEventListener('change', handleMedia); handleMedia();

  /* ======================
     Cursor-follow glow (parent doc)
     ====================== */
  (function cursorGlow() {
    const root = document.documentElement;
    let raf = null;
    const update = (x, y) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        root.style.setProperty('--cx', (x / innerWidth) * 100 + '%');
        root.style.setProperty('--cy', (y / innerHeight) * 100 + '%');
      });
    };
    window.addEventListener('pointermove', (e) => update(e.clientX, e.clientY), { passive: true });
    const boost = (on) => document.body.classList.toggle('cursor-boost', on);
    window.addEventListener('pointerdown', () => boost(true), { passive: true });
    window.addEventListener('pointerup', () => boost(false), { passive: true });
    window.addEventListener('pointercancel', () => boost(false), { passive: true });
    update(innerWidth * 0.5, innerHeight * 0.5);
  })();

  /* ======================
     Optional reset button
     ====================== */
  function resetToBlank() {
    if (els.html) els.html.value = '<!-- Write your HTML here -->\\n';
    if (els.css) els.css.value = '/* Write your CSS here */\\n';
    if (els.js) els.js.value = '// Write your JavaScript (module ok) here\\n';
    persist(); render();
  }
  els.resetBlank?.addEventListener('click', resetToBlank);

})();

/* ======================
   Copy buttons (html/css/js)
   ====================== */
(() => {
  const sources = { html: '#html', css: '#css', js: '#js' };
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-btn[data-copy]');
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    const key = btn.dataset.copy;
    const src = document.querySelector(sources[key]);
    if (!src) return;
    const text = (typeof src.value === 'string') ? src.value : (src.innerText ?? src.textContent ?? '');
    const flash = (ok) => {
      const prev = btn.textContent;
      btn.textContent = ok ? '✓ Copied' : '⚠️ Failed';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = prev; btn.disabled = false; }, 900);
    };
    try { await navigator.clipboard.writeText(text); flash(true); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); flash(true); }
      catch { flash(false); }
      finally { document.body.removeChild(ta); }
    }
  });


  /* ======================
     Responsive split + persistence per breakpoint
     ====================== */

  const BREAKPOINTS = {
    mobile: 980,
    tablet: 1200
  };

  // pick a name for current viewport bucket
  function currentBucket() {
    const w = window.innerWidth;
    if (w <= BREAKPOINTS.mobile) return 'mobile';
    if (w <= BREAKPOINTS.tablet) return 'tablet';
    return 'desktop';
  }

  // keys like spooky_...:PROJECT:left_desktop / left_tablet / left_mobile
  function leftKey(bucket = currentBucket()) {
    return `${STORAGE_KEY}:left_${bucket}`;
  }

  function saveLeftForBucket(px, bucket = currentBucket()) {
    try { localStorage.setItem(leftKey(bucket), String(px)); } catch { }
  }

  function loadLeftForBucket(bucket = currentBucket()) {
    try {
      const v = localStorage.getItem(leftKey(bucket));
      return v ? parseFloat(v) : null;
    } catch { return null; }
  }

  // apply left with clamping
  function applyLeft(px) {
    if (!els.grid) return;
    const rect = els.grid.getBoundingClientRect();
    const min = 260;
    const max = Math.max(min + 300, rect.width - 300);
    const clamped = Math.min(max, Math.max(min, px));
    els.grid.style.setProperty('--left', `${clamped}px`);
    saveLeftForBucket(clamped);
  }

  // restore left for current bucket, or set a sensible default
  function restoreLeftForBucket() {
    if (!els.grid) return;
    const saved = loadLeftForBucket();
    if (saved) {
      applyLeft(saved);
    } else {
      // defaults per bucket
      const b = currentBucket();
      if (b === 'desktop') els.grid.style.setProperty('--left', 'clamp(320px,40vw,560px)');
      if (b === 'tablet') els.grid.style.setProperty('--left', 'clamp(280px,46vw,520px)');
      if (b === 'mobile') els.grid.style.removeProperty('--left'); // stacked, no split
    }
  }

  // drag logic (unchanged except we save per-bucket)
  let dragging = false;
  function setLeft(px) { applyLeft(px); }

  if (els.gutter) {
    els.gutter.style.touchAction = 'none';
    els.gutter.setAttribute('tabindex', '-1');
    els.gutter.addEventListener('pointerdown', (e) => {
      dragging = true;
      els.gutter.setPointerCapture?.(e.pointerId);
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });

    // Double-click gutter = reset width for this breakpoint
    els.gutter.addEventListener('dblclick', () => {
      try { localStorage.removeItem(leftKey()); } catch { }
      restoreLeftForBucket();
    });
  }

  const onMove = (e) => {
    if (!dragging || !els.grid) return;
    const r = els.grid.getBoundingClientRect();
    setLeft(e.clientX - r.left);
  };
  const endDrag = () => { if (dragging) { dragging = false; document.body.style.cursor = ''; } };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  window.addEventListener('mouseleave', endDrag);

  // respond to viewport changes
  function onViewportChange() {
    const b = currentBucket();
    if (b === 'mobile') {
      // stacked layout — forget pixel left just for layout (we still keep stored)
      if (els.grid) els.grid.style.removeProperty('--left');
    } else {
      restoreLeftForBucket();
    }
  }
  addEventListener('resize', onViewportChange);
  addEventListener('orientationchange', onViewportChange);

  // initial apply
  onViewportChange();




  /* ===========================================================HAMBURGER MENU FOR MOBILE =========================================================== */
  // Hamburger toggle
  (() => {
    const btn = document.getElementById('navToggle');
    const tabs = document.getElementById('siteTabs');
    if (!btn || !tabs) return;

    function toggle() {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      document.documentElement.classList.toggle('nav-open', !open);
    }

    btn.addEventListener('click', toggle);

    // Close when clicking outside (mobile)
    document.addEventListener('click', (e) => {
      const open = document.documentElement.classList.contains('nav-open');
      if (!open) return;
      if (!tabs.contains(e.target) && !btn.contains(e.target)) {
        btn.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('nav-open');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        btn.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('nav-open');
      }
    });
  })();


  function adjustPaneScale() {
    if (window.innerWidth < 600) {
      pane.element.style.scale = "1.3";
      // Make control panel responsive and readable
      pane.element.style.width = "min(90vw, 380px)";
      pane.element.style.maxHeight = "80vh";
      pane.element.style.overflowY = "auto";
      pane.element.style.fontSize = "clamp(12px, 1.4vw, 16px)";
      pane.element.style.transformOrigin = "top right";
      pane.element.style.scale = "1.2";

    } else {
      pane.element.style.scale = "1";
      pane.element.style.width = "min(90vw, 380px)";
    }
  }
  adjustPaneScale();
  window.addEventListener("resize", adjustPaneScale);

})();
