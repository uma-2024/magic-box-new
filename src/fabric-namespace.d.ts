import type { 
  Canvas as FabricCanvas, 
  Textbox as FabricTextbox, 
  Rect as FabricRect, 
  FabricImage, 
  FabricText, 
  FabricObject, 
  util, 
  loadSVGFromString, 
  version 
} from "fabric";

// Declare the module export
declare module "../fabric-namespace" {
  interface FabricNamespace {
    Canvas: typeof FabricCanvas;
    Textbox: typeof FabricTextbox;
    Rect: typeof FabricRect;
    Image: typeof FabricImage;
    Text: typeof FabricText;
    Object: typeof FabricObject;
    util: typeof util;
    loadSVGFromString: typeof loadSVGFromString;
    version: typeof version;
  }
  
  const fabric: FabricNamespace;
  
  export default fabric;
  export { fabric };
  
}

// Global namespace declaration for fabric usage in code (allows fabric.Canvas, fabric.Image, etc.)
// This allows using fabric as both an imported object and a namespace
declare global {
  namespace fabric {
    export type Canvas = FabricCanvas;
    export type Textbox = FabricTextbox;
    export type Rect = FabricRect;
    export type Image = FabricImage;
    export type Text = FabricText;
    export type Object = FabricObject;
  }
}

