import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTranslation, Language } from "@/lib/translations";

interface WasteItem {
  item: string;
  category: string;
  disposal: string;
  binColor: string;
  confidence: number;
}

interface UploadHistory {
  id: string;
  image_url: string;
  signed_url?: string;
  predictions: WasteItem[];
  created_at: string;
}

const getBinColorClass = (binColor: string) => {
  const color = binColor.toLowerCase();
  if (color.includes("blue")) return "bg-recyclable";
  if (color.includes("green")) return "bg-organic";
  if (color.includes("red")) return "bg-hazardous";
  if (color.includes("yellow")) return "bg-yellow-500";
  return "bg-muted";
};

const History = () => {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<UploadHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>("English");
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = (key: string) => getTranslation(language, key as any);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage) setLanguage(savedLanguage as Language);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("upload_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Parse predictions and get signed URLs for images
      const parsedWithUrls = await Promise.all(
        (data || []).map(async (item) => {
          // Generate signed URL for the image (1 hour expiry)
          const { data: signedUrlData } = await supabase.storage
            .from("waste-images")
            .createSignedUrl(item.image_url, 3600);
          
          return {
            ...item,
            predictions: item.predictions as unknown as WasteItem[],
            signed_url: signedUrlData?.signedUrl || ''
          };
        })
      );
      
      setHistory(parsedWithUrls);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("upload_history")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setHistory(prev => prev.filter(h => h.id !== id));
      toast({
        title: t("deleteEntry"),
        description: t("deletedEntry"),
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{t("historyTitle")}</h1>
        </div>

        {history.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t("historyEmpty")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <Card key={entry.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleString()}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(entry.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <img
                      src={entry.signed_url || ''}
                      alt="Uploaded waste"
                      className="w-24 h-24 object-cover rounded-lg border border-border"
                    />
                    <div className="flex-1">
                      {entry.predictions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {entry.predictions.map((pred, idx) => (
                            <Badge
                              key={idx}
                              className={`${getBinColorClass(pred.binColor)} text-white`}
                            >
                              {pred.item}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">{t("noWasteDetected")}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
