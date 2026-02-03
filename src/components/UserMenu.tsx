import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, History, Shield, MapPin, BarChart3, Lightbulb } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "./AuthDialog";
import { useNavigate } from "react-router-dom";

export const UserMenu = () => {
  const { user, isAdmin, username, signOut } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Get display name: prefer username, fall back to email prefix
  const displayName = username || user?.email?.split("@")[0] || "User";

  if (!user) {
    return (
      <>
        <Button variant="outline" size="sm" onClick={() => setAuthDialogOpen(true)}>
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Button>
        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="h-4 w-4 mr-2" />
          {displayName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => navigate("/history")}>
          <History className="h-4 w-4 mr-2" />
          History
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/recycling-centers")}>
          <MapPin className="h-4 w-4 mr-2" />
          Recycling Centers
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/tips")}>
          <Lightbulb className="h-4 w-4 mr-2" />
          Eco Tips
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate("/admin")}>
            <Shield className="h-4 w-4 mr-2" />
            Admin Panel
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
