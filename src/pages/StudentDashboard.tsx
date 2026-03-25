import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/mockData";
import { cloudDb, type Student, type ModuleWithContents } from "@/lib/supabaseDb";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, FileText, Star, LogOut, ChevronRight, Play, ExternalLink, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [modules, setModules] = useState<ModuleWithContents[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleWithContents | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const u = db.getCurrentUser();
    if (!u || u.role !== "student") { navigate("/login"); return; }
    loadData(u.id);
  }, [navigate]);

  const loadData = async (studentId: string) => {
    const s = await cloudDb.getStudentById(studentId);
    if (!s) { navigate("/login"); return; }
    setStudent(s);
    const mods = await cloudDb.getStudentModules(studentId);
    setModules(mods);
  };

  const handleLogout = () => { db.logout(); navigate("/"); toast.success("Logged out"); };

  if (!student) return null;

  const contentByType = (type: string) => selectedModule?.contents.filter((c) => c.type === type) || [];

  return (
    <div className="min-h-screen flex pt-16">
      <button
        className="fixed top-20 left-4 z-40 md:hidden w-10 h-10 rounded-lg glass flex items-center justify-center"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={`fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-card border-r border-border z-30 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
              {student.name[0]}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{student.name}</p>
              <p className="text-xs text-muted-foreground">{student.email}</p>
            </div>
          </div>
          {student.rating !== undefined && (
            <div className="mt-3 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-foreground">{student.rating}</span>
              <span className="text-xs text-muted-foreground">/ 5.0 rating</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">Modules</p>
          <div className="space-y-1">
            {modules.map((m) => (
              <button
                key={m.id}
                onClick={() => { setSelectedModule(m); setSidebarOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  selectedModule?.id === m.id ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="truncate">{m.title}</span>
                <ChevronRight className="w-3 h-3 ml-auto shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 min-w-0">
        {!selectedModule ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">Welcome, {student.name}!</h2>
            <p className="text-muted-foreground text-sm">Select a module from the sidebar to get started.</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={selectedModule.id}>
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">{selectedModule.title}</h2>
            <p className="text-sm text-muted-foreground mb-8">{selectedModule.description}</p>

            {contentByType("note").length > 0 && (
              <Section title="Class Notes" icon={<FileText className="w-5 h-5" />}>
                {contentByType("note").map((c) => (
                  <a key={c.id} href={c.url} target="_blank" rel="noreferrer" className="glass rounded-lg p-4 flex items-center gap-3 hover:scale-[1.01] transition-transform">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground">{c.title}</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                  </a>
                ))}
              </Section>
            )}

            {contentByType("video").length > 0 && (
              <Section title="Class Videos" icon={<Video className="w-5 h-5" />}>
                {contentByType("video").map((c) => (
                  <div key={c.id} className="glass rounded-lg overflow-hidden">
                    <p className="px-4 py-2 text-sm font-medium text-foreground flex items-center gap-2"><Play className="w-4 h-4 text-primary" />{c.title}</p>
                    <div className="aspect-video">
                      <iframe src={c.url} className="w-full h-full" allowFullScreen title={c.title} />
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {contentByType("assignment").length > 0 && (
              <Section title="Assignments" icon={<FileText className="w-5 h-5" />}>
                {contentByType("assignment").map((c) => (
                  <div key={c.id} className="glass rounded-lg p-4">
                    <p className="text-sm font-medium text-foreground mb-1">{c.title}</p>
                    {c.url.startsWith("http") ? (
                      <a href={c.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                        Open assignment <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">{c.url}</p>
                    )}
                  </div>
                ))}
              </Section>
            )}

            {contentByType("extra-video").length > 0 && (
              <Section title="Extra Videos" icon={<Video className="w-5 h-5" />}>
                {contentByType("extra-video").map((c) => (
                  <div key={c.id} className="glass rounded-lg overflow-hidden">
                    <p className="px-4 py-2 text-sm font-medium text-foreground">{c.title}</p>
                    <div className="aspect-video">
                      <iframe src={c.url} className="w-full h-full" allowFullScreen title={c.title} />
                    </div>
                  </div>
                ))}
              </Section>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-2 mb-4">
        {icon} {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
