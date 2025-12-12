"use client";
// @ts-nocheck - TypeScript namespace issues with fabric wrapper, but runtime works correctly
// The @ts-nocheck directive suppresses all TypeScript errors in this file.
// The "Cannot find namespace 'fabric'" errors are IDE warnings only and won't affect compilation or runtime.
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "../mocks/next-navigation";
import fabric from "../fabric-namespace";
interface Key {
  param: string;
  type: string;
  children?: { param: string; type: string }[];
}

const EditTemplatePage = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [newText, setNewText] = useState("");
  const [plainText, setPlainText] = useState("");
  const [svgElements, setSvgElements] = useState<{ id: string; svg: string }[]>(
    []
  );
  const [dynamicFieldData, setDynamicFieldData] = useState<{
    [key: string]: string;
  }>({});

  const apiIp = import.meta.env.VITE_API_URL || "http://localhost:3000/api/";
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedSvgObj, setUploadedSvgObj] = useState<fabric.Object | null>(
    null
  );
  const [svgOpacity, setSvgOpacity] = useState<number>(1);
  const [title, setTitle] = useState("Reward Certificate");
  // const [keys, setKeys] = useState<{ param: string; type: string }[]>([
  // { param: "did", type: "string" },
  // ]);
  const [keys, setKeys] = useState<Key[]>([{ param: "did", type: "string" }]);
  const [qrPosition, setQrPosition] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });
  const [canvasFields, setCanvasFields] = useState<
    { param: string; type: "string" | "number" | "date" }[]
  >([]);

  const [mobileNumber, setMobileNumber] = useState("");
  const [referral, setReferral] = useState("");

  const [htmlInput, setHtmlInput] = useState(
    '<p style="left: 100px; top: 150px; font-size: 24px; color: #333;">Hello World</p>\n<img src="https://api.qrserver.com/v1/create-qr-code/?data=${did}&size=100x100" style="left: 200px; top: 300px; width: 100px; height: 100px;" />'
  );
  const [certificates, setCertificates] = useState<Array<{
    filename: string;
    path: string;
    size: number;
    created: string;
    modified: string;
  }>>([]);
  const [showCertificates, setShowCertificates] = useState(false);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  function parseHtmlToCanvas(html: string, fabricCanvas: fabric.Canvas): void {
    // 1. Clear out any existing objects
    fabricCanvas.clear();
    
    // 2. Create a temporary container to parse HTML
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.visibility = "hidden";
    container.style.width = "2000px";
    container.style.height = "2000px";
    container.style.top = "0";
    container.style.left = "0";
    document.body.appendChild(container);
    container.innerHTML = html;
    
    // Wait for DOM to be ready
    setTimeout(() => {
      parseHtmlToCanvasInternal(html, fabricCanvas, container);
    }, 0);
  }

  function parseHtmlToCanvasInternal(html: string, fabricCanvas: fabric.Canvas, container: HTMLElement): void {

    // Helper function to parse and apply radial gradient
    const applyRadialGradient = (gradientStr: string, canvas: fabric.Canvas, callback?: () => void) => {
      try {
        // Parse radial-gradient(circle at top, rgb(0,14,40), rgb(0, 26, 59) 70%)
        const radialMatch = gradientStr.match(/radial-gradient\(([^)]+)\)/);
        if (!radialMatch) {
          console.warn("Failed to parse radial gradient:", gradientStr);
          if (callback) callback();
          return false;
        }
        
        const gradientContent = radialMatch[1];
        
        // Extract color stops
        const colorStops: Array<{ color: string; offset: number }> = [];
        const colorRegex = /rgb\((\d+),\s*(\d+),\s*(\d+)\)(?:\s+(\d+)%)?/g;
        let match;
        let index = 0;
        
        while ((match = colorRegex.exec(gradientContent)) !== null) {
          const r = parseInt(match[1]);
          const g = parseInt(match[2]);
          const b = parseInt(match[3]);
          const offset = match[4] ? parseFloat(match[4]) / 100 : (index === 0 ? 0 : 1);
          
          colorStops.push({
            color: `rgb(${r}, ${g}, ${b})`,
            offset: offset
          });
          index++;
        }
        
        if (colorStops.length < 2) {
          console.warn("Not enough color stops in gradient:", gradientStr);
          if (callback) callback();
          return false;
        }
        
        // Create a temporary canvas to render the gradient
        const tempCanvas = document.createElement("canvas");
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        tempCanvas.width = canvasWidth;
        tempCanvas.height = canvasHeight;
        const ctx = tempCanvas.getContext("2d");
        
        if (!ctx) {
          console.warn("Failed to get 2D context for gradient");
          if (callback) callback();
          return false;
        }
        
        // Determine gradient center position from "at top", "at center", "at bottom", etc.
        let centerX = canvasWidth / 2;
        let centerY = canvasHeight / 2; // Default to center
        
        if (gradientContent.includes("at top")) {
          centerY = 0;
        } else if (gradientContent.includes("at bottom")) {
          centerY = canvasHeight;
        } else if (gradientContent.includes("at left")) {
          centerX = 0;
        } else if (gradientContent.includes("at right")) {
          centerX = canvasWidth;
        } else if (gradientContent.includes("at center")) {
          centerX = canvasWidth / 2;
          centerY = canvasHeight / 2;
        }
        
        // Use a large radius to ensure full coverage
        const radius = Math.max(canvasWidth, canvasHeight) * 1.5;
        
        // Create radial gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        
        // Add color stops
        colorStops.forEach(stop => {
          gradient.addColorStop(stop.offset, stop.color);
        });
        
        // Fill the canvas with gradient
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Convert to data URL and set as background
        const dataURL = tempCanvas.toDataURL();
        fabric.Image.fromURL(dataURL, (img: fabric.Image) => {
          if (!img) {
            console.error("Failed to create image from gradient data URL");
            if (callback) callback();
            return;
          }
          img.set({
            left: 0,
            top: 0,
            selectable: false,
            evented: false,
          });
          img.scaleToWidth(canvasWidth);
          img.scaleToHeight(canvasHeight);
          canvas.setBackgroundImage(img, () => {
            canvas.renderAll();
            console.log("✅ Radial gradient background applied successfully");
            if (callback) callback();
          });
        }, { crossOrigin: "anonymous" });
        
        return true;
      } catch (error) {
        console.error("Error applying radial gradient:", error);
        if (callback) callback();
        return false;
      }
    };

    // Helper function to apply SVG as background image
    const applySvgBackground = async (svgUrl: string, canvas: fabric.Canvas) => {
      try {
        // Fetch SVG content
        const response = await fetch(svgUrl);
        if (!response.ok) {
          console.warn(`Failed to fetch SVG: ${svgUrl}`);
          return false;
        }
        
        const svgText = await response.text();
        
        // Load SVG using fabric
        const { objects, options } = await fabric.loadSVGFromString(svgText);
        const validObjects = objects.filter(
          (obj: any): obj is fabric.Object => obj !== null
        );
        
        if (validObjects.length === 0) {
          console.warn("No valid objects in SVG");
          return false;
        }
        
        // Group SVG elements
        const svgGroup = fabric.util.groupSVGElements(validObjects, options);
        
        // Get canvas dimensions
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        
        // Get SVG bounds
        const bounds = (svgGroup as fabric.Object).getBoundingRect();
        const svgWidth = bounds.width || canvasWidth;
        const svgHeight = bounds.height || canvasHeight;
        
        // Scale SVG to cover entire canvas
        const scaleX = canvasWidth / svgWidth;
        const scaleY = canvasHeight / svgHeight;
        const scale = Math.max(scaleX, scaleY); // Cover entire canvas
        
        (svgGroup as fabric.Object).set({
          left: 0,
          top: 0,
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false,
        });
        
        // Convert SVG to data URL and use as background image
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
        const svgDataUrl = URL.createObjectURL(svgBlob);
        
        // Create image from SVG data URL
        const svgImg = new Image();
        svgImg.onload = () => {
          // Create temporary canvas to render SVG at full size
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvasWidth;
          tempCanvas.height = canvasHeight;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (!tempCtx) {
            URL.revokeObjectURL(svgDataUrl);
            return;
          }
          
          // Draw SVG to cover entire canvas
          tempCtx.drawImage(svgImg, 0, 0, canvasWidth, canvasHeight);
          const dataURL = tempCanvas.toDataURL('image/png');
          
          // Set as background image
          fabric.Image.fromURL(dataURL, (img: fabric.Image) => {
            img.set({
              left: 0,
              top: 0,
              selectable: false,
              evented: false,
            });
            img.scaleToWidth(canvasWidth);
            img.scaleToHeight(canvasHeight);
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
            URL.revokeObjectURL(svgDataUrl);
          });
        };
        
        svgImg.onerror = () => {
          console.error("Failed to load SVG image");
          URL.revokeObjectURL(svgDataUrl);
        };
        
        svgImg.src = svgDataUrl;
        
        return true;
      } catch (error) {
        console.error("Error loading SVG background:", error);
        return false;
      }
    };

    // 3. Find body or first wrapper div (for background)
    const body = container.querySelector("body") || container.querySelector("div");
    let bodyBg = "";
    let hasGradient = false;
    let gradientString = "";
    let hasSvgBackground = false;
    let svgBackgroundUrl = "";
    let canvasWidth = 800;
    let canvasHeight = 600;

    if (body) {
      const bodyEl = body as HTMLElement;
      const bodyStyle = window.getComputedStyle(bodyEl);
      
      // Extract background gradient, SVG, or color
      const bgImage = bodyEl.style.backgroundImage || bodyStyle.backgroundImage;
      const bgColor = bodyEl.style.backgroundColor || bodyStyle.backgroundColor;
      
      if (bgImage && bgImage !== "none") {
        if (bgImage.includes("radial-gradient")) {
          // Will apply gradient after canvas size is set
          hasGradient = true;
          gradientString = bgImage;
        } else if (bgImage.includes(".svg") || bgImage.includes("url(")) {
          // Extract SVG URL from background-image: url('path/to/file.svg')
          const urlMatch = bgImage.match(/url\(['"]?([^'")]+\.svg)['"]?\)/);
          if (urlMatch) {
            hasSvgBackground = true;
            svgBackgroundUrl = urlMatch[1];
            // Handle relative paths - convert to absolute if needed
            if (!svgBackgroundUrl.startsWith("http") && !svgBackgroundUrl.startsWith("/")) {
              // If it's a relative path, try to resolve it
              svgBackgroundUrl = svgBackgroundUrl.startsWith("./") 
                ? svgBackgroundUrl.substring(2) 
                : svgBackgroundUrl;
            }
          }
        } else {
          // Extract colors from other gradient types
          const gradientMatch = bgImage.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g);
          if (gradientMatch && gradientMatch.length > 0) {
            const firstColor = gradientMatch[0];
            bodyBg = firstColor.replace("rgb(", "").replace(")", "");
          }
        }
      } else if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
        const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          bodyBg = `${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}`;
        }
      }
    }

    // 4. Find the main container (canvas-area or first positioned div)
    const mainContainer = container.querySelector("div[id*='canvas'], div[id*='canvas-area']") || 
                          container.querySelector("div[style*='position:relative']") ||
                          container.querySelector("div[style*='position']") ||
                          container.querySelector("div");
    
    if (mainContainer) {
      const containerEl = mainContainer as HTMLElement;
      const containerStyle = window.getComputedStyle(containerEl);
      
      // ⭐ FIX #1: Use offsetWidth/offsetHeight for accurate dimensions
      // This ensures canvas size matches HTML container exactly
      canvasWidth = containerEl.offsetWidth || parseInt(containerStyle.width || "800", 10);
      canvasHeight = containerEl.offsetHeight || parseInt(containerStyle.height || "600", 10);
      
      // Fallback to style parsing if offsetWidth/offsetHeight are 0
      if (canvasWidth === 0 || canvasHeight === 0) {
        const widthStr = containerEl.style.width || containerStyle.width || "800px";
        const heightStr = containerEl.style.height || containerStyle.height || "600px";
        
        canvasWidth = parseInt(widthStr.replace("px", "").replace("vw", ""), 10);
        canvasHeight = parseInt(heightStr.replace("px", "").replace("vh", ""), 10);
        
        // Handle vw/vh units
        if (widthStr.includes("vw")) canvasWidth = (canvasWidth / 100) * window.innerWidth;
        if (heightStr.includes("vh")) canvasHeight = (canvasHeight / 100) * window.innerHeight;
      }
      
      // ⭐ FIX #3: Set canvas dimensions with zoom = 1 (no DPI scaling)
      fabricCanvas.setWidth(canvasWidth);
      fabricCanvas.setHeight(canvasHeight);
      fabricCanvas.setZoom(1); // Ensure 1:1 pixel ratio
      fabricCanvas.calcOffset(); // Recalculate offsets
      
      // ⭐ FIX #2: Reset viewport transform to ensure canvas origin = HTML origin
      fabricCanvas.absolutePan({ x: 0, y: 0 });
      fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      
      // Check container for background (gradient, SVG, or color) if body bg not found
      if (!hasGradient && !hasSvgBackground && !bodyBg) {
        const containerBgImage = containerEl.style.backgroundImage || containerStyle.backgroundImage;
        const containerBgColor = containerEl.style.backgroundColor || containerStyle.backgroundColor;
        
        if (containerBgImage && containerBgImage !== "none") {
          if (containerBgImage.includes("radial-gradient")) {
            hasGradient = true;
            gradientString = containerBgImage;
          } else if (containerBgImage.includes(".svg") || containerBgImage.includes("url(")) {
            // Extract SVG URL from background-image
            const urlMatch = containerBgImage.match(/url\(['"]?([^'")]+\.svg)['"]?\)/);
            if (urlMatch) {
              hasSvgBackground = true;
              svgBackgroundUrl = urlMatch[1];
              if (!svgBackgroundUrl.startsWith("http") && !svgBackgroundUrl.startsWith("/")) {
                svgBackgroundUrl = svgBackgroundUrl.startsWith("./") 
                  ? svgBackgroundUrl.substring(2) 
                  : svgBackgroundUrl;
              }
            }
          }
        } else if (containerBgColor && containerBgColor !== "rgba(0, 0, 0, 0)" && containerBgColor !== "transparent") {
          const rgbMatch = containerBgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (rgbMatch) {
            bodyBg = `${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}`;
          }
        }
      }
    }

    // ⭐ FIX #5: Apply background FIRST (before adding content)
    // This ensures background doesn't push elements around
    const applyBackground = () => {
      if (hasGradient && gradientString) {
        applyRadialGradient(gradientString, fabricCanvas, () => {
          // Continue parsing after gradient is applied
          parseContent();
        });
      } else if (hasSvgBackground && svgBackgroundUrl) {
        // Apply SVG as background
        applySvgBackground(svgBackgroundUrl, fabricCanvas).then(() => {
          parseContent();
        }).catch(err => {
          console.error("Failed to apply SVG background:", err);
          // Fallback to solid color if SVG fails
          if (bodyBg) {
            fabricCanvas.setBackgroundColor(`rgb(${bodyBg})`, () => {
              fabricCanvas.renderAll();
              parseContent();
            });
          } else {
            parseContent();
          }
        });
      } else if (bodyBg) {
        // Set solid color background
        fabricCanvas.setBackgroundColor(`rgb(${bodyBg})`, () => {
          fabricCanvas.renderAll();
          parseContent();
        });
      } else {
        // No background, proceed directly
        parseContent();
      }
    };

    // ⭐ STEP 1: Extract z-index safely from any HTML element
    const getZIndex = (el: HTMLElement): number => {
      const z = window.getComputedStyle(el).zIndex;
      if (!z || z === "auto") return 0;
      const parsed = parseInt(z, 10);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Function to parse and add content (called after background is set)
    const parseContent = () => {
      // 5. Helper function to calculate absolute position considering all factors
      const getAbsolutePosition = (element: HTMLElement, parentContainer?: HTMLElement): { left: number; top: number; width?: number; height?: number } => {
      const style = window.getComputedStyle(element);
      const inlineStyle = element.style;
      
      let left = 0;
      let top = 0;
      let width = 0;
      let height = 0;
      
      // Get parent container dimensions for percentage calculations
      const parent = parentContainer || (element.parentElement as HTMLElement);
      const parentWidth = parent ? (parseInt(window.getComputedStyle(parent).width) || canvasWidth) : canvasWidth;
      const parentHeight = parent ? (parseInt(window.getComputedStyle(parent).height) || canvasHeight) : canvasHeight;
      
      // Handle left positioning
      const leftValue = inlineStyle.left || style.left;
      if (leftValue) {
        if (leftValue.includes("%")) {
          left = (parseFloat(leftValue) / 100) * parentWidth;
        } else if (leftValue.includes("50%")) {
          // Special case for centering
          left = parentWidth / 2;
        } else {
          left = parseFloat(leftValue) || 0;
        }
      }
      
      // Handle right positioning
      const rightValue = inlineStyle.right || style.right;
      if (rightValue && !leftValue) {
        const rightNum = parseFloat(rightValue) || 0;
        left = parentWidth - rightNum;
        if (element.offsetWidth) {
          left -= element.offsetWidth;
        }
      }
      
      // Handle top positioning
      const topValue = inlineStyle.top || style.top;
      if (topValue) {
        if (topValue.includes("%")) {
          top = (parseFloat(topValue) / 100) * parentHeight;
        } else {
          top = parseFloat(topValue) || 0;
        }
      }
      
      // Handle transform: translateX(-50%)
      if (inlineStyle.transform && inlineStyle.transform.includes("translateX(-50%)")) {
        const elementWidth = element.offsetWidth || parseInt(style.width) || 0;
        left = (parentWidth / 2) - (elementWidth / 2);
      }
      
      // Get dimensions
      width = element.offsetWidth || parseInt(style.width) || 0;
      height = element.offsetHeight || parseInt(style.height) || 0;
      
      // Add parent offset if parent is positioned
      if (parent && parent !== container) {
        const parentPos = getAbsolutePosition(parent);
        left += parentPos.left || 0;
        top += parentPos.top || 0;
      }
      
      return { left, top, width, height };
    };

    // ⭐ STEP 2: Collect all elements and sort by z-index
    // Collect all elements that need to be rendered
    const allElements: Array<{ element: HTMLElement; type: string; zIndex: number }> = [];
    
    // Collect divs
    container.querySelectorAll("div").forEach((div) => {
      const divEl = div as HTMLElement;
      if (divEl === mainContainer) return; // Skip main container
      const position = window.getComputedStyle(divEl).position;
      if (position === "absolute" || position === "relative") {
        allElements.push({
          element: divEl,
          type: "div",
          zIndex: getZIndex(divEl)
        });
      }
    });
    
    // Collect paragraphs
    container.querySelectorAll("p").forEach((p) => {
      allElements.push({
        element: p as HTMLElement,
        type: "p",
        zIndex: getZIndex(p as HTMLElement)
      });
    });
    
    // Collect images
    container.querySelectorAll("img").forEach((img) => {
      allElements.push({
        element: img as HTMLElement,
        type: "img",
        zIndex: getZIndex(img as HTMLElement)
      });
    });
    
    // Collect SVGs
    container.querySelectorAll("svg").forEach((svg) => {
      allElements.push({
        element: svg.parentElement as HTMLElement || svg as HTMLElement,
        type: "svg",
        zIndex: getZIndex(svg as HTMLElement)
      });
    });
    
    // Collect spans
    container.querySelectorAll("span").forEach((span) => {
      allElements.push({
        element: span as HTMLElement,
        type: "span",
        zIndex: getZIndex(span as HTMLElement)
      });
    });
    
    // Sort by z-index (lower z-index = below, higher = above)
    allElements.sort((a, b) => {
      // First sort by z-index
      const zDiff = a.zIndex - b.zIndex;
      if (zDiff !== 0) return zDiff;
      
      // If z-index is the same, maintain DOM order (depth-first)
      let depthA = 0;
      let depthB = 0;
      let el: HTMLElement | null = a.element;
      while (el && el !== container) {
        depthA++;
        el = el.parentElement;
      }
      el = b.element;
      while (el && el !== container) {
        depthB++;
        el = el.parentElement;
      }
      return depthA - depthB;
    });
    
    // 6. Render all elements in z-index order
    allElements.forEach(({ element, type }) => {
      if (type === "div") {
        const divEl = element;
        const style = window.getComputedStyle(divEl);
        const inlineStyle = divEl.style;
        const position = style.position || inlineStyle.position;
        
        // Skip the main container div
        if (divEl === mainContainer) return;
      
      if (position === "absolute" || position === "relative") {
        const pos = getAbsolutePosition(divEl, mainContainer as HTMLElement);
        
        // Check if div has background, border, or padding (render as rectangle)
        const hasBackground = inlineStyle.backgroundColor || style.backgroundColor;
        const hasBorder = inlineStyle.border || style.border || inlineStyle.borderWidth;
        const borderRadius = inlineStyle.borderRadius || style.borderRadius;
        const padding = parseInt(inlineStyle.padding || style.padding || "0", 10);
        
        if (hasBackground || hasBorder || padding > 0) {
          const bgColor = inlineStyle.backgroundColor || style.backgroundColor || "transparent";
          const borderColor = inlineStyle.borderColor || style.borderColor || "#000";
          const borderWidth = parseInt(inlineStyle.borderWidth || style.borderWidth || "0", 10);
          const borderRad = parseInt(borderRadius || "0", 10);
          
          const rect = new fabric.Rect({
            left: pos.left,
            top: pos.top,
            width: pos.width || parseInt(inlineStyle.width || style.width || "100", 10),
            height: pos.height || parseInt(inlineStyle.height || style.height || "100", 10),
            fill: bgColor !== "transparent" ? bgColor : undefined,
            stroke: borderWidth > 0 ? borderColor : undefined,
            strokeWidth: borderWidth,
            rx: borderRad,
            ry: borderRad,
            selectable: true,
          });
          fabricCanvas.add(rect);
        }
        
        // Render text content if any (only direct text, not from child elements)
        let text = "";
        // Get only direct text nodes, not from children
        const textNodes: string[] = [];
        for (let i = 0; i < divEl.childNodes.length; i++) {
          const node = divEl.childNodes[i];
          if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
            textNodes.push(node.textContent.trim());
          }
        }
        text = textNodes.join(" ").trim();
        
        // Only render text if div doesn't contain images or complex children
        const hasComplexChildren = divEl.querySelector("img, svg, div[style*='position']");
        if (text && text.length > 0 && !hasComplexChildren) {
          const fontSize = parseInt(inlineStyle.fontSize || style.fontSize || "16", 10);
          const color = inlineStyle.color || style.color || "#000";
          const fontFamily = inlineStyle.fontFamily || style.fontFamily || "Arial";
          const fontWeight = inlineStyle.fontWeight || style.fontWeight || "normal";
          const textAlign = inlineStyle.textAlign || style.textAlign || "left";
          
          let textLeft = pos.left;
          let textTop = pos.top;
          
          // Handle transform: translateX(-50%) for centering
          if (inlineStyle.transform && inlineStyle.transform.includes("translateX(-50%)")) {
            const textWidth = pos.width || 300;
            textLeft = (canvasWidth / 2) - (textWidth / 2);
          }
          
          // Adjust for padding
          textLeft += padding;
          textTop += padding;
          
          const textbox = new fabric.Textbox(text, {
            left: textLeft,
            top: textTop,
            fontSize: fontSize,
            fill: color,
            fontFamily: fontFamily,
            fontWeight: fontWeight,
            textAlign: textAlign as any,
            width: (pos.width || parseInt(inlineStyle.width || style.width || "300", 10)) - (padding * 2),
            selectable: true,
          });
          fabricCanvas.add(textbox);
        }
      }
      } else if (type === "p" || type === "span") {
        // 7. Render <p> and <span> tags as fabric.Textbox
        const pEl = element;
        const pos = getAbsolutePosition(pEl);
        const style = window.getComputedStyle(pEl);
        
        const fontSize = parseInt(pEl.style.fontSize || style.fontSize || "16", 10);
        const color = pEl.style.color || style.color || "#000";
        const text = pEl.textContent || "";
        
        const opts: any = {
          left: pos.left,
          top: pos.top,
          fontSize: fontSize,
          fill: color,
          width: parseInt(pEl.style.width || style.width || "300", 10),
          textAlign: (pEl.style.textAlign || style.textAlign || "left") as any,
          lineHeight: parseFloat(pEl.style.lineHeight || style.lineHeight || "1.3"),
        };
        
        if (pEl.style.fontFamily || style.fontFamily) {
          opts.fontFamily = pEl.style.fontFamily || style.fontFamily;
        }
        
        if (pEl.style.fontWeight || style.fontWeight) {
          opts.fontWeight = pEl.style.fontWeight || style.fontWeight;
        }
        
        if (text.trim()) {
          const textbox = new fabric.Textbox(text, opts);
          fabricCanvas.add(textbox);
        }
      } else if (type === "img") {
        // 8. Render <img> tags as fabric.Image
        const imgEl = element as HTMLImageElement;
      const img = imgEl as HTMLImageElement;
      const src = img.getAttribute("src");
      if (!src) return;

      const style = window.getComputedStyle(img);
      const inlineStyle = img.style;
      
      // Get parent container for percentage calculations
      const parent = img.parentElement as HTMLElement;
      const parentPos = parent ? getAbsolutePosition(parent, mainContainer as HTMLElement) : { left: 0, top: 0, width: canvasWidth, height: canvasHeight };
      const parentWidth = parentPos.width || canvasWidth;
      const parentHeight = parentPos.height || canvasHeight;
      
      // Calculate position
      let left = parentPos.left || 0;
      let top = parentPos.top || 0;
      
      // Handle percentage-based positioning within parent
      const leftValue = inlineStyle.left || style.left;
      const topValue = inlineStyle.top || style.top;
      
      if (leftValue) {
        if (leftValue.includes("%")) {
          left += (parseFloat(leftValue) / 100) * parentWidth;
        } else {
          left += parseFloat(leftValue) || 0;
        }
      }
      
      if (topValue) {
        if (topValue.includes("%")) {
          top += (parseFloat(topValue) / 100) * parentHeight;
        } else {
          top += parseFloat(topValue) || 0;
        }
      }
      
      const width = parseInt(inlineStyle.width || style.width || "100", 10);
      const height = parseInt(inlineStyle.height || style.height || "100", 10);

      const htmlImg = new Image();
      htmlImg.crossOrigin = "Anonymous";
      htmlImg.onload = () => {
        const originalWidth = htmlImg.width;
        const originalHeight = htmlImg.height;
        
        const fabricImg = new fabric.Image(htmlImg, {
          left: left,
          top: top,
          selectable: true,
        });
        
        // ⭐ FIX #4: Resize to desired dimensions and lock scaling
        const scaleX = width / originalWidth;
        const scaleY = height / originalHeight;
        fabricImg.scaleX = scaleX;
        fabricImg.scaleY = scaleY;
        
        // Lock image dimensions to prevent auto-resizing
        fabricImg.set({
          lockScalingX: true,
          lockScalingY: true,
        });

        fabricCanvas.add(fabricImg);
        fabricCanvas.renderAll();
      };
        htmlImg.onerror = () => {
          console.warn(`Failed to load image: ${src}`);
        };
        htmlImg.src = src;
      } else if (type === "svg") {
        // 9. Render SVG elements
        const svgEl = element.querySelector("svg") as SVGElement | null;
        if (!svgEl) return;
        
        // Handle inline SVG
        if (svgEl.tagName.toLowerCase() === "svg") {
        const svg = svgEl as SVGElement;
        const svgParent = svgEl.parentElement as HTMLElement;
        const pos = svgParent ? getAbsolutePosition(svgParent) : { left: 0, top: 0 };
        const svgString = new XMLSerializer().serializeToString(svg);
        
        // Load SVG using fabric
        fabric.loadSVGFromString(svgString).then((result) => {
          const svgObj = fabric.util.groupSVGElements(result.objects, result.options);
          (svgObj as fabric.Object).set({
            left: pos.left,
            top: pos.top,
            selectable: true,
          });
          fabricCanvas.add(svgObj as fabric.Object);
          fabricCanvas.renderAll();
        }).catch(err => {
          console.error("Error loading SVG:", err);
        });
        }
      }
    });

    // 10. Render tables (tables don't typically use z-index, so render them separately)
    const tables = container.querySelectorAll("table");
    tables.forEach((table) => {
      const tableEl = table as HTMLElement;
      const pos = getAbsolutePosition(tableEl);
      const rows = table.querySelectorAll("tr");

      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll("th, td");
        cells.forEach((cell, colIndex) => {
          const cellEl = cell as HTMLElement;
          const text = cellEl.textContent?.trim() || "";
          const isHeader = cellEl.tagName.toLowerCase() === "th";

          const cellWidth = 100;
          const cellHeight = 30;
          const x = pos.left + colIndex * cellWidth;
          const y = pos.top + rowIndex * cellHeight;

          const rect = new fabric.Rect({
            left: x,
            top: y,
            width: cellWidth,
            height: cellHeight,
            fill: isHeader ? "#f0f0f0" : "#ffffff",
            stroke: "#000000",
            strokeWidth: 1,
          });

          const textObj = new fabric.Textbox(text, {
            left: x + 5,
            top: y + 5,
            width: cellWidth - 10,
            height: cellHeight - 10,
            fontSize: 10,
            fill: "#000000",
            fontWeight: isHeader ? "bold" : "normal",
          });

          fabricCanvas.add(rect);
          fabricCanvas.add(textObj);
        });
      });
    });

      // Wait a bit for all images to load, then clean up
      setTimeout(() => {
        try {
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        } catch (e) {
          console.warn("Error cleaning up container:", e);
        }
        // ⭐ Final render after all content is added
        fabricCanvas.renderAll();
      }, 100);
    };

    // Start the process: apply background first, then parse content
    applyBackground();
  }
  const groupDynamicMemberRows = (
    keys: Key[],
    values: { [key: string]: string }
  ) => {
    const rows: any[] = [];
    const rowMap: { [index: string]: any } = {};
    keys.forEach(({ param }) => {
      const match = param.match(/^member_(\d+)_(.+)$/);
      if (match) {
        const [_, index, field] = match;
        if (!rowMap[index]) rowMap[index] = {};
        rowMap[index][field] = values[param] || "";
      }
    });
    Object.keys(rowMap)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((i) => {
        rows.push(rowMap[i]);
      });
    return rows;
  };
  const addMobileAndReferralToQR = () => {
    if (!mobileNumber.trim() && !referral.trim()) {
      return alert("Please enter at least mobile number or referral");
    }

    // Only update HTML input to replace placeholder values in existing QR code img tags
    // Do NOT add new QR codes to canvas - only update existing ones in HTML
    let updatedHtml = htmlInput;
    
    // Update mobile number QR code - replace placeholder "mobileNumber" with actual value
    if (mobileNumber.trim()) {
      const encodedMobile = encodeURIComponent(mobileNumber.trim());
      
      // Pattern to find img tags with data=mobileNumber (case insensitive)
      // Preserves the entire img tag structure including style attributes
      updatedHtml = updatedHtml.replace(
        /(<img[^>]*src="https:\/\/api\.qrserver\.com\/v1\/create-qr-code\/\?data=)mobileNumber([^"]*)"([^>]*\/?>)/gi,
        `$1${encodedMobile}$2"$3`
      );
      
      // Also handle if the placeholder is in a different format (without quotes)
      updatedHtml = updatedHtml.replace(
        /data=mobileNumber/gi,
        `data=${encodedMobile}`
      );
    }
    
    // Update referral address QR code - replace placeholder "refferAddress" or "referral" with actual value
    if (referral.trim()) {
      const encodedReferral = encodeURIComponent(referral.trim());
      
      // Pattern to find img tags with data=refferAddress or data=referral (case insensitive)
      // Preserves the entire img tag structure including style attributes
      updatedHtml = updatedHtml.replace(
        /(<img[^>]*src="https:\/\/api\.qrserver\.com\/v1\/create-qr-code\/\?data=)(refferAddress|referral)([^"]*)"([^>]*\/?>)/gi,
        `$1${encodedReferral}$3"$4`
      );
      
      // Also handle if the placeholder is in a different format (without quotes)
      updatedHtml = updatedHtml.replace(
        /data=(refferAddress|referral)/gi,
        `data=${encodedReferral}`
      );
    }
    
    setHtmlInput(updatedHtml);
    
    // Re-render the canvas with updated HTML
    if (canvas) {
      parseHtmlToCanvas(updatedHtml, canvas);
    }
  };

  /**
   * Serializes all objects on a Fabric canvas into an HTML string
   * with absolute‐positioned <p> and <img> (and SVG) tags.
   */
  const extractCanvasToHtml = (canvas: fabric.Canvas) => {
    const width = canvas.getWidth();
    const height = canvas.getHeight();

    // Helper to escape HTML
    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // Serialize each object
    const parts = canvas.getObjects().map((obj: fabric.Object) => {
      const left = obj.left ?? 0;
      const top = obj.top ?? 0;

      // 1) TEXTBOXES → <p>
      if (obj.type === "textbox") {
        const t = obj as fabric.Textbox;
        const txt = escapeHtml(t.text || "");
        return `
<p style="
position:absolute;
left:${left}px;
top:${top}px;
font-size:${t.fontSize}px;
font-family:${t.fontFamily};
color:${t.fill};
text-align:${t.textAlign};
width:${t.width}px;
line-height:${t.lineHeight};
${t.charSpacing ? `letter-spacing:${t.charSpacing / 10}px;` : ""}
">
${txt}
</p>
`;
      }

      if (obj.type === "image") {
        const img = obj as unknown as fabric.Image;
        const src = img.getSrc() as string;
        const w = img.getScaledWidth();
        const h = img.getScaledHeight();
        return `
<img src="${src}" style="
position:absolute;
left:${left}px;
top:${top}px;
width:${w}px;
height:${h}px;
" alt="" />
`;
      }

      // 3) GROUPED SVGs → unwrap and inline
      if (obj.type === "group" && (obj as any).id) {
        const id = (obj as any).id as string;
        const svgEntry = svgElements.find((e) => e.id === id);
        if (!svgEntry) return "";
        // get bounding box
        const bounds = obj.getBoundingRect();
        // strip original <svg> dims and inject ours
        const updatedSvg = svgEntry.svg.replace(
          /<svg([^>]*)>/,
          `<svg$1 width="${bounds.width}" height="${bounds.height}">`
        );
        return `
<div style="
position:absolute;
left:${bounds.left}px;
top:${bounds.top}px;
width:${bounds.width}px;
height:${bounds.height}px;
">
${updatedSvg}
</div>
`;
      }

      return "";
    });

    // Build full page
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Certificate</title>
<style>
body { margin:0; padding:0; }
.certificate-container {
position: relative;
width: ${width}px;
height: ${height}px;
}
</style>
</head>
<body>
<div class="certificate-container">
${parts.join("")}
</div>
</body>
</html>`;

    return html;
  };

  const addFieldToCanvas = (param: string) => {
    if (!canvas) return;
    const textbox = new fabric.Textbox(`\${${param}}`, {
      left: 200,
      top: 200,
      fontSize: 28,
      fill: "#000000",
      width: 300,
      textAlign: "left",
    });
    canvas.add(textbox);
  };

  const addPlainTextToCanvas = () => {
    if (!canvas || !plainText.trim()) return;

    const text = new fabric.Textbox(plainText, {
      left: 200,
      top: 300,
      fontSize: 24,
      fill: "#000000",
      width: 300,
      textAlign: "left",
    });

    canvas.add(text);
    setPlainText("");
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#ffffff",
    });
    setCanvas(fabricCanvas);
    
    // Only load QR code if referral has a value, otherwise skip initial QR code
    if (referral.trim()) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      // Initial QR code with referral data
      img.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(referral.trim())}&size=100x100`;

      img.onload = () => {
        const fabricImage = new fabric.Image(img, {
          left: 100,
          top: 100,
          width: 100,
          height: 100,
          scaleX: 1,
          scaleY: 1,
          selectable: true,
        });

        setQrPosition({ left: fabricImage.left || 0, top: fabricImage.top || 0 });

        fabricImage.on("moving", () => {
          setQrPosition({
            left: fabricImage.left || 0,
            top: fabricImage.top || 0,
          });
        });

        fabricCanvas.add(fabricImage);
        fabricCanvas.renderAll();
        console.log("✅ QR Image loaded and added to canvas.");
      };

      img.onerror = () => {
        console.error("❌ Failed to load the QR image. URL:", img.src);
        // Don't show alert, just log the error
      };
    }

    const nameText = new fabric.Textbox("Reward Certificate", {
      left: 250,
      top: 100,
      fontFamily: "Georgia",
      fontSize: 32,
      fill: "#000000",
      width: 400,
      textAlign: "left",
    });
    const courseText = new fabric.Textbox("Government Of India", {
      left: 250,
      top: 150,
      fontFamily: "Arial",
      fontSize: 24,
      fill: "#444444",
      width: 250,
      textAlign: "left",
    });
    fabricCanvas.add(nameText, courseText);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === wrapperRef.current) {
          const { width, height } = entry.contentRect;
          fabricCanvas.setWidth(width);
          fabricCanvas.setHeight(height);
          fabricCanvas.renderAll();
        }
      }
    });

    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }
    fabricCanvas.renderAll();
    return () => {
      fabricCanvas.dispose();
      resizeObserver.disconnect();
    };
  }, []);

  const updateTextProps = (prop: string, value: any) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "textbox") {
      (activeObject as fabric.Textbox).set(prop, value);
      canvas.renderAll();
    }
  };

  const addTextToCanvas = () => {
    if (!canvas || !newText.trim()) return;
    const param = newText.replace(/[^\w]/g, "");
    const dynamicField = `\${${param}}`;
    const text = new fabric.Textbox(dynamicField, {
      left: 200,
      top: 200,
      fontSize: 28,
      fill: "#000000",
      width: 300,
      textAlign: "left",
      customType: "dynamic",
    });
    canvas.add(text);
    setNewText("");
  };

  const printCertificateInConsole = () => {
    if (!canvas) return;

    const width = canvas.getWidth();
    const height = canvas.getHeight();

    const htmlElements = canvas.getObjects().map((obj: fabric.Object) => {
      if (obj.type === "textbox") {
        const t = obj as fabric.Textbox;
        return `<p style="position:absolute; left:${t.left}px; top:${
          t.top
        }px; font-size:${t.fontSize}px; font-family:${t.fontFamily}; color:${
          t.fill
        }; text-align:${t.textAlign}; width:${t.width}px; line-height:${
          t.lineHeight
        }; letter-spacing:${(t.charSpacing || 0) / 10}px;">${t.text}</p>`;
      }
      return "";
    });

    const svgDivs = canvas
      .getObjects()
      .filter(
        (obj: any) => obj.id?.startsWith("svg-") && obj.data !== "watermark"
      )
      .map((svgObj: any) => {
        const match = svgElements.find((e) => e.id === svgObj.id);
        if (!match) return "";

        const bounds = svgObj.getBoundingRect();
        const width = bounds.width;
        const height = bounds.height;

        const updatedSvg = match.svg.replace(
          /<svg([^>]*)>/,
          `<svg$1 width="${width}" height="${height}">`
        );

        return `<div style="position:absolute; left:${svgObj.left}px; top:${svgObj.top}px;">${updatedSvg}</div>`;
      });

    const backgroundSvgObj = canvas
      .getObjects()
      .find((obj: any) => obj.data === "watermark");
    let backgroundSvgHTML = "";

    if (backgroundSvgObj) {
      const match = svgElements.find((e) => e.id === backgroundSvgObj.id);
      if (match) {
        const bounds = backgroundSvgObj.getBoundingRect();
        const width = bounds.width;
        const height = bounds.height;
        const opacity = backgroundSvgObj.opacity ?? 1;

        const updatedSvg = match.svg.replace(
          /<svg([^>]*)>/,
          `<svg$1 width="${width}" height="${height}" opacity="${opacity}">`
        );

        backgroundSvgHTML = `<div style="position:absolute; left:${backgroundSvgObj.left}px; top:${backgroundSvgObj.top}px;">${updatedSvg}</div>`;
      }
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Certificate</title>
<style>
body {
background: #fff;
padding: 40px;
}
.certificate-container {
position: relative;
background: white;
width: ${width}px;
height: ${height}px;
margin: auto;
border: 2px solid #c1272c;
box-shadow: 0 0 12px rgba(0,0,0,0.15);
}
</style>
</head>
<body>
<div class="certificate-container">
${backgroundSvgHTML}
${htmlElements.join("\n")}
${svgDivs.join("\n")}
</div>
</body>
</html>
`;

    console.log("Generated Certificate HTML:\n", htmlContent);
  };

  const onSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    const sanitizeSvgDimensions = (svgText: string): string => {
      return svgText
        .replace(/<svg([^>]*)\swidth="[^"]+"([^>]*)>/, "<svg$1$2>")
        .replace(/<svg([^>]*)\sheight="[^"]+"([^>]*)>/, "<svg$1$2>");
    };

    reader.onload = async (event) => {
      let rawSvgText = event.target?.result as string;
      let svgText = sanitizeSvgDimensions(rawSvgText);

      try {
        const { objects, options } = await fabric.loadSVGFromString(svgText);
        const validObjects = objects.filter(
          (obj: any): obj is fabric.Object => obj !== null
        );
        const svg = fabric.util.groupSVGElements(validObjects, options);

        const uniqueId = `svg-${Date.now()}`;
        (svg as fabric.Object).set({
          id: uniqueId,
          left: 400,
          top: 300,
          scaleX: 0.5,
          scaleY: 0.5,
        });

        canvas.add(svg as fabric.Object);
        canvas.renderAll();

        setSvgElements((prev) => [...prev, { id: uniqueId, svg: svgText }]);
      } catch (err) {
        console.error("Failed to load SVG:", err);
        alert("Error loading SVG. Check if the file is valid.");
      }
    };

    reader.readAsText(file);
  };

  const onSvgUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    const sanitizeSvgDimensions = (svgText: string): string => {
      return svgText
        .replace(/<svg([^>]*)\swidth="[^"]+"([^>]*)>/, "<svg$1$2>")
        .replace(/<svg([^>]*)\sheight="[^"]+"([^>]*)>/, "<svg$1$2>");
    };
    reader.onload = async (event) => {
      let rawSvgText = event.target?.result as string;
      let svgText = sanitizeSvgDimensions(rawSvgText);

      try {
        const { objects, options } = await fabric.loadSVGFromString(svgText);
        const validObjects = objects.filter(
          (obj: any): obj is fabric.Object => obj !== null
        );
        const svg = fabric.util.groupSVGElements(validObjects, options);

        const uniqueId = `svg-${Date.now()}`;
        (svg as fabric.Object).set({
          id: uniqueId,
          left: 100,
          top: 100,
          scaleX: 0.5,
          scaleY: 0.5,
          opacity: svgOpacity,
          originX: "left",
          originY: "top",
          data: "watermark",
        });

        (svg as fabric.Object).setCoords();

        canvas.add(svg as fabric.Object);

        canvas.renderAll();

        setUploadedSvgObj(svg as fabric.Object);
        setSvgElements((prev) => [...prev, { id: uniqueId, svg: svgText }]);
      } catch (err) {
        console.error("Failed to load SVG:", err);
        alert("Error loading SVG. Check if the file is valid.");
      }
    };

    reader.readAsText(file);
  };

  const onSvgOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSvgOpacity(value);

    if (uploadedSvgObj) {
      uploadedSvgObj.set({ opacity: value });
      canvas?.renderAll();
    }
  };

  const downloadCertificate = () => {
    if (!canvas) {
      alert("No certificate to download. Please create a certificate first.");
      return;
    }
    
    try {
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2, // Higher quality
      });
      const link = document.createElement("a");
      link.href = dataURL;
      const filename = `${title.replace(/\s+/g, "_")}_certificate.png`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("✅ Certificate downloaded successfully");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate. Please try again.");
    }
  };

  const saveCertificateToStorage = (htmlContent: string, certificateName: string) => {
    // Save to localStorage for easy retrieval in UI
    const storageKey = `certificate_${certificateName.replace(/\s+/g, "_")}`;
    localStorage.setItem(storageKey, htmlContent);
    
    // Also save a list of all certificates
    const certificatesList = JSON.parse(localStorage.getItem("certificates_list") || "[]");
    if (!certificatesList.includes(certificateName)) {
      certificatesList.push(certificateName);
      localStorage.setItem("certificates_list", JSON.stringify(certificatesList));
    }
    
    console.log(`Certificate saved to localStorage with key: ${storageKey}`);
  };

  const saveHtmlFileToServer = async (htmlContent: string, filename: string = "certificate.html"): Promise<boolean> => {
    // Ensure the content is a complete HTML document
    let completeHtml = htmlContent.trim();
    
    // Check if it already has DOCTYPE and html tags
    if (!completeHtml.includes("<!DOCTYPE") && !completeHtml.includes("<html")) {
      // If it's just body content, wrap it in a complete HTML structure
      completeHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Certificate</title>
</head>
<body>
${completeHtml}
</body>
</html>`;
    } else if (!completeHtml.includes("<!DOCTYPE")) {
      // If it has <html> but no DOCTYPE, add it
      completeHtml = `<!DOCTYPE html>\n${completeHtml}`;
    }

    try {
      const response = await fetch('/api/save-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: filename,
          content: completeHtml,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`Certificate saved successfully: ${result.filename}`);
        console.log(`Accessible at: ${result.path}`);
        // Show success message
        alert(`Certificate saved successfully!\nFile: ${result.filename}\nLocation: public/certificates/`);
        return true;
      } else {
        console.error('Failed to save certificate:', result.error);
        alert(`Failed to save certificate: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('Error saving certificate to server:', error);
      alert('Error saving certificate. Please check the console for details.');
      return false;
    }
  };

  const submitToCertificateAPI = async () => {
    if (!canvas) return;

    // Save the HTML file to the certificates folder
    if (htmlInput.trim()) {
      const filename = `${title.replace(/\s+/g, "_")}_certificate.html`;
      // Save to localStorage for UI access
      saveCertificateToStorage(htmlInput, title);
      // Save to server (public/certificates folder)
      const saved = await saveHtmlFileToServer(htmlInput, filename);
      if (saved) {
        handleCertificateSaved();
      }
    }

    const width = canvas.getWidth();
    const height = canvas.getHeight();

    const htmlElements = canvas.getObjects().map((obj: fabric.Object) => {
      if (obj.type === "textbox") {
        const t = obj as fabric.Textbox;
        const isDynamic = /^\$\{[\w]+\}$/.test(t.text || "");
        return `<p style="position:absolute; left:${t.left}px; top:${
          t.top
        }px; font-size:${t.fontSize}px; font-family:${t.fontFamily}; color:${
          t.fill
        }; text-align:${t.textAlign}; width:${t.width}px; line-height:${
          t.lineHeight
        }; letter-spacing:${(t.charSpacing || 0) / 10}px;">${
          isDynamic ? t.text : t.text
        }</p>`;
      }
      return "";
    });

    const svgDivs = canvas
      .getObjects()
      .filter(
        (obj: any) => obj.id?.startsWith("svg-") && obj.data !== "watermark"
      )
      .map((svgObj: any) => {
        const match = svgElements.find((e) => e.id === svgObj.id);
        if (!match) return "";
        const bounds = svgObj.getBoundingRect();
        const updatedSvg = match.svg.replace(
          /<svg([^>]*)>/,
          `<svg$1 width="${bounds.width}" height="${bounds.height}">`
        );
        return `<div style="position:absolute; left:${svgObj.left}px; top:${svgObj.top}px;">${updatedSvg}</div>`;
      });

    const backgroundSvgObj = canvas
      .getObjects()
      .find((obj: any) => obj.data === "watermark");
    let backgroundSvgHTML = "";

    if (backgroundSvgObj) {
      const match = svgElements.find((e) => e.id === backgroundSvgObj.id);
      if (match) {
        const bounds = backgroundSvgObj.getBoundingRect();
        const width = bounds.width;
        const height = bounds.height;
        const left = backgroundSvgObj.left ?? 0;
        const top = backgroundSvgObj.top ?? 0;
        const opacity = backgroundSvgObj.opacity ?? 1;

        const updatedSvg = match.svg.replace(
          /<svg([^>]*)>/,
          `<svg$1 style="position:absolute; left:${left}px; top:${top}px;" width="${width}" height="${height}" opacity="${opacity}">`
        );

        backgroundSvgHTML = updatedSvg;
      }
    }

    let qrImageHTML = "";
    const qrObj = canvas
      .getObjects()
      .find(
        (obj: fabric.Object) =>
          obj.type === "image" &&
          (obj as unknown as fabric.Image).getSrc().includes("api.qrserver.com")
      );

    if (qrObj && qrObj.type === "image") {
      const image = qrObj as unknown as fabric.Image;
      const src = image.getSrc();
      const left = image.left || 0;
      const top = image.top || 0;
      const width = image.getScaledWidth();
      const height = image.getScaledHeight();

      qrImageHTML = `<img src="${src}" style="position:absolute; left:${left}px; top:${top}px; width:${width}px; height:${height}px;" />`;
    }

    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Reward Certificate</title>
<style>
body {
background: #fff;
padding: 40px;
}
.certificate-container {
position: relative;
background: white;
width: ${width}px;
height: ${height}px;
margin: auto;
border: 2px solid #c1272c;
box-shadow: 0 0 12px rgba(0,0,0,0.15);
}
</style>
</head>
<body>
<div class="certificate-container">
${backgroundSvgHTML}
${qrImageHTML}
${htmlElements.join("\n")}
${svgDivs.join("\n")}
</div>
</body>
</html>
`;

    const fullHtml = extractCanvasToHtml(canvas);
    const payload = {
      name: title,
      mobileNumber: mobileNumber.trim() || "",
      referral: referral.trim() || "",
      code: htmlInput,
    };
    console.log("Payload ===>>>", payload);

    try {
      const response = await fetch(`${apiIp}certificate/addCertificate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("payload ===>>>", payload);

      const data = await response.json();
      console.log("data ===>>>", data);
      if (response.ok) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          router.push("/templates");
        }, 3000);
      } else {
        alert(`Failed to add certificate: ${data.message}`);
      }
    } catch (error) {
      console.error("API error:", error);
      alert("Network or server error occurred");
    }
  };

  const handleDynamicFieldData = (fieldName: string, data: string) => {
    updateDynamicFieldData(fieldName, data);
  };

  const updateDynamicFieldData = (fieldName: string, data: string) => {
    setDynamicFieldData((prevData) => ({
      ...prevData,
      [fieldName]: data,
    }));

    if (canvas) {
      canvas.getObjects().forEach((obj: fabric.Object) => {
        if (
          obj.type === "textbox" &&
          obj instanceof fabric.Textbox &&
          obj.get("data-placeholder") === fieldName
        ) {
          obj.set({ text: data || `\${${fieldName}}` });
          canvas.renderAll();
        }
      });
    }
  };

  const fetchCertificates = async () => {
    setLoadingCertificates(true);
    try {
      const response = await fetch('/api/list-certificates');
      const result = await response.json();
      
      if (result.success) {
        setCertificates(result.certificates);
      } else {
        console.error('Failed to fetch certificates:', result.error);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoadingCertificates(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleCertificateSaved = () => {
    // Refresh the certificates list after saving
    fetchCertificates();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerSection}>
        <h2 style={styles.heading}>🎨 Certificate Editor</h2>
        <button 
          onClick={() => {
            setShowCertificates(!showCertificates);
            if (!showCertificates) {
              fetchCertificates();
            }
          }}
          style={styles.toggleButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#6bb8fc';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#7fc9fd';
          }}
        >
          {showCertificates ? 'Hide Certificates' : 'Show All Certificates'}
        </button>
      </div>

      {showCertificates && (
        <div style={styles.certificatesSection}>
          <h3 style={styles.sectionTitle}>Saved Certificates</h3>
          {loadingCertificates ? (
            <div style={styles.loading}>Loading certificates...</div>
          ) : certificates.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No certificates found. Create one using the editor below!</p>
            </div>
          ) : (
            <div style={styles.certificatesGrid}>
              {certificates.map((cert, index) => (
                <div 
                  key={index} 
                  style={styles.certificateCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <div style={styles.cardHeader}>
                    <h4 style={styles.cardTitle}>{cert.filename.replace('_certificate.html', '').replace(/_/g, ' ')}</h4>
                  </div>
                  <div style={styles.cardBody}>
                    <div style={styles.cardInfo}>
                      <span style={styles.infoLabel}>File:</span>
                      <span style={styles.infoValue}>{cert.filename}</span>
                    </div>
                    <div style={styles.cardInfo}>
                      <span style={styles.infoLabel}>Size:</span>
                      <span style={styles.infoValue}>{formatFileSize(cert.size)}</span>
                    </div>
                    <div style={styles.cardInfo}>
                      <span style={styles.infoLabel}>Modified:</span>
                      <span style={styles.infoValue}>{formatDate(cert.modified)}</span>
                    </div>
                  </div>
                  <div style={styles.cardActions}>
                    <button
                      onClick={() => window.open(cert.path, '_blank')}
                      style={styles.viewButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#45a049';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#4CAF50';
                      }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        fetch(cert.path)
                          .then(res => res.text())
                          .then(html => {
                            setHtmlInput(html);
                            if (canvas) {
                              parseHtmlToCanvas(html, canvas);
                            }
                            setShowCertificates(false);
                          })
                          .catch(err => {
                            console.error('Error loading certificate:', err);
                            alert('Failed to load certificate');
                          });
                      }}
                      style={styles.loadButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0b7dda';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#2196F3';
                      }}
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={styles.toolbar}>
        <label style={styles.label}>
          Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Font:
          <select
            onChange={(e) => updateTextProps("fontFamily", e.target.value)}
            style={styles.select}
          >
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
          </select>
        </label>

        <label style={styles.label}>
          Size:
          <input
            type="number"
            onChange={(e) =>
              updateTextProps("fontSize", parseInt(e.target.value))
            }
            defaultValue={32}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Color:
          <input
            type="color"
            onChange={(e) => updateTextProps("fill", e.target.value)}
            defaultValue="#000000"
            style={{ ...styles.input, padding: 0 }}
          />
        </label>

        <label style={styles.label}>
          Align:
          <select
            onChange={(e) => updateTextProps("textAlign", e.target.value)}
            style={styles.select}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </label>

        <label style={styles.label}>
          Line Height:
          <input
            type="number"
            step="0.1"
            onChange={(e) =>
              updateTextProps("lineHeight", parseFloat(e.target.value))
            }
            defaultValue={1.3}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Letter Spacing:
          <input
            type="number"
            onChange={(e) =>
              updateTextProps("charSpacing", parseInt(e.target.value))
            }
            defaultValue={0}
            style={styles.input}
          />
        </label>

        <div style={styles.addTextRow}>
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter field name"
            style={styles.input}
          />
          <button onClick={addTextToCanvas} style={styles.button}>
            Add Field
          </button>
        </div>

        <div style={styles.qrSection}>
          <h4 style={styles.sectionSubtitle}>QR Code Parameters</h4>
          <label style={styles.label}>
            Referral Code (First QR):
            <input
              type="text"
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
              placeholder="Enter referral code"
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            Mobile Number (Second QR):
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter mobile number"
              style={styles.input}
            />
          </label>
          <button onClick={addMobileAndReferralToQR} style={styles.button}>
            Add QR Codes
          </button>
        </div>

        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <input
            type="text"
            value={plainText}
            onChange={(e) => setPlainText(e.target.value)}
            placeholder="Enter plain text"
            style={styles.input}
          />
          <button onClick={addPlainTextToCanvas} style={styles.button}>
            Add Text
          </button>
        </div>

        <label style={styles.label}>
          SVG:
          <input type="file" accept=".svg" onChange={onSvgUpload} />
        </label>

        <label style={styles.label}>
          Image:
          <input type="file" accept="image/*" onChange={onSvgUploaded} />
        </label>

        <label style={styles.label}>
          SVG Opacity:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={svgOpacity}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              setSvgOpacity(value);

              if (uploadedSvgObj) {
                uploadedSvgObj.set({ opacity: value });
                canvas?.renderAll();
              }
            }}
            style={{ width: "100px" }}
          />
        </label>

        <button onClick={downloadCertificate} style={styles.button}>
          Download Certificate
        </button>

        <button onClick={submitToCertificateAPI} style={styles.button}>
          Submit Template
        </button>
      </div>

      <div ref={wrapperRef} style={styles.canvasWrapper}>
        <canvas ref={canvasRef} style={styles.canvas} />
      </div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexDirection: "column",
          width: "70%",
          marginTop: "20px",
        }}
      >
        <textarea
          value={htmlInput}
          onChange={(e) => setHtmlInput(e.target.value)}
          rows={6}
          placeholder="Paste HTML here"
          style={{ width: "100%", fontFamily: "monospace", padding: "10px" }}
        />

        <button
          onClick={() => canvas && parseHtmlToCanvas(htmlInput, canvas)}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(90deg, #7fc9fd 0%, #7a1dd9 100%)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Render HTML to Canvas
        </button>

        <button
          onClick={() => {
            if (!canvas) return;
            const extractedHtml = extractCanvasToHtml(canvas);
            setHtmlInput(extractedHtml);
          }}
          style={{
            padding: "10px 20px",
            background: "#444",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Export Canvas to HTML
        </button>
      </div>
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "40px 40px",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              textAlign: "center",
              fontSize: "16px",
              width: "200px",
              color: "#000",
            }}
          >
            Template send to super admin for approval.
          </div>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    padding: "20px",
    fontFamily: "sans-serif",
    background: "#d1eafd",
    minHeight: "100vh",
    position: "sticky",
    zIndex: 100
  },
  headerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "15px",
  },
  heading: {
    fontSize: "1.8rem",
    margin: 0,
  },
  toggleButton: {
    padding: "10px 20px",
    background: "#7fc9fd",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background 0.2s ease",
  },
  certificatesSection: {
    marginBottom: "30px",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    marginBottom: "20px",
    color: "#333",
  },
  certificatesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  certificateCard: {
    background: "#f8f9fa",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    padding: "15px",
    transition: "transform 0.2s, box-shadow 0.2s",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  },
  cardHeader: {
    marginBottom: "12px",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#333",
    margin: 0,
    textTransform: "capitalize",
  },
  cardBody: {
    flex: 1,
    marginBottom: "15px",
  },
  cardInfo: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "13px",
  },
  infoLabel: {
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    color: "#333",
  },
  cardActions: {
    display: "flex",
    gap: "10px",
  },
  viewButton: {
    flex: 1,
    padding: "8px 16px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "background 0.2s",
  },
  loadButton: {
    flex: 1,
    padding: "8px 16px",
    background: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "background 0.2s",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    color: "#666",
    fontSize: "16px",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#999",
    fontSize: "14px",
  },
  qrSection: {
    marginTop: "20px",
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
  sectionSubtitle: {
    fontSize: "1rem",
    marginBottom: "15px",
    color: "#333",
    fontWeight: "600",
  },
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "20px",
    alignItems: "flex-start",
    flexDirection: "column",
    position: "absolute",
    right: "13px",
    background: "#fff",
    width: "22%",
    padding: "20px",
    borderRadius: "10px",
  },
  label: {
    display: "flex",
    fontSize: "0.9rem",
    gap: "5px",
  },
  input: {
    padding: "4px 6px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    minWidth: "80px",
  },
  select: {
    padding: "4px 6px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },

  addTextRow: {
    gap: "5px",
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr auto",
  },

  button: {
    padding: "6px 10px",
    background: "linear-gradient(90deg, #7fc9fd 0%, #7a1dd9 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background 0.2s ease-in-out",
  },
  canvasWrapper: {
    border: "2px dashed #fff",
    // background: "#fff"
    overflow: "auto",
    resize: "both",
    width: "70%",
    height: "700px",
  },
  canvas: {
    display: "block",
    width: "100%",
    height: "100%",
  },
};

export default EditTemplatePage;
