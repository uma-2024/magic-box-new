declare module "fabric" {
  export interface IObjectOptions {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    id?: string;
    opacity?: number;
    originX?: string;
    originY?: string;
    data?: string;
    [key: string]: any;
  }

  export class Object {
    id?: string;
    left?: number;
    top?: number;
    type?: string;
    set(key: string | IObjectOptions, value?: any): Object;
    setCoords(): void;
    [key: string]: any;
  }

  export class Canvas {
    constructor(element: HTMLCanvasElement | string, options?: any);
    getObjects(): Object[];
    getWidth(): number;
    getHeight(): number;
    add(...objects: (Object | string)[]): Canvas;
    remove(...objects: Object[]): Canvas;
    renderAll(): void;
    setWidth(value: number): Canvas;
    setHeight(value: number): Canvas;
    [key: string]: any;
  }

  export class Rect extends Object {
    constructor(options?: IObjectOptions);
    [key: string]: any;
  }

  export class Textbox extends Object {
    constructor(text: string, options?: IObjectOptions);
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    [key: string]: any;
  }

  export class Text extends Object {
    constructor(text: string, options?: IObjectOptions);
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    [key: string]: any;
  }

  export class Image extends Object {
    constructor(element: HTMLImageElement | string, options?: IObjectOptions);
    getSrc(): string;
    [key: string]: any;
  }

  export namespace util {
    function groupSVGElements(objects: Object[], options?: any): Object | string;
  }

  export function loadSVGFromString(svgString: string): Promise<{ objects: Object[]; options: any }>;
  
  export const version: string;
  [key: string]: any;
}

// Global namespace for fabric usage (for compatibility with fabric-namespace)
declare global {
  namespace fabric {
    export type Canvas = import("fabric").Canvas;
    export type Textbox = import("fabric").Textbox;
    export type Rect = import("fabric").Rect;
    export type Image = import("fabric").FabricImage;
    export type Text = import("fabric").FabricText;
    export type Object = import("fabric").FabricObject;
    export const util: import("fabric").util;
    export const loadSVGFromString: typeof import("fabric").loadSVGFromString;
    export const version: typeof import("fabric").version;
  }
}

// Declare namespace for fabric-namespace module
declare module "../fabric-namespace" {
  import { Canvas, Textbox, Rect, Image, Text, Object, util, loadSVGFromString, version } from "fabric";
  
  export namespace fabric {
    export { Canvas, Textbox, Rect, Image, Text, Object, util, loadSVGFromString, version };
  }
  
  const fabric: {
    Canvas: typeof Canvas;
    Textbox: typeof Textbox;
    Rect: typeof Rect;
    Image: typeof Image;
    Text: typeof Text;
    Object: typeof Object;
    util: typeof util;
    loadSVGFromString: typeof loadSVGFromString;
    version: typeof version;
  };
  
  export default fabric;
}

