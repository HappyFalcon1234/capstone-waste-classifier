import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing waste image with AI...");

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
            content: `You are an expert waste classification system for India. Analyze images and identify ALL waste items present. For each item, provide:
1. Item name
2. Waste category (Recyclable, Organic/Wet Waste, Hazardous, or E-Waste)
3. Disposal instructions specific to India
4. Bin color according to Indian waste segregation:
   - Blue bin: Recyclable waste (plastic, paper, metal, glass)
   - Green bin: Organic/wet waste (food scraps, garden waste)
   - Red bin: Hazardous waste (medical, chemicals, batteries)
   - Yellow bin: E-waste (electronics, batteries)

Return a JSON array with all items found. Be thorough and identify every visible waste item.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image and identify ALL waste items. Return a JSON array with format: [{\"item\": \"item name\", \"category\": \"category\", \"disposal\": \"how to dispose\", \"binColor\": \"color name\"}]",
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
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    console.log("AI Response:", aiResponse);

    // Parse the JSON array from the response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response");
    }

    const predictions = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ predictions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in classify-waste function:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to classify waste";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
