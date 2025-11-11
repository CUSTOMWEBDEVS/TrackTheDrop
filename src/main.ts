import { el, bindSlider } from './ui';
import { listCameras, parseRes, supportOffscreen } from './utils';
import type { FrameMsg, ResultMsg } from './workerTypes';

let stream: MediaStream | null = null;
let anim: number | null = null;
let worker: Worker | null = null;
let sending = false;

let W = 640, H = 480;

async function populateCameras() {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    s.getTracks().forEach(t => t.stop());
  } catch {}
  const cams = await listCameras();
  el.cameraSelect.innerHTML = '';
  cams.forEach((d, i) => {
    const opt = document.createElement('option');
    opt.value = d.deviceId;
    opt.textContent = d.label || `Camera ${i+1}`;
    el.cameraSelect.appendChild(opt);
  });
}

function getParams() {
  return {
    thr: Number(el.thr.value) / 100,
    sens: Number(el.sens.value) / 100,
    morph: Number(el.morph.value),
    debugHeat: el.debugHeat.checked,
    showMask: el.showMask.checked
  };
}

async function start() {
  if (stream) return;
  const deviceId = el.cameraSelect.value || undefined;
  const { width, height } = parseRes(el.resSelect.value);
  W = width; H = height;
  stream = await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      width: { ideal: width },
      height: { ideal: height },
      facingMode: deviceId ? undefined : 'environment'
    },
    audio: false
  });
  el.video.srcObject = stream;
  await el.video.play();

  el.startBtn.disabled = true;
  el.stopBtn.disabled = false;
  el.snapBtn.disabled = false;

  if (!worker) {
    worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = onWorker;
  }

  el.view.width = width;
  el.view.height = height;

  tick();
}

function stop() {
  if (anim !== null) cancelAnimationFrame(anim);
  anim = null;
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  el.startBtn.disabled = false;
  el.stopBtn.disabled = true;
  el.snapBtn.disabled = true;
}

async function tick() {
  const ctx = (el.view.getContext('2d') as CanvasRenderingContext2D);
  const params = getParams();

  const draw = async () => {
    if (!stream || !worker) return;
    ctx.drawImage(el.video, 0, 0, W, H);
    const frameBitmap = await createImageBitmap(el.view);

    const msg: FrameMsg = { type: 'frame', bitmap: frameBitmap, width: W, height: H, params };
    if (!sending) {
      sending = true;
      worker.postMessage(msg, [frameBitmap]);
    } else {
      frameBitmap.close();
    }
  };

  await draw();
  anim = requestAnimationFrame(tick);
}

function onWorker(e: MessageEvent<ResultMsg>) {
  sending = false;
  const bmp = e.data.bitmap;
  const ctx = el.view.getContext('2d')!;
  createImageBitmap(bmp).then((ib) => {
    ctx.drawImage(ib, 0, 0, W, H);
    bmp.close();
    ib.close?.();
  });
}

function snapshot() {
  const a = document.createElement('a');
  a.download = `bloodtracker_${Date.now()}.png`;
  a.href = el.view.toDataURL('image/png');
  a.click();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Resolve under Vite's base path automatically
    navigator.serviceWorker.register(new URL('sw.js', import.meta.url)).catch(() => {});
  }
}

async function init() {
  if (!('mediaDevices' in navigator)) {
    alert('Camera not supported on this browser.');
    return;
  }
  if (!supportOffscreen()) {
    console.warn('OffscreenCanvas not available; performance may be lower.');
  }
  await populateCameras();

  el.startBtn.onclick = start;
  el.stopBtn.onclick = stop;
  el.snapBtn.onclick = snapshot;

  bindSlider(el.thr, el.thrVal, ()=>{});
  bindSlider(el.sens, el.sensVal, ()=>{});
  bindSlider(el.morph, el.morphVal, ()=>{});

  registerServiceWorker();
}

init();
