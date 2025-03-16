"use client";

import { useState, useEffect } from "react";
import { Copy, Save, Trash2, History, Palette, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
  hsv: { h: number; s: number; v: number };
  name?: string;
}

interface SavedColor {
  id: string;
  color: Color;
  name: string;
  date: string;
}

interface SavedPalette {
  id: string;
  name: string;
  colors: Color[];
  date: string;
}

interface ContrastResult {
  ratio: number;
  AA: boolean;
  AALarge: boolean;
  AAA: boolean;
  AAALarge: boolean;
}

// CSS Color Names
const cssColorNames: { [key: string]: string } = {
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgreen: "#006400",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  gold: "#ffd700",
  goldenrod: "#daa520",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavender: "#e6e6fa",
  lavenderblush: "#fff0f5",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2",
  lightgray: "#d3d3d3",
  lightgreen: "#90ee90",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#db7093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  rebeccapurple: "#663399",
  red: "#ff0000",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32",
};

// Helper functions for color conversion
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Handle shorthand hex
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const r = Number.parseInt(hex.substring(0, 2), 16);
  const g = Number.parseInt(hex.substring(2, 4), 16);
  const b = Number.parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    "#" +
    ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()
  );
};

const rgbToHsl = (
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const hslToRgb = (
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

const rgbToCmyk = (
  r: number,
  g: number,
  b: number
): { c: number; m: number; y: number; k: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const k = 1 - Math.max(r, g, b);
  const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
  const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
  const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
};

const cmykToRgb = (
  c: number,
  m: number,
  y: number,
  k: number
): { r: number; g: number; b: number } => {
  c /= 100;
  m /= 100;
  y /= 100;
  k /= 100;

  const r = Math.round(255 * (1 - c) * (1 - k));
  const g = Math.round(255 * (1 - m) * (1 - k));
  const b = Math.round(255 * (1 - y) * (1 - k));

  return { r, g, b };
};

const rgbToHsv = (
  r: number,
  g: number,
  b: number
): { h: number; s: number; v: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
};

const hsvToRgb = (
  h: number,
  s: number,
  v: number
): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  v /= 100;

  let r, g, b;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      r = 0;
      g = 0;
      b = 0;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

const getColorName = (hex: string): string | undefined => {
  const normalizedHex = hex.toLowerCase();
  for (const [name, value] of Object.entries(cssColorNames)) {
    if (value === normalizedHex) {
      return name;
    }
  }
  return undefined;
};

const calculateContrastRatio = (
  color1: string,
  color2: string
): ContrastResult => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  // Calculate luminance for the first color
  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const luminance1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const luminance2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const ratio =
    luminance1 > luminance2
      ? (luminance1 + 0.05) / (luminance2 + 0.05)
      : (luminance2 + 0.05) / (luminance1 + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    AA: ratio >= 4.5,
    AALarge: ratio >= 3,
    AAA: ratio >= 7,
    AAALarge: ratio >= 4.5,
  };
};

// Generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Generate complementary color
const getComplementaryColor = (color: Color): Color => {
  const hsl = { ...color.hsl };
  hsl.h = (hsl.h + 180) % 360;
  const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const name = getColorName(hex);

  return { hex, rgb, hsl, cmyk, hsv, name };
};

// Generate analogous colors
const getAnalogousColors = (color: Color): Color[] => {
  const colors: Color[] = [];
  const hsl = { ...color.hsl };

  // Add colors 30 degrees apart
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue; // Skip the original color
    const newHsl = { ...hsl };
    newHsl.h = (hsl.h + i * 30 + 360) % 360;
    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const name = getColorName(hex);

    colors.push({ hex, rgb, hsl: newHsl, cmyk, hsv, name });
  }

  return colors;
};

// Generate triadic colors
const getTriadicColors = (color: Color): Color[] => {
  const colors: Color[] = [];
  const hsl = { ...color.hsl };

  // Add colors 120 degrees apart
  for (let i = 1; i <= 2; i++) {
    const newHsl = { ...hsl };
    newHsl.h = (hsl.h + i * 120) % 360;
    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const name = getColorName(hex);

    colors.push({ hex, rgb, hsl: newHsl, cmyk, hsv, name });
  }

  return colors;
};

// Generate tetradic colors
const getTetradicColors = (color: Color): Color[] => {
  const colors: Color[] = [];
  const hsl = { ...color.hsl };

  // Add colors in a rectangle on the color wheel
  for (let i = 1; i <= 3; i++) {
    const newHsl = { ...hsl };
    if (i === 1 || i === 3) {
      newHsl.h = (hsl.h + 180) % 360;
    }
    if (i === 2 || i === 3) {
      newHsl.h = (newHsl.h + 60) % 360;
    }
    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const name = getColorName(hex);

    colors.push({ hex, rgb, hsl: newHsl, cmyk, hsv, name });
  }

  return colors;
};

