import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Allowed languages - all 22 official Indian languages plus English
const ALLOWED_LANGUAGES = [
  "English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", 
  "Marathi", "Bengali", "Gujarati", "Punjabi", "Odia", "Assamese",
  "Urdu", "Sanskrit", "Konkani", "Manipuri", "Nepali", "Bodo",
  "Dogri", "Kashmiri", "Maithili", "Santali", "Sindhi"
] as const;
type Language = typeof ALLOWED_LANGUAGES[number];

// Validation functions
function isValidLanguage(lang: string): lang is Language {
  return ALLOWED_LANGUAGES.includes(lang as Language);
}

function isValidImageBase64(imageBase64: unknown): imageBase64 is string {
  if (typeof imageBase64 !== "string" || !imageBase64) {
    return false;
  }
  
  // Validate data URI format and allowed image types only
  const allowedFormats = [
    'data:image/jpeg;base64,',
    'data:image/jpg;base64,',
    'data:image/png;base64,',
    'data:image/gif;base64,',
    'data:image/webp;base64,'
  ];
  
  const hasValidFormat = allowedFormats.some(format => 
    imageBase64.toLowerCase().startsWith(format)
  );
  
  if (!hasValidFormat) {
    return false;
  }
  
  // Check size (base64 is ~1.33x original size)
  const base64Data = imageBase64.split(",")[1];
  if (!base64Data) {
    return false;
  }
  
  // Validate base64 encoding
  try {
    if (!/^[A-Za-z0-9+/]+=*$/.test(base64Data)) {
      return false;
    }
  } catch {
    return false;
  }
  
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

interface LearnedCorrection {
  item_name: string;
  original_category: string;
  corrected_category: string | null;
  correction_details: string | null;
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

// Format learned corrections for the AI prompt
function formatCorrectionsForPrompt(corrections: LearnedCorrection[]): string {
  if (corrections.length === 0) return "";
  
  const correctionsList = corrections.map(c => {
    if (c.corrected_category) {
      return `- "${c.item_name}" should be classified as "${c.corrected_category}" (NOT "${c.original_category}")${c.correction_details ? `. Note: ${c.correction_details}` : ""}`;
    }
    return `- "${c.item_name}" was incorrectly classified as "${c.original_category}"${c.correction_details ? `. Issue: ${c.correction_details}` : ""}`;
  }).join("\n");
  
  return `

IMPORTANT - LEARNED CORRECTIONS FROM USER FEEDBACK:
The following items have been reviewed and corrected. Apply these corrections when classifying similar items:
${correctionsList}

Use these corrections to improve your classification accuracy.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for rate limiting and fetching corrections
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Check rate limit (5 requests per minute per IP - tightened for abuse prevention)
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recentRequests, error: rateLimitError } = await supabase
      .from('rate_limits')
      .select('request_count')
      .eq('ip_address', clientIP)
      .eq('endpoint', 'classify-waste')
      .gte('created_at', oneMinuteAgo);

    if (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError.message);
    }

    const requestCount = recentRequests?.reduce((sum, r) => sum + r.request_count, 0) || 0;

    if (requestCount >= 5) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Maximum 5 requests per minute. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log this request
    await supabase.from('rate_limits').insert({
      ip_address: clientIP,
      endpoint: 'classify-waste',
      request_count: 1
    });

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

    // Fetch learned corrections to improve classification
    const { data: corrections, error: correctionsError } = await supabase
      .from('learned_corrections')
      .select('item_name, original_category, corrected_category, correction_details')
      .order('created_at', { ascending: false })
      .limit(50); // Limit to most recent 50 corrections to keep prompt size manageable

    if (correctionsError) {
      console.error('Failed to fetch corrections:', correctionsError.message);
    }

    const correctionsPrompt = formatCorrectionsForPrompt(corrections || []);
    
    console.log(`Processing image analysis request with ${corrections?.length || 0} learned corrections`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are an expert waste classification system for India. Analyze images and identify ALL waste items present. Use simple, everyday language that anyone can understand. For each item, provide:
1. Item name (use simple, common words - e.g., "Plastic Bottle" not "Polyethylene Terephthalate Container")
2. Waste category (Recyclable, Organic/Wet Waste, Hazardous, or E-Waste)
3. Detailed disposal instructions specific to India that include:
   - Step-by-step preparation (e.g., "Rinse the bottle and remove the cap")
   - Where to dispose (e.g., "Place in the blue recycling bin at your nearest collection point")
   - What NOT to do (e.g., "Do not mix with food waste")
   - Environmental tip (e.g., "Recycling one plastic bottle saves enough energy to power a light bulb for 3 hours")
   - Local context when relevant (e.g., mention kabadiwala/scrap dealers for recyclables, composting for organic waste)
4. Bin color according to Indian waste segregation (ONLY the color name - one of: Blue, Green, Red, Yellow, Black):
   - Blue: Recyclable waste (plastic, paper, metal, glass)
   - Green: Organic/wet waste (food scraps, garden waste)
   - Red: Hazardous waste (medical, chemicals, batteries)
   - Yellow: E-waste (electronics, batteries)
   - Black: Non-recyclable waste
5. Confidence level (0-100) indicating how certain you are about the classification

Respond in ${language} language. Return a JSON array with all items found. Be thorough and identify every visible waste item.${correctionsPrompt}`,
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
