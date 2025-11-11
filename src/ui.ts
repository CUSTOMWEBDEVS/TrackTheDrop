export const el = {
  video: document.getElementById('video') as HTMLVideoElement,
  view: document.getElementById('view') as HTMLCanvasElement,
  cameraSelect: document.getElementById('cameraSelect') as HTMLSelectElement,
  resSelect: document.getElementById('resSelect') as HTMLSelectElement,
  startBtn: document.getElementById('startBtn') as HTMLButtonElement,
  stopBtn: document.getElementById('stopBtn') as HTMLButtonElement,
  snapBtn: document.getElementById('snapBtn') as HTMLButtonElement,
  showMask: document.getElementById('showMask') as HTMLInputElement,
  debugHeat: document.getElementById('debugHeat') as HTMLInputElement,
  thr: document.getElementById('thr') as HTMLInputElement,
  thrVal: document.getElementById('thrVal') as HTMLSpanElement,
  sens: document.getElementById('sens') as HTMLInputElement,
  sensVal: document.getElementById('sensVal') as HTMLSpanElement,
  morph: document.getElementById('morph') as HTMLInputElement,
  morphVal: document.getElementById('morphVal') as HTMLSpanElement
};

export function bindSlider(sl: HTMLInputElement, label: HTMLSpanElement, cb: () => void) {
  const render = () => { label.textContent = sl.value; cb(); };
  sl.addEventListener('input', render);
  render();
}