// Generate monochromatic colors
const getMonochromaticColors = (color: Color): Color[] => {
  const colors: Color[] = [];
  const hsl = { ...color.hsl };

  // Generate 5 colors with different lightness
  for (let i = 1; i <= 4; i++) {
    const newHsl = { ...hsl };
    newHsl.l = Math.max(0, Math.min(100, hsl.l + (i - 2) * 15));
    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const name = getColorName(hex);

    colors.push({ hex, rgb, hsl: newHsl, cmyk, hsv, name });
  }

  return colors;
};

export default function ColorFormatConverter() {
  // State for current color
  const [currentColor, setCurrentColor] = useState<Color>({
    hex: "#4A90E2",
    rgb: { r: 74, g: 144, b: 226 },
    hsl: { h: 210, s: 70, l: 59 },
    cmyk: { c: 67, m: 36, y: 0, k: 11 },
    hsv: { h: 210, s: 67, v: 89 },
    name: "cornflowerblue",
  });

  // State for color inputs
  const [hexInput, setHexInput] = useState<string>(currentColor.hex);
  const [rgbInput, setRgbInput] = useState<{ r: number; g: number; b: number }>(
    currentColor.rgb
  );
  const [hslInput, setHslInput] = useState<{ h: number; s: number; l: number }>(
    currentColor.hsl
  );
  const [cmykInput, setCmykInput] = useState<{
    c: number;
    m: number;
    y: number;
    k: number;
  }>(currentColor.cmyk);
  const [hsvInput, setHsvInput] = useState<{ h: number; s: number; v: number }>(
    currentColor.hsv
  );
  const [nameInput, setNameInput] = useState<string>(currentColor.name || "");

  // State for color history
  const [colorHistory, setColorHistory] = useState<Color[]>([]);

  // State for saved colors
  const [savedColors, setSavedColors] = useState<SavedColor[]>([]);
  const [colorName, setColorName] = useState<string>("");

  // State for saved palettes
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [paletteName, setPaletteName] = useState<string>("");
  const [currentPalette, setCurrentPalette] = useState<Color[]>([]);
  const [paletteType, setPaletteType] = useState<string>("complementary");

  // State for contrast checker
  const [contrastColor, setContrastColor] = useState<string>("#FFFFFF");
  const [contrastResult, setContrastResult] = useState<ContrastResult>({
    ratio: 0,
    AA: false,
    AALarge: false,
    AAA: false,
    AAALarge: false,
  });

  // Load saved data from localStorage
  useEffect(() => {
    const savedColorsFromStorage = localStorage.getItem(
      "colorConverterSavedColors"
    );
    if (savedColorsFromStorage) {
      try {
        setSavedColors(JSON.parse(savedColorsFromStorage));
      } catch (e) {
        console.error("Failed to parse saved colors from localStorage", e);
      }
    }

    const savedPalettesFromStorage = localStorage.getItem(
      "colorConverterSavedPalettes"
    );
    if (savedPalettesFromStorage) {
      try {
        setSavedPalettes(JSON.parse(savedPalettesFromStorage));
      } catch (e) {
        console.error("Failed to parse saved palettes from localStorage", e);
      }
    }

    const colorHistoryFromStorage = localStorage.getItem(
      "colorConverterHistory"
    );
    if (colorHistoryFromStorage) {
      try {
        setColorHistory(JSON.parse(colorHistoryFromStorage));
      } catch (e) {
        console.error("Failed to parse color history from localStorage", e);
      }
    }
  }, []);

  // Save color history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("colorConverterHistory", JSON.stringify(colorHistory));
  }, [colorHistory]);

  // Save saved colors to localStorage when they change
  useEffect(() => {
    localStorage.setItem(
      "colorConverterSavedColors",
      JSON.stringify(savedColors)
    );
  }, [savedColors]);

  // Save saved palettes to localStorage when they change
  useEffect(() => {
    localStorage.setItem(
      "colorConverterSavedPalettes",
      JSON.stringify(savedPalettes)
    );
  }, [savedPalettes]);

  // Update contrast result when current color or contrast color changes
  useEffect(() => {
    setContrastResult(calculateContrastRatio(currentColor.hex, contrastColor));
  }, [currentColor.hex, contrastColor]);

  // Generate palette when current color or palette type changes
  useEffect(() => {
    generatePalette();
  }, [currentColor, paletteType]);

  // Update all inputs when current color changes
  useEffect(() => {
    setHexInput(currentColor.hex);
    setRgbInput(currentColor.rgb);
    setHslInput(currentColor.hsl);
    setCmykInput(currentColor.cmyk);
    setHsvInput(currentColor.hsv);
    setNameInput(currentColor.name || "");
  }, [currentColor]);

  // Update current color when hex input changes
  const updateFromHex = (hex: string) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return;

    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const name = getColorName(hex);

    setCurrentColor({ hex, rgb, hsl, cmyk, hsv, name });
    addToHistory({ hex, rgb, hsl, cmyk, hsv, name });
  };

  // Update current color when RGB inputs change
  const updateFromRgb = (r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    const name = getColorName(hex);

    setCurrentColor({ hex, rgb: { r, g, b }, hsl, cmyk, hsv, name });
    addToHistory({ hex, rgb: { r, g, b }, hsl, cmyk, hsv, name });
  };

  // Update current color when HSL inputs change
  const updateFromHsl = (h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const name = getColorName(hex);

    setCurrentColor({ hex, rgb, hsl: { h, s, l }, cmyk, hsv, name });
    addToHistory({ hex, rgb, hsl: { h, s, l }, cmyk, hsv, name });
  };

  // Update current color when CMYK inputs change
  const updateFromCmyk = (c: number, m: number, y: number, k: number) => {
    const rgb = cmykToRgb(c, m, y, k);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const name = getColorName(hex);

    setCurrentColor({ hex, rgb, hsl, cmyk: { c, m, y, k }, hsv, name });
    addToHistory({ hex, rgb, hsl, cmyk: { c, m, y, k }, hsv, name });
  };

  // Update current color when HSV inputs change
  const updateFromHsv = (h: number, s: number, v: number) => {
    const rgb = hsvToRgb(h, s, v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const name = getColorName(hex);

    setCurrentColor({ hex, rgb, hsl, cmyk, hsv: { h, s, v }, name });
    addToHistory({ hex, rgb, hsl, cmyk, hsv: { h, s, v }, name });
  };

  // Update current color when name input changes
  const updateFromName = (name: string) => {
    if (!cssColorNames[name.toLowerCase()]) return;

    const hex = cssColorNames[name.toLowerCase()];
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

    setCurrentColor({ hex, rgb, hsl, cmyk, hsv, name });
    addToHistory({ hex, rgb, hsl, cmyk, hsv, name });
  };

  // Add a color to history
  const addToHistory = (color: Color) => {
    // Check if color already exists in history
    const exists = colorHistory.some((c) => c.hex === color.hex);
    if (exists) return;

    const updatedHistory = [color, ...colorHistory].slice(0, 20); // Keep only the last 20 colors
    setColorHistory(updatedHistory);
  };

  // Clear history
  const clearHistory = () => {
    setColorHistory([]);
    toast({
      title: "History cleared",
      description: "Your color history has been cleared.",
      duration: 2000,
    });
  };

  // Save current color
  const saveColor = () => {
    if (!colorName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your color.",
        duration: 2000,
      });
      return;
    }

    const newSavedColor: SavedColor = {
      id: generateId(),
      color: currentColor,
      name: colorName,
      date: new Date().toLocaleString(),
    };

    const updatedSavedColors = [newSavedColor, ...savedColors];
    setSavedColors(updatedSavedColors);

    toast({
      title: "Color saved",
      description: `"${colorName}" has been saved to your colors.`,
      duration: 2000,
    });

    setColorName("");
  };

  // Delete a saved color
  const deleteSavedColor = (id: string) => {
    const updatedSavedColors = savedColors.filter((color) => color.id !== id);
    setSavedColors(updatedSavedColors);

    toast({
      title: "Color deleted",
      description: "The color has been removed from your saved colors.",
      duration: 2000,
    });
  };

  // Load a saved color
  const loadSavedColor = (savedColor: SavedColor) => {
    setCurrentColor(savedColor.color);

    toast({
      title: "Color loaded",
      description: `"${savedColor.name}" has been loaded.`,
      duration: 2000,
    });
  };

  // Generate a palette based on the current color
  const generatePalette = () => {
    let palette: Color[] = [];

    switch (paletteType) {
      case "complementary":
        palette = [getComplementaryColor(currentColor)];
        break;
      case "analogous":
        palette = getAnalogousColors(currentColor);
        break;
      case "triadic":
        palette = getTriadicColors(currentColor);
        break;
      case "tetradic":
        palette = getTetradicColors(currentColor);
        break;
      case "monochromatic":
        palette = getMonochromaticColors(currentColor);
        break;
      default:
        palette = [getComplementaryColor(currentColor)];
    }

    setCurrentPalette(palette);
  };

  // Save current palette
  const savePalette = () => {
    if (!paletteName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your palette.",
        duration: 2000,
      });
      return;
    }

    const newSavedPalette: SavedPalette = {
      id: generateId(),
      name: paletteName,
      colors: [currentColor, ...currentPalette],
      date: new Date().toLocaleString(),
    };

    const updatedSavedPalettes = [newSavedPalette, ...savedPalettes];
    setSavedPalettes(updatedSavedPalettes);

    toast({
      title: "Palette saved",
      description: `"${paletteName}" has been saved to your palettes.`,
      duration: 2000,
    });

    setPaletteName("");
  };

  // Delete a saved palette
  const deleteSavedPalette = (id: string) => {
    const updatedSavedPalettes = savedPalettes.filter(
      (palette) => palette.id !== id
    );
    setSavedPalettes(updatedSavedPalettes);

    toast({
      title: "Palette deleted",
      description: "The palette has been removed from your saved palettes.",
      duration: 2000,
    });
  };

  // Load a saved palette
  const loadSavedPalette = (savedPalette: SavedPalette) => {
    setCurrentColor(savedPalette.colors[0]);
    setCurrentPalette(savedPalette.colors.slice(1));

    toast({
      title: "Palette loaded",
      description: `"${savedPalette.name}" has been loaded.`,
      duration: 2000,
    });
  };

  // Copy color to clipboard
  const copyToClipboard = (text: string, label = "Color") => {
    navigator.clipboard.writeText(text);

    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to your clipboard.`,
      duration: 2000,
    });
  };

  // Export palette as CSS variables
  const exportPaletteAsCss = () => {
    const colors = [currentColor, ...currentPalette];
    let css = ":root {\n";

    colors.forEach((color, index) => {
      const name = index === 0 ? "primary" : `accent-${index}`;
      css += `  --color-${name}: ${color.hex};\n`;
    });

    css += "}";

    copyToClipboard(css, "CSS Variables");
  };

  // Get text color based on background color
  const getTextColor = (bgColor: string): string => {
    const rgb = hexToRgb(bgColor);
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#FFFFFF";
  };

  // Get WCAG badge variant based on compliance
  const getWcagBadgeVariant = (
    compliant: boolean
  ): "default" | "secondary" | "outline" => {
    return compliant ? "default" : "outline";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Color Format Converter
          </CardTitle>
          <CardDescription>
            Convert between color formats, generate palettes, and check
            accessibility
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="converter" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="converter">Converter</TabsTrigger>
              <TabsTrigger value="palettes">Palettes</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </TabsList>

            {/* Converter Tab */}
            <TabsContent value="converter" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - Color Preview */}
                <div className="space-y-4">
                  <div
                    className="w-full aspect-square rounded-md flex items-center justify-center"
                    style={{ backgroundColor: currentColor.hex }}
                  >
                    <span
                      className="text-2xl font-bold"
                      style={{ color: getTextColor(currentColor.hex) }}
                    >
                      {currentColor.hex}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className="p-4 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: currentColor.hex,
                        color: "#000000",
                      }}
                    >
                      <span className="font-medium">Black Text</span>
                    </div>
                    <div
                      className="p-4 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: currentColor.hex,
                        color: "#FFFFFF",
                      }}
                    >
                      <span className="font-medium">White Text</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={colorName}
                      onChange={(e) => setColorName(e.target.value)}
                      placeholder="Enter color name..."
                      className="flex-1"
                    />
                    <Button onClick={saveColor}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                {/* Right column - Color Inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hex">HEX</Label>
                    <div className="flex gap-2">
                      <Input
                        id="hex"
                        value={hexInput}
                        onChange={(e) => {
                          setHexInput(e.target.value);
                          if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                            updateFromHex(e.target.value);
                          }
                        }}
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(currentColor.hex, "HEX color")
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>RGB</Label>
                    <div className="flex gap-2">
                      <div className="grid grid-cols-3 gap-2 flex-1">
                        <div>
                          <Label htmlFor="rgb-r" className="sr-only">
                            Red
                          </Label>
                          <Input
                            id="rgb-r"
                            type="number"
                            min="0"
                            max="255"
                            value={rgbInput.r}
                            onChange={(e) => {
                              const r = Math.max(
                                0,
                                Math.min(
                                  255,
                                  Number.parseInt(e.target.value) || 0
                                )
                              );
                              setRgbInput({ ...rgbInput, r });
                              updateFromRgb(r, rgbInput.g, rgbInput.b);
                            }}
                            className="text-center"
                          />
                          <span className="text-xs text-center block mt-1">
                            R
                          </span>
                        </div>
                        <div>
                          <Label htmlFor="rgb-g" className="sr-only">
                            Green
                          </Label>
                          <Input
                            id="rgb-g"
                            type="number"
                            min="0"
                            max="255"
                            value={rgbInput.g}
                            onChange={(e) => {
                              const g = Math.max(
                                0,
                                Math.min(
                                  255,
                                  Number.parseInt(e.target.value) || 0
                                )
                              );
                              setRgbInput({ ...rgbInput, g });
                              updateFromRgb(rgbInput.r, g, rgbInput.b);
                            }}
                            className="text-center"
                          />
                          <span className="text-xs text-center block mt-1">
                            G
                          </span>
                        </div>
                        <div>
                          <Label htmlFor="rgb-b" className="sr-only">
                            Blue
                          </Label>
                          <Input
                            id="rgb-b"
                            type="number"
                            min="0"
                            max="255"
                            value={rgbInput.b}
                            onChange={(e) => {
                              const b = Math.max(
                                0,
                                Math.min(
                                  255,
                                  Number.parseInt(e.target.value) || 0
                                )
                              );
                              setRgbInput({ ...rgbInput, b });
                              updateFromRgb(rgbInput.r, rgbInput.g, b);
                            }}
                            className="text-center"
                          />
                          <span className="text-xs text-center block mt-1">
                            B
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(
                            `rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})`,
                            "RGB color"
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>HSL</Label>
                    <div className="flex gap-2">
                      <div className="grid grid-cols-3 gap-2 flex-1">
                        <div>
                          <Label htmlFor="hsl-h" className="sr-only">
                            Hue
                          </Label>
                          <Input
                            id="hsl-h"
                            type="number"
                            min="0"
                            max="360"
                            value={hslInput.h}
                            onChange={(e) => {
                              const h = Math.max(
                                0,
                                Math.min(
                                  360,
                                  Number.parseInt(e.target.value) || 0
                                )
                              );
                              setHslInput({ ...hslInput, h });
                              updateFromHsl(h, hslInput.s, hslInput.l);
                            }}
                            className="text-center"
                          />
                          <span className="text-xs text-center block mt-1">
                            H
                          </span>
                        </div>
                        <div>
                          <Label htmlFor="hsl-s" className="sr-only">
                            Saturation
                          </Label>
                          <Input
                            id="hsl-s"
                            type="number"
                            min="0"
                            max="100"
                            value={hslInput.s}
                            onChange={(e) => {
                              const s = Math.max(
                                0,
                                Math.min(
                                  100,
                                  Number.parseInt(e.target.value) || 0
                                )
                              );
                              setHslInput({ ...hslInput, s });
                              updateFromHsl(hslInput.h, s, hslInput.l);
                            }}
                            className="text-center"
                          />
                          <span className="text-xs text-center block mt-1">
                            S%
                          </span>
                        </div>
                        <div>
                          <Label htmlFor="hsl-l" className="sr-only">
                            Lightness
                          </Label>
                          <Input
                            id="hsl-l"
                            type="number"
                            min="0"
                            max="100"
                            value={hslInput.l}
                            onChange={(e) => {
                              const l = Math.max(
                                0,
                                Math.min(
                                  100,
                                  Number.parseInt(e.target.value) || 0
                                )
                              );
                              setHslInput({ ...hslInput, l });
                              updateFromHsl(hslInput.h, hslInput.s, l);
                            }}
                            className="text-center"
                          />
                          <span className="text-xs text-center block mt-1">
                            L%
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(
                            `hsl(${currentColor.hsl.h}, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%)`,
                            "HSL color"
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>CMYK</Label>
                    <div className="flex gap-2">
                      <div className="grid grid-cols-4 gap-2 flex-1">
                        <div>
                          <Label htmlFor="cmyk-c" className="sr-only">
                            Cyan
                          </Label>
                          <Input
                            id="cmyk-c"
                            type="number"
                            min="0"
                            max="100"
                            value={cmykInput.c}
                            onChange={(e) => {
                              const c = Math.max(
                                0,
                                Math.min(
                                  100,
                                  Number.parseInt(e.target.value) || 0
                                )
                              );
                              setCmykInput({ ...cmykInput, c });
                              updateFromCmyk(
                                c,
                                cmykInput.m,
                                cmykInput.y,
                                cmykInput.k
                              );
                            }}
                            className="text-center"
                          />
                          <span className="text-xs text-center block mt-1">
                            C%
                          </span>
                        </div>
                        <div>
                          <Label htmlFor="cmyk-m" className="sr-only">
                            Magenta
                          </Label>
                          <Input
                            id="cmyk-m"
                            type="number"
                            min="0"
                            max="100"
                            value={cmykInput.m}
                            onChange={(e) => {
                              const m = Math.max(
                                0,
                                Math.min(
                                  100,
                                  Number.parseInt(e.target.value) || 0
                                )
                              );
                              setCmykInput({ ...cmykInput, m });
                              updateFromCmyk(
                                cmykInput.c,
                                m,
                                cmykInput.y,
                                cmykInput.k
                              );
                            }}
                            className="text-center"
                          />
                          <span className="text-xs text-center block mt-1">
                            M%
                          </span>
                        </div>
                        <div>
                          <Label htmlFor="cmyk-y" className="sr-only">
                            Yellow
                          </Label>
                          <Input
                            id="cmyk-y"
                            type="number"
                            min="0"
                            max="100"
                            value={cmykInput.y}
                            onChange={(e) => {
                              const y = Math.max(
                                0,
                                Math.min(
                                  100,
                                  Number.parseInt(e.target.value) || 0
                                )
                              );
                              setCmykInput({ ...cmykInput, y });
                              updateFromCmyk(
                                cmykInput.c,
                                cmykInput.m,
                                y,
                                cmykInput.k
                              );
                            }}
                            className="text-center"
                          />
                          <span className="text-xs text-center block mt-1">
                            Y%
                          </span>
                        </div>
                        <div>
                          <Label htmlFor="cmyk-k" className="sr-only">
                            Key (Black)
                          </Label>
                          <Input
                            id="cmyk-k"
                            type="number"
                            min="0"
                            max="100"
                            value={cmykInput.k}
                            onChange={(e) => {
                              const k = Math.max(
                                0,
                                Math.min(
                                  100,
                                  Number.parseInt(e.target.value) || 0
                                )
                              );
                              setCmykInput({ ...cmykInput, k });
                              updateFromCmyk(
                                cmykInput.c,
                                cmykInput.m,
                                cmykInput.y,
                                k
                              );
                            }}
                            className="text-center"
                          />
                          <span className="text-xs text-center block mt-1">
                            K%
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(
                            `cmyk(${currentColor.cmyk.c}%, ${currentColor.cmyk.m}%, ${currentColor.cmyk.y}%, ${currentColor.cmyk.k}%)`,
                            "CMYK color"
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>HSV/HSB</Label>
                    <div className="flex gap-2">
                      <div className="grid grid-cols-3 gap-2 flex-1">
                        <div>
                          <Label htmlFor="hsv-h" className="sr-only">
                            Hue
                          </Label>
                          <Input
                            id="hsv-h"
                            type="number"
                            min="0"
                            max="360"
                            value={hsvInput.h}
                            onChange={(e) => {
                              const h = Math.max(
                                0,
                                Math.min(
                                  360,
                                  Number.parseInt(e.target.value) || 0
                                )
                              );
                              setHsvInput({ ...hsvInput, h });
                              updateFromHsv(h, hsvInput.s, hsvInput.v);
                            }}
                            className="text-center"
                          />
                          <span className="text-xs text-center block mt-1">
                            H
                          </span>
                        </div>
                        <div>
                          <Label htmlFor="hsv-s" className="sr-only">
                            Saturation
                          </Label>
                          <Input
                            id="hsv-s"
                            type="number"
                            min="0"
                            max="100"
                            value={hsvInput.s}
                            onChange={(e) => {
                              const s = Math.max(
                                0,
                                Math.min(
                                  100,
                                  Number.parseInt(e.target.value) || 0
                                )
                              );
                              setHsvInput({ ...hsvInput, s });
                              updateFromHsv(hsvInput.h, s, hsvInput.v);
                            }}
                            className="text-center"
                          />
                          <span className="text-xs text-center block mt-1">
                            S%
                          </span>
                        </div>
                        <div>
                          <Label htmlFor="hsv-v" className="sr-only">
                            Value
                          </Label>
                          <Input
                            id="hsv-v"
                            type="number"
                            min="0"
                            max="100"
                            value={hsvInput.v}
                            onChange={(e) => {
                              const v = Math.max(
                                0,
                                Math.min(
                                  100,
                                  Number.parseInt(e.target.value) || 0
                                )
                              );
                              setHsvInput({ ...hsvInput, v });
                              updateFromHsv(hsvInput.h, hsvInput.s, v);
                            }}
                            className="text-center"
                          />
                          <span className="text-xs text-center block mt-1">
                            V%
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          copyToClipboard(
                            `hsv(${currentColor.hsv.h}, ${currentColor.hsv.s}%, ${currentColor.hsv.v}%)`,
                            "HSV color"
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">CSS Color Name</Label>
                    <div className="flex gap-2">
                      <Select
                        value={nameInput || ""}
                        onValueChange={(value) => {
                          setNameInput(value);
                          updateFromName(value);
                        }}
                      >
                        <SelectTrigger id="name" className="flex-1">
                          <SelectValue placeholder="Select a color name" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(cssColorNames).map((name) => (
                            <SelectItem key={name} value={name}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{
                                    backgroundColor: cssColorNames[name],
                                  }}
                                />
                                <span>{name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {nameInput && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            copyToClipboard(nameInput, "CSS color name")
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Color History */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Color History</h3>
                  {colorHistory.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearHistory}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>

                {colorHistory.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground border rounded-md">
                    <p>
                      No color history yet. Convert some colors to see them
                      here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {colorHistory.map((color, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="w-full aspect-square rounded-md border"
                              style={{ backgroundColor: color.hex }}
                              onClick={() => setCurrentColor(color)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{color.hex}</p>
                            {color.name && <p>{color.name}</p>}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Palettes Tab */}
            <TabsContent value="palettes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - Current Color */}
                <div className="space-y-4">
                  <div
                    className="w-full aspect-square rounded-md flex items-center justify-center"
                    style={{ backgroundColor: currentColor.hex }}
                  >
                    <span
                      className="text-2xl font-bold"
                      style={{ color: getTextColor(currentColor.hex) }}
                    >
                      {currentColor.hex}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="palette-type">Palette Type</Label>
                    <Select value={paletteType} onValueChange={setPaletteType}>
                      <SelectTrigger id="palette-type">
                        <SelectValue placeholder="Select palette type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="complementary">
                          Complementary
                        </SelectItem>
                        <SelectItem value="analogous">Analogous</SelectItem>
                        <SelectItem value="triadic">Triadic</SelectItem>
                        <SelectItem value="tetradic">Tetradic</SelectItem>
                        <SelectItem value="monochromatic">
                          Monochromatic
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={paletteName}
                      onChange={(e) => setPaletteName(e.target.value)}
                      placeholder="Enter palette name..."
                      className="flex-1"
                    />
                    <Button onClick={savePalette}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>

                  <Button variant="outline" onClick={exportPaletteAsCss}>
                    <Copy className="h-4 w-4 mr-2" />
                    Export as CSS Variables
                  </Button>
                </div>

                {/* Right column - Generated Palette */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Generated Palette</h3>

                  <div className="grid grid-cols-1 gap-2">
                    {currentPalette.map((color, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-md flex justify-between items-center"
                        style={{ backgroundColor: color.hex }}
                      >
                        <span
                          className="font-medium"
                          style={{ color: getTextColor(color.hex) }}
                        >
                          {color.hex}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-white/20 hover:bg-white/40"
                            onClick={() => setCurrentColor(color)}
                          >
                            <Palette className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-white/20 hover:bg-white/40"
                            onClick={() => copyToClipboard(color.hex, "Color")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">Palette Preview</h4>
                    <div className="flex h-20 rounded-md overflow-hidden">
                      <div
                        className="flex-1"
                        style={{ backgroundColor: currentColor.hex }}
                      />
                      {currentPalette.map((color, index) => (
                        <div
                          key={index}
                          className="flex-1"
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Saved Palettes */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Saved Palettes</h3>

                {savedPalettes.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground border rounded-md">
                    <p>No saved palettes yet. Save a palette to see it here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {savedPalettes.map((palette) => (
                      <Card key={palette.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{palette.name}</h4>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => loadSavedPalette(palette)}
                              >
                                Load
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSavedPalette(palette.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex h-10 rounded-md overflow-hidden">
                            {palette.colors.map((color, index) => (
                              <div
                                key={index}
                                className="flex-1"
                                style={{ backgroundColor: color.hex }}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            <History className="h-3 w-3 inline mr-1" />
                            {palette.date}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Accessibility Tab */}
            <TabsContent value="accessibility" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - Contrast Checker */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contrast Checker</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Foreground Color</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-10 h-10 rounded-md border"
                          style={{ backgroundColor: currentColor.hex }}
                        />
                        <Input
                          value={currentColor.hex}
                          readOnly
                          className="font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-10 h-10 rounded-md border"
                          style={{ backgroundColor: contrastColor }}
                        />
                        <Input
                          value={contrastColor}
                          onChange={(e) => {
                            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                              setContrastColor(e.target.value);
                            }
                          }}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setContrastColor("#FFFFFF")}
                      className="w-full"
                    >
                      White Background
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setContrastColor("#000000")}
                      className="w-full"
                    >
                      Black Background
                    </Button>
                  </div>

                  <div
                    className="p-6 rounded-md"
                    style={{ backgroundColor: contrastColor }}
                  >
                    <div className="space-y-4">
                      <p
                        className="text-3xl font-bold"
                        style={{ color: currentColor.hex }}
                      >
                        Large Text
                      </p>
                      <p
                        className="text-base"
                        style={{ color: currentColor.hex }}
                      >
                        This is normal text that would be used for paragraphs
                        and general content on a website or application. The
                        contrast ratio should be at least 4.5:1 for WCAG AA
                        compliance.
                      </p>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">
                      Contrast Ratio: {contrastResult.ratio}:1
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <h5 className="text-sm font-medium">WCAG 2.1 AA</h5>
                        <div className="flex gap-2 mt-1">
                          <Badge
                            variant={getWcagBadgeVariant(
                              contrastResult.AALarge
                            )}
                          >
                            {contrastResult.AALarge ? "Pass" : "Fail"} Large
                            Text
                          </Badge>
                          <Badge
                            variant={getWcagBadgeVariant(contrastResult.AA)}
                          >
                            {contrastResult.AA ? "Pass" : "Fail"} Normal Text
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium">WCAG 2.1 AAA</h5>
                        <div className="flex gap-2 mt-1">
                          <Badge
                            variant={getWcagBadgeVariant(
                              contrastResult.AAALarge
                            )}
                          >
                            {contrastResult.AAALarge ? "Pass" : "Fail"} Large
                            Text
                          </Badge>
                          <Badge
                            variant={getWcagBadgeVariant(contrastResult.AAA)}
                          >
                            {contrastResult.AAA ? "Pass" : "Fail"} Normal Text
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - Color Blindness Simulation */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Color Blindness Simulation
                  </h3>

                  <div className="space-y-2">
                    <Label>Original Color</Label>
                    <div
                      className="h-16 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: currentColor.hex }}
                    >
                      <span
                        className="font-bold"
                        style={{ color: getTextColor(currentColor.hex) }}
                      >
                        {currentColor.hex}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Protanopia (Red-Blind)</Label>
                    <div
                      className="h-16 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: currentColor.hex,
                        filter: "url(#protanopia)",
                      }}
                    >
                      <span
                        className="font-bold"
                        style={{ color: getTextColor(currentColor.hex) }}
                      >
                        {currentColor.hex}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Deuteranopia (Green-Blind)</Label>
                    <div
                      className="h-16 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: currentColor.hex,
                        filter: "url(#deuteranopia)",
                      }}
                    >
                      <span
                        className="font-bold"
                        style={{ color: getTextColor(currentColor.hex) }}
                      >
                        {currentColor.hex}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tritanopia (Blue-Blind)</Label>
                    <div
                      className="h-16 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: currentColor.hex,
                        filter: "url(#tritanopia)",
                      }}
                    >
                      <span
                        className="font-bold"
                        style={{ color: getTextColor(currentColor.hex) }}
                      >
                        {currentColor.hex}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Achromatopsia (Monochromacy)</Label>
                    <div
                      className="h-16 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: currentColor.hex,
                        filter: "grayscale(100%)",
                      }}
                    >
                      <span
                        className="font-bold"
                        style={{ color: getTextColor(currentColor.hex) }}
                      >
                        {currentColor.hex}
                      </span>
                    </div>
                  </div>

                  {/* SVG Filters for Color Blindness Simulation */}
                  <svg className="absolute w-0 h-0">
                    <defs>
                      <filter id="protanopia">
                        <feColorMatrix
                          in="SourceGraphic"
                          type="matrix"
                          values="0.567, 0.433, 0, 0, 0
                                  0.558, 0.442, 0, 0, 0
                                  0, 0.242, 0.758, 0, 0
                                  0, 0, 0, 1, 0"
                        />
                      </filter>
                      <filter id="deuteranopia">
                        <feColorMatrix
                          in="SourceGraphic"
                          type="matrix"
                          values="0.625, 0.375, 0, 0, 0
                                  0.7, 0.3, 0, 0, 0
                                  0, 0.3, 0.7, 0, 0
                                  0, 0, 0, 1, 0"
                        />
                      </filter>
                      <filter id="tritanopia">
                        <feColorMatrix
                          in="SourceGraphic"
                          type="matrix"
                          values="0.95, 0.05, 0, 0, 0
                                  0, 0.433, 0.567, 0, 0
                                  0, 0.475, 0.525, 0, 0
                                  0, 0, 0, 1, 0"
                        />
                      </filter>
                    </defs>
                  </svg>
                </div>
              </div>
            </TabsContent>

            {/* Saved Tab */}
            <TabsContent value="saved" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column - Saved Colors */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Saved Colors</h3>

                  {savedColors.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg">
                      <p>No saved colors yet. Save a color to see it here.</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2 pr-4">
                        {savedColors.map((savedColor) => (
                          <Card key={savedColor.id}>
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <div
                                  className="w-16 h-16 rounded-md flex-shrink-0"
                                  style={{
                                    backgroundColor: savedColor.color.hex,
                                  }}
                                />
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium">
                                        {savedColor.name}
                                      </h4>
                                      <p className="text-sm font-mono">
                                        {savedColor.color.hex}
                                      </p>
                                      {savedColor.color.name && (
                                        <p className="text-sm text-muted-foreground">
                                          {savedColor.color.name}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          loadSavedColor(savedColor)
                                        }
                                      >
                                        Load
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          deleteSavedColor(savedColor.id)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <History className="h-3 w-3 inline mr-1" />
                                    {savedColor.date}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                {/* Right column - Saved Palettes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Saved Palettes</h3>

                  {savedPalettes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg">
                      <p>
                        No saved palettes yet. Save a palette to see it here.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4 pr-4">
                        {savedPalettes.map((palette) => (
                          <Card key={palette.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">{palette.name}</h4>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => loadSavedPalette(palette)}
                                  >
                                    Load
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      deleteSavedPalette(palette.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex h-10 rounded-md overflow-hidden">
                                {palette.colors.map((color, index) => (
                                  <div
                                    key={index}
                                    className="flex-1"
                                    style={{ backgroundColor: color.hex }}
                                  />
                                ))}
                              </div>
                              <div className="grid grid-cols-5 gap-1 mt-2">
                                {palette.colors.map((color, index) => (
                                  <div
                                    key={index}
                                    className="text-xs font-mono text-center overflow-hidden text-ellipsis"
                                  >
                                    {color.hex}
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                <History className="h-3 w-3 inline mr-1" />
                                {palette.date}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Convert between HEX, RGB, HSL, CMYK, and more
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const randomColor = `#${Math.floor(Math.random() * 16777215)
                  .toString(16)
                  .padStart(6, "0")}`.toUpperCase();
                updateFromHex(randomColor);
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Random Color
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
