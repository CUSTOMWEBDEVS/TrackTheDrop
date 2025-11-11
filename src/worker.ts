/// <reference lib="webworker" />
import type { FrameMsg, ResultMsg } from './workerTypes';
const ctxCache=new Map<number,OffscreenCanvasRenderingContext2D>();
function getCtx(w:number,h:number){const key=(w<<16)^h;let ctx=ctxCache.get(key);if(!ctx){const c=new OffscreenCanvas(w,h);ctx=c.getContext('2d',{willReadFrequently:true})!;ctxCache.set(key,ctx);}else{const c=ctx.canvas as OffscreenCanvas;if(c.width!==w||c.height!==h){c.width=w;c.height=h;}}return ctx!;}
self.onmessage=async (e:MessageEvent<FrameMsg>)=>{const {bitmap,width,height,params}=e.data;const ctx=getCtx(width,height);ctx.drawImage(bitmap,0,0,width,height);bitmap.close();const out=ctx.getImageData(0,0,width,height);const d=out.data;const heat=new Float32Array(width*height);let min=1e9,max=-1e9;
for(let p=0,i=0;p<d.length;p+=4,i++){const r=d[p],g=d[p+1],b=d[p+2];const sum=r+g+b+1e-6;const normR=r/sum;const rgDiff=Math.max(0,(r-g)/255);
const maxc=Math.max(r,g,b),minc=Math.min(r,g,b),Δ=maxc-minc;const sat=maxc===0?0:Δ/maxc;const val=maxc/255;const vGate=Math.max(0,val-(0.25*(1-params.sens)));
let hval=0.62*normR+0.25*rgDiff+0.13*sat;hval*=vGate;heat[i]=hval;if(hval<min)min=hval;if(hval>max)max=hval;}
const scale=1/Math.max(1e-6,max-min);
for(let p=0,i=0;p<d.length;p+=4,i++){const n=(heat[i]-min)*scale;const on=n>=params.thr?255:0;
if(params.debugHeat){d[p]=Math.min(255,n*255);d[p+1]=0;d[p+2]=Math.min(255,(1-n)*255);d[p+3]=255;}
else if(params.showMask&&on){d[p]=Math.max(d[p],220);d[p+1]=Math.min(d[p+1],30);d[p+2]=Math.min(d[p+2],30);}else{d[p]=(d[p]*0.9)|0;d[p+1]=(d[p+1]*0.93)|0;d[p+2]=(d[p+2]*0.95)|0;}}
ctx.putImageData(out,0,0);
const bmp=await (ctx.canvas as OffscreenCanvas).convertToBlob({type:'image/png'}).then(b=>createImageBitmap(b));
const msg:ResultMsg={type:'result',bitmap:bmp};(self as any).postMessage(msg,[bmp]);};