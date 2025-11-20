import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Allowed languages
const ALLOWED_LANGUAGES = ["English", "Hindi", "Tamil", "Telugu"] as const;
type Language = typeof ALLOWED_LANGUAGES[number];

// Validation functions
function isValidLanguage(lang: string): lang is Language {
  return ALLOWED_LANGUAGES.includes(lang as Language);
}

function isValidImageBase64(imageBase64: unknown): imageBase64 is string {
  if (typeof imageBase64 !== "string" || !imageBase64) {
    return false;
  }
  
  // Check if it's a valid data URI
  if (!imageBase64.startsWith("data:image/")) {
    return false;
  }
  
  // Check size (base64 is ~1.33x original size)
  const base64Data = imageBase64.split(",")[1] || imageBase64;
  const estimatedSize = (base64Data.length * 3) / 4;
  const MAX_SIZE = 20 * 1024 * 1024; // 20MB
  
  return estimatedSize <= MAX_SIZE;
}

interface PredictionItem {
  item: string;
  category: string;
  disposal: string;
  binColor: string;
  confidence: number;
}

function validatePredictions(data: unknown): data is PredictionItem[] {
  if (!Array.isArray(data)) return false;
  
  return data.every((item) => {
    return (
      typeof item === "object" &&
      item !== null &&
      typeof item.item === "string" &&
      typeof item.category === "string" &&
      typeof item.disposal === "string" &&
      typeof item.binColor === "string" &&
      typeof item.confidence === "number" &&
      item.confidence >= 0 &&
      item.confidence <= 100
    );
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { imageBase64, language = "English" } = body;

    // Validate inputs
    if (!isValidImageBase64(imageBase64)) {
      return new Response(
        JSON.stringify({ error: "Invalid image data. Please upload a valid image under 20MB." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isValidLanguage(language)) {
      return new Response(
        JSON.stringify({ error: "Invalid language selection." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("Configuration error: LOVABLE_API_KEY not set");
      return new Response(
        JSON.stringify({ error: "Service configuration error." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing image analysis request");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert waste classification system for India. Analyze images and identify ALL waste items present. Use simple, everyday language that anyone can understand. For each item, provide:
1. Item name (use simple, common words - e.g., "Plastic Bottle" not "Polyethylene Terephthalate Container")
2. Waste category (Recyclable, Organic/Wet Waste, Hazardous, or E-Waste)
3. Disposal instructions specific to India (in simple language)
4. Bin color according to Indian waste segregation (ONLY the color name - one of: Blue, Green, Red, Yellow, Black):
   - Blue: Recyclable waste (plastic, paper, metal, glass)
   - Green: Organic/wet waste (food scraps, garden waste)
   - Red: Hazardous waste (medical, chemicals, batteries)
   - Yellow: E-waste (electronics, batteries)
   - Black: Non-recyclable waste
5. Confidence level (0-100) indicating how certain you are about the classification

Respond in ${language} language. Return a JSON array with all items found. Be thorough and identify every visible waste item.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image and identify ALL waste items using simple language. Return a JSON array with format: [{"item": "simple item name", "category": "category", "disposal": "how to dispose", "binColor": "Blue/Green/Red/Yellow/Black (ONLY the color, no 'bin' word)", "confidence": 95}]. Respond in ${language}.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI API request failed:", response.status);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Unable to process image. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    console.log("Image analysis completed");

    // Parse the JSON array from the response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Invalid AI response format");
      return new Response(
        JSON.stringify({ error: "Unable to process AI response. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let predictions: PredictionItem[];
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!validatePredictions(parsed)) {
        throw new Error("Invalid prediction structure");
      }
      
      predictions = parsed;
    } catch (parseError) {
      console.error("Failed to parse predictions");
      return new Response(
        JSON.stringify({ error: "Unable to process AI response. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ predictions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error instanceof Error ? error.name : "Unknown");
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
