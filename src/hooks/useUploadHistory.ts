import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WasteItem {
  item: string;
  category: string;
  disposal: string;
  binColor: string;
  confidence: number;
}

export const useUploadHistory = () => {
  const { user } = useAuth();

  const saveToHistory = async (imageBase64: string, predictions: WasteItem[]) => {
    if (!user) return null;

    try {
      // Convert base64 to blob
      const base64Data = imageBase64.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });

      // Upload to storage
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("waste-images")
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Store the file path (not the URL) so we can generate signed URLs later
      const imagePath = fileName;

      // Save to history with the file path
      const { data, error } = await supabase
        .from("upload_history")
        .insert([{
          user_id: user.id,
          image_url: imagePath, // Store path, not URL
          predictions: JSON.parse(JSON.stringify(predictions))
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving to history:", error);
      return null;
    }
  };

  return { saveToHistory };
};
