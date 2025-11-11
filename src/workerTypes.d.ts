export type FrameMsg = {
  type: 'frame';
  bitmap: ImageBitmap;
  width: number;
  height: number;
  params: {
    thr: number;       // 0..1
    sens: number;      // 0..1
    morph: number;     // integer radius (0..5)
    debugHeat: boolean;
    showMask: boolean;
  };
};

export type ResultMsg = {
  type: 'result';
  bitmap: ImageBitmap;   // processed overlay
};
