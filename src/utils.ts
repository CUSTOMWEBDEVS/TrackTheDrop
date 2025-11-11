export async function listCameras(){const d=await navigator.mediaDevices.enumerateDevices();return d.filter(x=>x.kind==='videoinput');}
export function parseRes(s){const [w,h]=s.split('x').map(Number);return {width:w||640,height:h||480};}
export function supportOffscreen(){try{return !!HTMLCanvasElement.prototype.transferControlToOffscreen;}catch{return false;}}