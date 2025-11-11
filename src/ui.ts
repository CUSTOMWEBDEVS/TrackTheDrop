export const el:any={video:document.getElementById('video'),view:document.getElementById('view'),
cameraSelect:document.getElementById('cameraSelect'),resSelect:document.getElementById('resSelect'),
startBtn:document.getElementById('startBtn'),stopBtn:document.getElementById('stopBtn'),snapBtn:document.getElementById('snapBtn'),
showMask:document.getElementById('showMask'),debugHeat:document.getElementById('debugHeat'),
thr:document.getElementById('thr'),thrVal:document.getElementById('thrVal'),
sens:document.getElementById('sens'),sensVal:document.getElementById('sensVal'),
morph:document.getElementById('morph'),morphVal:document.getElementById('morphVal'),
msg:document.getElementById('msg')};export function bindSlider(sl:any,label:any,cb:any){const render=()=>{label.textContent=sl.value;cb();};sl.addEventListener('input',render);render();}