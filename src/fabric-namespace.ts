// Namespace wrapper for fabric v6 to maintain compatibility with existing code
import {
  Canvas,
  Textbox,
  Rect,
  FabricImage as Image,
  FabricText as Text,
  FabricObject as Object,
  util,
  loadSVGFromString,
  version,
} from 'fabric';

// Create a namespace-like object
const fabric = {
  Canvas,
  Textbox,
  Rect,
  Image,
  Text,
  Object,
  util: util as any, // util namespace contains groupSVGElements and other utilities
  loadSVGFromString,
  version,
};

export default fabric;
export { fabric };

