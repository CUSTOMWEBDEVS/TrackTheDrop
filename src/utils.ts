export async function listCameras(){const devices=await navigator.mediaDevices.enumerateDevices();return devices.filter(d=>d.kind==='videoinput');}
export function parseRes(s){const [w,h]=s.split('x').map(Number);return {width:w||640,height:h||480};}
export function supportOffscreen(){try{return !!HTMLCanvasElement.prototype.transferControlToOffscreen;}catch{return false;}}