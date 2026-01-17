import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, X, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Waste categories and bin colors for correction
const WASTE_CATEGORIES = [
  "Recyclable",
  "Organic/Wet Waste", 
  "Hazardous",
  "E-Waste",
  "Non-Recyclable"
] as const;

const BIN_COLORS = [
  { value: "Blue", label: "Blue (Recyclable)" },
  { value: "Green", label: "Green (Organic/Wet)" },
  { value: "Red", label: "Red (Hazardous)" },
  { value: "Yellow", label: "Yellow (E-Waste)" },
  { value: "Black", label: "Black (Non-Recyclable)" },
] as const;

interface FeedbackSubmission {
  id: string;
  item_name: string;
  original_prediction: {
    item: string;
    category: string;
    binColor: string;
    confidence: number;
  };
  feedback_type: string;
  description: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  user_id: string | null;
}

interface LearnedCorrection {
  id: string;
  item_name: string;
  original_category: string;
  corrected_category: string | null;
  corrected_bin_color: string | null;
  correction_details: string | null;
  created_at: string;
}

interface CorrectionData {
  category: string;
  binColor: string;
}

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [feedbacks, setFeedbacks] = useState<FeedbackSubmission[]>([]);
  const [corrections, setCorrections] = useState<LearnedCorrection[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [correctionData, setCorrectionData] = useState<Record<string, CorrectionData>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [feedbackRes, correctionsRes] = await Promise.all([
        supabase
          .from("feedback_submissions")
          .select("*")
          .eq("feedback_type", "no")
          .order("created_at", { ascending: false }),
        supabase
          .from("learned_corrections")
          .select("*")
          .order("created_at", { ascending: false })
      ]);

      if (feedbackRes.error) throw feedbackRes.error;
      if (correctionsRes.error) throw correctionsRes.error;

      setFeedbacks(feedbackRes.data as unknown as FeedbackSubmission[] || []);
      setCorrections(correctionsRes.data as unknown as LearnedCorrection[] || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (feedback: FeedbackSubmission) => {
    setProcessingId(feedback.id);
    try {
      // Update feedback status
      const { error: updateError } = await supabase
        .from("feedback_submissions")
        .update({
          status: "approved",
          admin_notes: adminNotes[feedback.id] || null,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", feedback.id);

      if (updateError) throw updateError;

      // Create learned correction with admin's corrections
      const correction = correctionData[feedback.id];
      const { error: insertError } = await supabase
        .from("learned_corrections")
        .insert({
          feedback_id: feedback.id,
          item_name: feedback.item_name,
          original_category: feedback.original_prediction.category,
          corrected_category: correction?.category || null,
          corrected_bin_color: correction?.binColor || null,
          correction_details: feedback.description
        });

      if (insertError) throw insertError;

      toast({
        title: "Approved",
        description: "Correction has been saved",
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async (feedbackId: string) => {
    setProcessingId(feedbackId);
    try {
      const { error } = await supabase
        .from("feedback_submissions")
        .update({
          status: "denied",
          admin_notes: adminNotes[feedbackId] || null,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", feedbackId);

      if (error) throw error;

      toast({
        title: "Denied",
        description: "Feedback has been denied",
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingFeedbacks = feedbacks.filter(f => f.status === "pending");
  const reviewedFeedbacks = feedbacks.filter(f => f.status !== "pending");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-medium text-primary">{corrections.length}</span> learned corrections improving classification accuracy
            </p>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Review
              {pendingFeedbacks.length > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingFeedbacks.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="corrections">
              Learned Corrections
              <Badge variant="secondary" className="ml-2">{corrections.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingFeedbacks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No pending feedback to review</p>
                </CardContent>
              </Card>
            ) : (
              pendingFeedbacks.map((feedback) => (
                <Card key={feedback.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{feedback.item_name}</CardTitle>
                        <CardDescription>
                          {new Date(feedback.created_at).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {feedback.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Original Prediction</p>
                        <p>Category: {feedback.original_prediction.category}</p>
                        <p>Bin: {feedback.original_prediction.binColor}</p>
                        <p>Confidence: {feedback.original_prediction.confidence}%</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">User's Issue</p>
                        <p className="text-foreground">{feedback.description || "No description"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Correct Category</Label>
                        <Select
                          value={correctionData[feedback.id]?.category || ""}
                          onValueChange={(value) => setCorrectionData(prev => ({
                            ...prev,
                            [feedback.id]: { ...prev[feedback.id], category: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category..." />
                          </SelectTrigger>
                          <SelectContent>
                            {WASTE_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Correct Bin Color</Label>
                        <Select
                          value={correctionData[feedback.id]?.binColor || ""}
                          onValueChange={(value) => setCorrectionData(prev => ({
                            ...prev,
                            [feedback.id]: { ...prev[feedback.id], binColor: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select bin color..." />
                          </SelectTrigger>
                          <SelectContent>
                            {BIN_COLORS.map((bin) => (
                              <SelectItem key={bin.value} value={bin.value}>{bin.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Admin Notes (optional)</label>
                      <Textarea
                        placeholder="Add notes about this feedback..."
                        value={adminNotes[feedback.id] || ""}
                        onChange={(e) => setAdminNotes(prev => ({
                          ...prev,
                          [feedback.id]: e.target.value
                        }))}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(feedback)}
                        disabled={processingId === feedback.id}
                        className="flex-1"
                      >
                        {processingId === feedback.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Approve & Learn
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeny(feedback.id)}
                        disabled={processingId === feedback.id}
                        className="flex-1"
                      >
                        {processingId === feedback.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <X className="h-4 w-4 mr-2" />
                        )}
                        Deny
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="reviewed" className="space-y-4">
            {reviewedFeedbacks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No reviewed feedback yet</p>
                </CardContent>
              </Card>
            ) : (
              reviewedFeedbacks.map((feedback) => (
                <Card key={feedback.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{feedback.item_name}</CardTitle>
                        <CardDescription>
                          {new Date(feedback.created_at).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={feedback.status === "approved" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {feedback.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feedback.description || "No description provided"}
                    </p>
                    {feedback.admin_notes && (
                      <p className="text-sm mt-2">
                        <span className="font-medium">Admin notes:</span> {feedback.admin_notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="corrections" className="space-y-4">
            {corrections.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No learned corrections yet</p>
                </CardContent>
              </Card>
            ) : (
              corrections.map((correction) => (
                <Card key={correction.id}>
                  <CardHeader>
                    <CardTitle>{correction.item_name}</CardTitle>
                    <CardDescription>
                      {new Date(correction.created_at).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">Original:</span> {correction.original_category}
                      </p>
                      {correction.corrected_category && (
                        <p>
                          <span className="text-muted-foreground">Corrected to:</span> {correction.corrected_category}
                        </p>
                      )}
                      {correction.correction_details && (
                        <p className="mt-2 text-muted-foreground">{correction.correction_details}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
