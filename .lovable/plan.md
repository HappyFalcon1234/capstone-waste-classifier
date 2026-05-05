## Hybrid MobileNetV2 + Gemini Pipeline

Add a client-side MobileNetV2 model that runs first to predict the bin color, then call the existing Gemini edge function for detailed disposal instructions and multi-item extraction. Gemini receives the MobileNet hint and is told to use it as a strong prior.

### Architecture

```text
Image upload
   │
   ▼
[1] MobileNetV2 (browser, TF.js)
   • ImageNet classification → map top-K labels to bin color
   • Returns: { binColorHint, topLabels[], confidence }
   │
   ▼
[2] classify-waste edge function (Gemini)
   • Receives image + binColorHint + topLabels
   • Multi-item detection + disposal instructions
   • Uses hint as prior, can override on low MobileNet confidence
   │
   ▼
[3] Merge results
   • Show MobileNet badge on each item ("Verified by MobileNetV2" when bin colors agree)
   • Display final predictions
```

### Changes

**1. New client model loader** — `src/lib/mobilenetClassifier.ts`
- Install `@tensorflow/tfjs` + `@tensorflow-models/mobilenet`
- Lazy-load MobileNetV2 (alpha=1.0) on first use, cache in module scope
- `classifyImage(base64) → { binColorHint, topLabels, confidence }`
- Hardcoded ImageNet→bin mapping (e.g., `plastic_bag/water_bottle → Blue`, `banana/apple → Green`, `cellular_telephone/laptop → Yellow`, `syringe → Red`, fallback `Black`). ~80 common labels covered; unmapped → `null` hint.

**2. Update `src/pages/Index.tsx` `handleImageUpload`**
- Before invoking edge function: `const hint = await classifyImage(base64Image)`
- Pass `mobileNetHint: hint` in invoke body
- Show progress text "Running on-device model…" then "Getting disposal details…" (extend `AnalyzingProgress` with a new stage)

**3. Update `supabase/functions/classify-waste/index.ts`**
- Accept optional `mobileNetHint: { binColorHint: string|null, topLabels: string[], confidence: number }`
- Validate shape (Zod-style manual check, same pattern as existing validators)
- Inject into system prompt: "An on-device MobileNetV2 model predicted bin color **X** with confidence **Y%** and top labels [...]. Treat this as a strong prior for the dominant item; override only if visual evidence clearly disagrees, and do so for additional items independently."
- Add `mobileNetAgreement: boolean` per prediction in response (compare returned binColor vs hint)

**4. Update `WasteItem` type + `WasteResults.tsx`**
- Add optional `mobileNetAgreement?: boolean`
- Show small badge "✓ MobileNetV2" next to confidence when true

**5. Bundle/perf considerations**
- TF.js + MobileNet adds ~6 MB to client. Lazy-load only when user hits upload (dynamic `import()`).
- WebGL backend by default, CPU fallback automatic.
- Add timeout (5s) — if MobileNet fails/slow, proceed without hint (graceful degrade).

### Files touched
- new: `src/lib/mobilenetClassifier.ts`
- edit: `src/pages/Index.tsx`, `src/components/AnalyzingProgress.tsx`, `src/components/WasteResults.tsx`, `src/hooks/useUploadHistory.ts` (type only)
- edit: `supabase/functions/classify-waste/index.ts`
- edit: `package.json` (add `@tensorflow/tfjs`, `@tensorflow-models/mobilenet`)

### Notes / trade-offs
- MobileNetV2 is ImageNet-trained (1000 generic classes), not waste-specific, so the bin map is heuristic. Accuracy on non-ImageNet items (e.g., a rolled-up tissue) will be `null` hint → Gemini behaves as today.
- For waste-specific accuracy you'd later fine-tune on TrashNet and host the weights in `public/models/`. This plan keeps the off-the-shelf model so it works immediately.
- No backend changes needed beyond the edge function; no DB migrations.
