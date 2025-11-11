export async function listCameras(): Promise<MediaDeviceInfo[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(d => d.kind === 'videoinput');
}

export function parseRes(s: string): { width: number; height: number } {
  const [w, h] = s.split('x').map(Number);
  return { width: w || 640, height: h || 480 };
}

export function supportOffscreen(): boolean {
  try {
    // @ts-ignore
    return !!HTMLCanvasElement.prototype.transferControlToOffscreen;
  } catch {
    return false;
  }
}
