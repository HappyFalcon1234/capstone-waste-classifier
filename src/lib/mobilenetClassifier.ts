// Lazy-loaded MobileNetV2 classifier for top-level bin color prediction.
// Falls back gracefully — if anything fails, returns null hint and the
// pipeline continues with Gemini-only classification.

export type BinColor = "Blue" | "Green" | "Red" | "Yellow" | "Black";

export interface MobileNetHint {
  binColorHint: BinColor | null;
  topLabels: { className: string; probability: number }[];
  confidence: number; // 0-100, confidence of the chosen bin color
}

// ImageNet label substring -> bin color. Lowercased substring match.
// Covers common waste-relevant ImageNet classes.
const LABEL_TO_BIN: { match: string; bin: BinColor }[] = [
  // Blue — Recyclable (plastic, paper, metal, glass)
  { match: "water bottle", bin: "Blue" },
  { match: "wine bottle", bin: "Blue" },
  { match: "beer bottle", bin: "Blue" },
  { match: "pop bottle", bin: "Blue" },
  { match: "bottle", bin: "Blue" },
  { match: "plastic bag", bin: "Blue" },
  { match: "paper towel", bin: "Blue" },
  { match: "envelope", bin: "Blue" },
  { match: "carton", bin: "Blue" },
  { match: "packet", bin: "Blue" },
  { match: "menu", bin: "Blue" },
  { match: "book jacket", bin: "Blue" },
  { match: "newspaper", bin: "Blue" },
  { match: "binder", bin: "Blue" },
  { match: "tin can", bin: "Blue" },
  { match: "beer can", bin: "Blue" },
  { match: "soda can", bin: "Blue" },
  { match: "can opener", bin: "Blue" },
  { match: "milk can", bin: "Blue" },
  { match: "aluminum", bin: "Blue" },
  { match: "beer glass", bin: "Blue" },
  { match: "wine glass", bin: "Blue" },
  { match: "goblet", bin: "Blue" },
  { match: "cup", bin: "Blue" },
  { match: "coffee mug", bin: "Blue" },
  { match: "vase", bin: "Blue" },
  { match: "jar", bin: "Blue" },
  // Green — Organic / wet waste
  { match: "banana", bin: "Green" },
  { match: "orange", bin: "Green" },
  { match: "lemon", bin: "Green" },
  { match: "apple", bin: "Green" },
  { match: "pineapple", bin: "Green" },
  { match: "strawberry", bin: "Green" },
  { match: "pomegranate", bin: "Green" },
  { match: "fig", bin: "Green" },
  { match: "broccoli", bin: "Green" },
  { match: "cauliflower", bin: "Green" },
  { match: "cucumber", bin: "Green" },
  { match: "bell pepper", bin: "Green" },
  { match: "mushroom", bin: "Green" },
  { match: "corn", bin: "Green" },
  { match: "artichoke", bin: "Green" },
  { match: "cabbage", bin: "Green" },
  { match: "zucchini", bin: "Green" },
  { match: "squash", bin: "Green" },
  { match: "bread", bin: "Green" },
  { match: "bagel", bin: "Green" },
  { match: "pretzel", bin: "Green" },
  { match: "pizza", bin: "Green" },
  { match: "burrito", bin: "Green" },
  { match: "hotdog", bin: "Green" },
  { match: "cheeseburger", bin: "Green" },
  { match: "meat loaf", bin: "Green" },
  { match: "guacamole", bin: "Green" },
  { match: "soup", bin: "Green" },
  { match: "ice cream", bin: "Green" },
  { match: "egg", bin: "Green" },
  // Yellow — E-waste / electronics / batteries
  { match: "cellular telephone", bin: "Yellow" },
  { match: "cellphone", bin: "Yellow" },
  { match: "iPod", bin: "Yellow" },
  { match: "laptop", bin: "Yellow" },
  { match: "notebook", bin: "Yellow" },
  { match: "desktop computer", bin: "Yellow" },
  { match: "computer keyboard", bin: "Yellow" },
  { match: "monitor", bin: "Yellow" },
  { match: "screen", bin: "Yellow" },
  { match: "television", bin: "Yellow" },
  { match: "remote control", bin: "Yellow" },
  { match: "mouse", bin: "Yellow" },
  { match: "printer", bin: "Yellow" },
  { match: "modem", bin: "Yellow" },
  { match: "hard disc", bin: "Yellow" },
  { match: "tape player", bin: "Yellow" },
  { match: "cassette player", bin: "Yellow" },
  { match: "CD player", bin: "Yellow" },
  { match: "radio", bin: "Yellow" },
  { match: "microwave", bin: "Yellow" },
  { match: "toaster", bin: "Yellow" },
  { match: "vacuum", bin: "Yellow" },
  { match: "iron", bin: "Yellow" },
  { match: "hair drier", bin: "Yellow" },
  { match: "digital clock", bin: "Yellow" },
  { match: "digital watch", bin: "Yellow" },
  { match: "battery", bin: "Yellow" },
  // Red — Hazardous / medical / chemicals
  { match: "syringe", bin: "Red" },
  { match: "pill bottle", bin: "Red" },
  { match: "lighter", bin: "Red" },
  { match: "matchstick", bin: "Red" },
  { match: "spray", bin: "Red" },
  { match: "lotion", bin: "Red" },
  { match: "sunscreen", bin: "Red" },
  // Black — Non-recyclable
  { match: "diaper", bin: "Black" },
  { match: "Band Aid", bin: "Black" },
  { match: "rubber eraser", bin: "Black" },
];

function mapLabelToBin(label: string): BinColor | null {
  const lower = label.toLowerCase();
  for (const { match, bin } of LABEL_TO_BIN) {
    if (lower.includes(match.toLowerCase())) return bin;
  }
  return null;
}

let modelPromise: Promise<any> | null = null;

async function loadModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tf = await import("@tensorflow/tfjs");
      // Ensure backend is ready (WebGL preferred, CPU fallback automatic)
      await tf.ready();
      const mobilenet = await import("@tensorflow-models/mobilenet");
      // v2, alpha=1.0 = best accuracy variant
      return mobilenet.load({ version: 2, alpha: 1.0 });
    })().catch((e) => {
      modelPromise = null;
      throw e;
    });
  }
  return modelPromise;
}

function loadImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for MobileNet"));
    img.src = base64;
  });
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("MobileNet timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

/**
 * Classify an image with MobileNetV2 and map the top labels to a bin color.
 * Always resolves (never rejects) — failures return a null-hint object so the
 * caller can proceed with Gemini-only classification.
 */
export async function classifyWithMobileNet(base64: string): Promise<MobileNetHint> {
  const empty: MobileNetHint = { binColorHint: null, topLabels: [], confidence: 0 };
  try {
    const model = await withTimeout(loadModel(), 15000);
    const img = await loadImage(base64);
    const predictions: { className: string; probability: number }[] = await withTimeout(
      model.classify(img, 5),
      8000,
    );

    if (!predictions?.length) return empty;

    // Find the top prediction whose label maps to a bin
    for (const pred of predictions) {
      const bin = mapLabelToBin(pred.className);
      if (bin) {
        return {
          binColorHint: bin,
          topLabels: predictions,
          confidence: Math.round(pred.probability * 100),
        };
      }
    }

    return { binColorHint: null, topLabels: predictions, confidence: 0 };
  } catch (e) {
    console.warn("MobileNet classification failed, continuing without hint:", e);
    return empty;
  }
}
