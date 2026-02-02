import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Leaf, TrendingUp, Recycle, TreePine, Droplets } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";

interface WasteItem {
  item: string;
  category: string;
  disposal: string;
  binColor: string;
  confidence: number;
}

interface UploadHistory {
  id: string;
  predictions: WasteItem[];
  created_at: string;
}

interface CategoryStats {
  name: string;
  count: number;
  color: string;
}

interface TrendData {
  date: string;
  items: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Blue Bin": "#3b82f6",
  "Green Bin": "#22c55e",
  "Red Bin": "#ef4444",
  "Yellow Bin": "#eab308",
  "Black Bin": "#6b7280"
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<UploadHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        .select("id, predictions, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const parsed = (data || []).map(item => ({
        ...item,
        predictions: item.predictions as unknown as WasteItem[]
      }));
      
      setHistory(parsed);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const allItems = history.flatMap(h => h.predictions);
  const totalItems = allItems.length;
  const totalScans = history.length;

  // Category breakdown
  const categoryStats: CategoryStats[] = Object.entries(
    allItems.reduce((acc, item) => {
      const bin = item.binColor || "Unknown";
      acc[bin] = (acc[bin] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({
    name,
    count,
    color: CATEGORY_COLORS[name] || "#6b7280"
  }));

  // Weekly trend data
  const trendData: TrendData[] = (() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    return last7Days.map(date => {
      const dayItems = history
        .filter(h => h.created_at.startsWith(date))
        .reduce((sum, h) => sum + h.predictions.length, 0);
      return {
        date: new Date(date).toLocaleDateString("en-IN", { weekday: "short" }),
        items: dayItems
      };
    });
  })();

  // Environmental impact estimates
  const recyclableCount = allItems.filter(i => i.binColor?.includes("Blue")).length;
  const organicCount = allItems.filter(i => i.binColor?.includes("Green")).length;
  
  const co2Saved = recyclableCount * 0.5; // Estimated 0.5kg CO2 per recyclable item
  const waterSaved = recyclableCount * 10; // Estimated 10L water per recyclable item
  const treesEquivalent = co2Saved / 21; // A tree absorbs ~21kg CO2/year

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Waste Dashboard</h1>
              <p className="text-muted-foreground">Track your environmental impact</p>
            </div>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <Leaf className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No data yet</h2>
              <p className="text-muted-foreground mb-4">Start classifying waste to see your environmental impact!</p>
              <Button onClick={() => navigate("/")}>Classify Waste</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Waste Dashboard</h1>
            <p className="text-muted-foreground">Track your environmental impact</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Recycle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalItems}</p>
                  <p className="text-xs text-muted-foreground">Items Classified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-organic/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-organic" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalScans}</p>
                  <p className="text-xs text-muted-foreground">Total Scans</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-recyclable/10 rounded-lg">
                  <TreePine className="h-5 w-5 text-recyclable" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{co2Saved.toFixed(1)}kg</p>
                  <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Droplets className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{waterSaved}L</p>
                  <p className="text-xs text-muted-foreground">Water Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Waste by Category</CardTitle>
              <CardDescription>Distribution of classified items by bin type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      label={({ name, percent }) => `${name.replace(" Bin", "")} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Items classified over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="items" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Environmental Impact Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-organic/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              Your Environmental Impact
            </CardTitle>
            <CardDescription>Estimated positive impact from proper waste segregation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <TreePine className="h-8 w-8 mx-auto mb-2 text-organic" />
                <p className="text-2xl font-bold text-organic">{treesEquivalent.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Trees worth of CO₂</p>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Recycle className="h-8 w-8 mx-auto mb-2 text-recyclable" />
                <p className="text-2xl font-bold text-recyclable">{recyclableCount}</p>
                <p className="text-sm text-muted-foreground">Recyclable items diverted</p>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <Leaf className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-primary">{organicCount}</p>
                <p className="text-sm text-muted-foreground">Organic items composted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
