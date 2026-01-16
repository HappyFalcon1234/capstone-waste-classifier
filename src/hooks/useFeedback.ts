import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WasteItem {
  item: string;
  category: string;
  disposal: string;
  binColor: string;
  confidence: number;
}

export const useFeedback = () => {
  const { user } = useAuth();

  const submitFeedback = async (
    item: WasteItem,
    feedbackType: "yes" | "no" | "not_sure",
    description?: string,
    uploadHistoryId?: string
  ) => {
    try {
      const { error } = await supabase
        .from("feedback_submissions")
        .insert({
          user_id: user?.id || null,
          upload_history_id: uploadHistoryId || null,
          item_name: item.item,
          original_prediction: {
            item: item.item,
            category: item.category,
            binColor: item.binColor,
            confidence: item.confidence
          },
          feedback_type: feedbackType,
          description: description || null
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      return false;
    }
  };

  return { submitFeedback };
};
