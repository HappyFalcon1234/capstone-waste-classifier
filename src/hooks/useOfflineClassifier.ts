import { useState, useRef, useCallback } from 'react';
import { pipeline, ImageClassificationPipeline } from '@huggingface/transformers';

// Mapping from general image classification labels to waste categories
const WASTE_CATEGORY_MAPPING: Record<string, { bin: string; type: string }> = {
  // Electronics -> E-Waste (Yellow)
  'computer': { bin: 'Yellow', type: 'E-Waste' },
  'laptop': { bin: 'Yellow', type: 'E-Waste' },
  'monitor': { bin: 'Yellow', type: 'E-Waste' },
  'television': { bin: 'Yellow', type: 'E-Waste' },
  'phone': { bin: 'Yellow', type: 'E-Waste' },
  'cellular telephone': { bin: 'Yellow', type: 'E-Waste' },
  'remote control': { bin: 'Yellow', type: 'E-Waste' },
  'mouse': { bin: 'Yellow', type: 'E-Waste' },
  'keyboard': { bin: 'Yellow', type: 'E-Waste' },
  'iPod': { bin: 'Yellow', type: 'E-Waste' },
  'speaker': { bin: 'Yellow', type: 'E-Waste' },
  'radio': { bin: 'Yellow', type: 'E-Waste' },
  'electric fan': { bin: 'Yellow', type: 'E-Waste' },
  'printer': { bin: 'Yellow', type: 'E-Waste' },
  'camera': { bin: 'Yellow', type: 'E-Waste' },
  
  // Food & Organic -> Green
  'banana': { bin: 'Green', type: 'Organic Waste' },
  'apple': { bin: 'Green', type: 'Organic Waste' },
  'orange': { bin: 'Green', type: 'Organic Waste' },
  'lemon': { bin: 'Green', type: 'Organic Waste' },
  'broccoli': { bin: 'Green', type: 'Organic Waste' },
  'cucumber': { bin: 'Green', type: 'Organic Waste' },
  'carrot': { bin: 'Green', type: 'Organic Waste' },
  'strawberry': { bin: 'Green', type: 'Organic Waste' },
  'pineapple': { bin: 'Green', type: 'Organic Waste' },
  'mushroom': { bin: 'Green', type: 'Organic Waste' },
  'meat loaf': { bin: 'Green', type: 'Organic Waste' },
  'pizza': { bin: 'Green', type: 'Organic Waste' },
  'sandwich': { bin: 'Green', type: 'Organic Waste' },
  'bread': { bin: 'Green', type: 'Organic Waste' },
  'hotdog': { bin: 'Green', type: 'Organic Waste' },
  'ice cream': { bin: 'Green', type: 'Organic Waste' },
  'flower': { bin: 'Green', type: 'Organic Waste' },
  'leaf': { bin: 'Green', type: 'Organic Waste' },
  'plant': { bin: 'Green', type: 'Organic Waste' },
  
  // Plastic & Recyclables -> Blue
  'water bottle': { bin: 'Blue', type: 'Plastic Waste' },
  'plastic bag': { bin: 'Blue', type: 'Plastic Waste' },
  'pop bottle': { bin: 'Blue', type: 'Plastic Waste' },
  'bottlecap': { bin: 'Blue', type: 'Plastic Waste' },
  'cup': { bin: 'Blue', type: 'Plastic Waste' },
  'bucket': { bin: 'Blue', type: 'Plastic Waste' },
  'tub': { bin: 'Blue', type: 'Plastic Waste' },
  'container': { bin: 'Blue', type: 'Plastic Waste' },
  'bottle': { bin: 'Blue', type: 'Recyclable Waste' },
  'can': { bin: 'Blue', type: 'Metal Waste' },
  'tin can': { bin: 'Blue', type: 'Metal Waste' },
  'beer bottle': { bin: 'Blue', type: 'Glass Waste' },
  'wine bottle': { bin: 'Blue', type: 'Glass Waste' },
  'paper towel': { bin: 'Blue', type: 'Paper Waste' },
  'envelope': { bin: 'Blue', type: 'Paper Waste' },
  'newspaper': { bin: 'Blue', type: 'Paper Waste' },
  'book': { bin: 'Blue', type: 'Paper Waste' },
  'cardboard': { bin: 'Blue', type: 'Paper Waste' },
  'carton': { bin: 'Blue', type: 'Paper Waste' },
  
  // Hazardous -> Red
  'syringe': { bin: 'Red', type: 'Medical Waste' },
  'pill bottle': { bin: 'Red', type: 'Medical Waste' },
  'medicine chest': { bin: 'Red', type: 'Medical Waste' },
  'band aid': { bin: 'Red', type: 'Medical Waste' },
  'gas pump': { bin: 'Red', type: 'Hazardous Waste' },
  'lighter': { bin: 'Red', type: 'Hazardous Waste' },
  'matchstick': { bin: 'Red', type: 'Hazardous Waste' },
  'battery': { bin: 'Red', type: 'Hazardous Waste' },
  'paint can': { bin: 'Red', type: 'Hazardous Waste' },
  
  // General/Non-recyclable -> Black
  'diaper': { bin: 'Black', type: 'Non-Recyclable Waste' },
  'mask': { bin: 'Black', type: 'Non-Recyclable Waste' },
  'shoe': { bin: 'Black', type: 'Non-Recyclable Waste' },
  'sock': { bin: 'Black', type: 'Non-Recyclable Waste' },
  'rubber eraser': { bin: 'Black', type: 'Non-Recyclable Waste' },
  'balloon': { bin: 'Black', type: 'Non-Recyclable Waste' },
  'handkerchief': { bin: 'Black', type: 'Non-Recyclable Waste' },
};

