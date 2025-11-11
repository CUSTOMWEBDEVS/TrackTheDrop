import { el, bindSlider } from './ui';
import { parseRes, supportOffscreen, listCameras } from './utils';
import { processFrame } from './inlineProc';
import type { FrameMsg, ResultMsg } from './workerTypes';

let stream:MediaStream|null=null, anim:number|null=null;
let worker:Worker|null=null, sending=false, useInline=false;
let W=640,H=480;

function msg(s:string){console.log('[bt]',s); el.msg.textContent=s;}

async function populateCamerasAfterPermission(){
  try{
    const cams=await listCameras(); el.cameraSelect.innerHTML='';
    cams.forEach((d,i)=>{const o=document.createElement('option'); o.value=d.deviceId; o.textContent=d.label||`Camera ${i+1}`; el.cameraSelect.appendChild(o);});
    if(cams.length===0) msg('No cameras found. Settings → Safari → Camera → Allow for this site.');
    else msg('');
  }catch(e:any){ msg('enumerateDevices failed: '+e?.message); }
}

function getParams(){ return {
  thr:Number(el.thr.value)/100, sens:Number(el.sens.value)/100, morph:Number(el.morph.value),
  debugHeat:el.debugHeat.checked, showMask:el.showMask.checked
}; }

async function start(){
  if(stream) return;
  const {width,height}=parseRes(el.resSelect.value); W=width; H=height;
  try{
    msg('Requesting camera…');
    stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:{ ideal:'environment' } }, audio:false });
  }catch(err:any){
    msg('Camera error: '+err?.name+' — '+err?.message+'\nUse Safari over HTTPS (not in-app browser).');
    return;
  }
  el.video.srcObject = stream; try{ await el.video.play(); }catch{}
  const vw = el.video.videoWidth || W, vh = el.video.videoHeight || H;
  el.view.width = vw; el.view.height = vh;
  await populateCamerasAfterPermission();

  // Try module worker, fall back to inline
  try{
    worker = new Worker(new URL('./worker.ts', import.meta.url), { type:'module' });
    worker.onmessage = onWorker;
    useInline = false;
  }catch(e){
    console.warn('Worker failed, using inline processing', e);
    worker = null; useInline = true;
  }

  el.startBtn.disabled=true; el.stopBtn.disabled=false; el.snapBtn.disabled=false;
  msg('');
  tick();
}

function stop(){
  if(anim!==null) cancelAnimationFrame(anim); anim=null;
  if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; }
  el.startBtn.disabled=false; el.stopBtn.disabled=true; el.snapBtn.disabled=true;
}

async function tick(){
  const ctx = (el.view.getContext('2d') as CanvasRenderingContext2D);
  const params = getParams();
  const draw = async ()=>{
    if(!stream) return;
    ctx.drawImage(el.video, 0, 0, el.view.width, el.view.height);
    if (useInline){
      processFrame(ctx, el.view.width, el.view.height, params);
    } else if (worker){
      const frameBitmap = await createImageBitmap(el.view);
      const msg:FrameMsg = { type:'frame', bitmap: frameBitmap, width: el.view.width, height: el.view.height, params };
      if(!sending){ sending=true; worker.postMessage(msg,[frameBitmap]); } else { frameBitmap.close(); }
    }
  };
  await draw();
  anim = requestAnimationFrame(tick);
}

function onWorker(e:MessageEvent<ResultMsg>){
  sending=false;
  const bmp = e.data.bitmap;
  const ctx = el.view.getContext('2d')!;
  createImageBitmap(bmp).then(ib=>{ ctx.drawImage(ib, 0, 0, el.view.width, el.view.height); bmp.close(); ib.close?.(); });
}

function snapshot(){ const a=document.createElement('a'); a.download=`bloodtracker_${Date.now()}.png`; a.href=el.view.toDataURL('image/png'); a.click();}

function registerServiceWorker(){
  if('serviceWorker' in navigator){
    const swUrl = `${import.meta.env.BASE_URL}sw.js`; navigator.serviceWorker.register(swUrl).catch(e=>console.warn('SW',e));
  }
}

async function init(){
  if(!('mediaDevices' in navigator)){ alert('Camera not supported on this browser.'); return; }
  if(!supportOffscreen()) console.warn('OffscreenCanvas not available; performance may be lower.');
  el.msg.textContent = 'On iPhone: Safari over HTTPS → tap Start → Allow. If no prompt, Settings → Safari → Camera.';
  el.startBtn.onclick = start; el.stopBtn.onclick = stop; el.snapBtn.onclick = snapshot;
  bindSlider(el.thr,el.thrVal,()=>{}); bindSlider(el.sens,el.sensVal,()=>{}); bindSlider(el.morph,el.morphVal,()=>{});
  registerServiceWorker();
}
init();
