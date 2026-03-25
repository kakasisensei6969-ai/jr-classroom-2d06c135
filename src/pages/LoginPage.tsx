import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cloudDb } from "@/lib/supabaseDb";
import { db } from "@/lib/mockData";
import { GraduationCap, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState<"student" | "admin">("student");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await cloudDb.login(username, password);
      if (!result) {
        toast.error("Invalid credentials");
        return;
      }
      if (loginType === "admin" && result.role !== "admin") {
        toast.error("Not an admin account");
        return;
      }
      if (loginType === "student" && result.role !== "student") {
        toast.error("Not a student account");
        return;
      }
      // Store current user in localStorage for session (lightweight)
      const sessionUser = {
        id: result.user.id,
        username: (result.user as any).username,
        password: "",
        role: result.role,
        name: result.user.name,
        email: (result.user as any).email || "",
        rating: (result.user as any).rating || 0,
        assignedModules: [],
      };
      db.setCurrentUser(sessionUser);
      toast.success(`Welcome, ${result.user.name}!`);
      navigate(result.role === "admin" ? "/admin" : "/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      <div className="absolute inset-0 gradient-hero opacity-5" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
        <div className="glass rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold gradient-text">JR Classroom</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>

          <div className="flex rounded-lg bg-muted p-1 mb-6">
            {(["student", "admin"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setLoginType(type)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  loginType === type ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {type === "student" ? <GraduationCap className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                {type === "student" ? "Student" : "Admin"}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sign In
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Accounts are created by administrators only.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