// Default disposal instructions by bin color
const DISPOSAL_INSTRUCTIONS: Record<string, string> = {
  'Yellow': 'Take to an authorized e-waste collection center. Do not dispose in regular bins.',
  'Green': 'Place in the green bin for composting. Can be used for organic fertilizer.',
  'Blue': 'Clean and dry before placing in the blue recycling bin.',
  'Red': 'Handle with care. Take to a hazardous waste collection facility.',
  'Black': 'Place in the black bin for general non-recyclable waste.',
};

export interface OfflinePrediction {
  item: string;
  bin_color: string;
  disposal_instructions: string;
  confidence: number;
}

export function useOfflineClassifier() {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelLoadProgress, setModelLoadProgress] = useState(0);
  const [isModelReady, setIsModelReady] = useState(false);
  const classifierRef = useRef<ImageClassificationPipeline | null>(null);

  const loadModel = useCallback(async () => {
    if (classifierRef.current || isModelLoading) return;
    
    setIsModelLoading(true);
    setModelLoadProgress(0);
    
    try {
      const classifier = await pipeline(
        'image-classification',
        'onnx-community/mobilenetv4_conv_small.e2400_r224_in1k',
        {
          progress_callback: (progress: any) => {
            if (progress.progress) {
              setModelLoadProgress(Math.round(progress.progress));
            }
          }
        }
      );
      
      classifierRef.current = classifier;
      setIsModelReady(true);
    } catch (error) {
      console.error('Failed to load offline model:', error);
      throw error;
    } finally {
      setIsModelLoading(false);
    }
  }, [isModelLoading]);

  const classifyImage = useCallback(async (imageData: string): Promise<OfflinePrediction[]> => {
    if (!classifierRef.current) {
      await loadModel();
    }
    
    if (!classifierRef.current) {
      throw new Error('Model not loaded');
    }

    const results = await classifierRef.current(imageData, { top_k: 5 });
    
    const predictions: OfflinePrediction[] = [];
    
    // Handle both array and single result formats
    const resultsArray = Array.isArray(results) ? results.flat() : [results];
    
    for (const result of resultsArray) {
      if (!result || typeof result !== 'object') continue;
      const resultObj = result as { label?: string; score?: number };
      if (!resultObj.label || typeof resultObj.score !== 'number') continue;
      
      const label = resultObj.label.toLowerCase();
      let category = WASTE_CATEGORY_MAPPING[label];
      
      // Try to find a partial match if exact match not found
      if (!category) {
        for (const [key, value] of Object.entries(WASTE_CATEGORY_MAPPING)) {
          if (label.includes(key) || key.includes(label.split(',')[0].trim())) {
            category = value;
            break;
          }
        }
      }
      
      // Default to Black bin if no mapping found
      if (!category) {
        category = { bin: 'Black', type: 'General Waste' };
      }
      
      predictions.push({
        item: resultObj.label.split(',')[0].trim(),
        bin_color: category.bin,
        disposal_instructions: DISPOSAL_INSTRUCTIONS[category.bin],
        confidence: Math.round(resultObj.score * 100),
      });
    }
    
    // Return top 3 unique bin predictions
    const uniquePredictions: OfflinePrediction[] = [];
    const seenItems = new Set<string>();
    
    for (const pred of predictions) {
      if (!seenItems.has(pred.item) && uniquePredictions.length < 3) {
        seenItems.add(pred.item);
        uniquePredictions.push(pred);
      }
    }
    
    return uniquePredictions;
  }, [loadModel]);

  return {
    classifyImage,
    loadModel,
    isModelLoading,
    modelLoadProgress,
    isModelReady,
  };
}
