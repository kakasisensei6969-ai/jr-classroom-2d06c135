import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/mockData";
import { cloudDb, type Student, type ModuleWithContents } from "@/lib/supabaseDb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, BookOpen, LogOut, Plus, Trash2, Edit, Star, Save, X, Menu,
  ChevronRight, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Tab = "students" | "modules";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("students");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [editStudent, setEditStudent] = useState<Partial<Student>>({});

  const [modules, setModules] = useState<ModuleWithContents[]>([]);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [editModule, setEditModule] = useState<{ id?: string; title: string; description: string; visible_to: string; studentIds: string[] }>({ title: "", description: "", visible_to: "all", studentIds: [] });
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [editContent, setEditContent] = useState<{ id?: string; moduleId: string; title: string; type: string; url: string }>({ moduleId: "", title: "", type: "note", url: "" });

  const [ratingDialog, setRatingDialog] = useState<{ studentId: string; rating: number } | null>(null);

  useEffect(() => {
    const u = db.getCurrentUser();
    if (!u || u.role !== "admin") { navigate("/login"); return; }
    setAdmin(u);
    refreshData();
  }, [navigate]);

  const refreshData = async () => {
    setLoading(true);
    const [s, m] = await Promise.all([cloudDb.getStudents(), cloudDb.getModulesWithContents()]);
    setStudents(s);
    setModules(m);
    setLoading(false);
  };

  const handleLogout = () => { db.logout(); navigate("/"); toast.success("Logged out"); };

  const saveStudent = async () => {
    await cloudDb.upsertStudent({
      id: editStudent.id,
      username: editStudent.username || "",
      password: editStudent.password || "",
      name: editStudent.name || "",
      email: editStudent.email || "",
    } as any);
    setShowStudentDialog(false);
    setEditStudent({});
    await refreshData();
    toast.success("Student saved!");
  };

  const deleteStudent = async (id: string) => {
    await cloudDb.deleteStudent(id);
    await refreshData();
    toast.success("Student deleted");
  };

  const saveRating = async () => {
    if (!ratingDialog) return;
    await cloudDb.updateRating(ratingDialog.studentId, ratingDialog.rating);
    setRatingDialog(null);
    await refreshData();
    toast.success("Rating updated!");
  };

  const saveModule = async () => {
    await cloudDb.upsertModule({
      id: editModule.id,
      title: editModule.title,
      description: editModule.description,
      visible_to: editModule.visible_to,
      studentIds: editModule.studentIds,
    });
    setShowModuleDialog(false);
    setEditModule({ title: "", description: "", visible_to: "all", studentIds: [] });
    await refreshData();
    toast.success("Module saved!");
  };

  const deleteModule = async (id: string) => {
    await cloudDb.deleteModule(id);
    await refreshData();
    toast.success("Module deleted");
  };

  const saveContent = async () => {
    await cloudDb.upsertContent({
      id: editContent.id,
      module_id: editContent.moduleId,
      title: editContent.title,
      type: editContent.type,
      url: editContent.url,
    });
    setShowContentDialog(false);
    setEditContent({ moduleId: "", title: "", type: "note", url: "" });
    await refreshData();
    toast.success("Content saved!");
  };

  const deleteContent = async (contentId: string) => {
    await cloudDb.deleteContent(contentId);
    await refreshData();
    toast.success("Content deleted");
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen flex pt-16">
      <button
        className="fixed top-20 left-4 z-40 md:hidden w-10 h-10 rounded-lg glass flex items-center justify-center"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={`fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border z-30 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center font-bold text-primary-foreground">A</div>
            <div>
              <p className="font-semibold text-sm text-foreground">Admin Panel</p>
              <p className="text-xs text-muted-foreground">{admin.name}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 p-3 space-y-1">
          {([["students", Users, "Students"], ["modules", BookOpen, "Modules"]] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                tab === key ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" /> {label} <ChevronRight className="w-3 h-3 ml-auto" />
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 min-w-0">
        {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}

        {!loading && tab === "students" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Students</h2>
              <Button variant="hero" size="sm" onClick={() => { setEditStudent({}); setShowStudentDialog(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Student
              </Button>
            </div>
            <div className="grid gap-4">
              {students.map((s) => (
                <div key={s.id} className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center font-bold text-primary-foreground shrink-0">
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">@{s.username} · {s.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button size="sm" variant="ghost" onClick={() => setRatingDialog({ studentId: s.id, rating: Number(s.rating) || 0 })}>
                      <Star className="w-4 h-4 mr-1 text-yellow-500" /> {s.rating || 0}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditStudent(s); setShowStudentDialog(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteStudent(s.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {!loading && tab === "modules" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Modules</h2>
              <Button variant="hero" size="sm" onClick={() => { setEditModule({ title: "", description: "", visible_to: "all", studentIds: [] }); setShowModuleDialog(true); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Module
              </Button>
            </div>
            <div className="space-y-4">
              {modules.map((m) => (
                <div key={m.id} className="glass rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display font-semibold text-foreground">{m.title}</h3>
                      <p className="text-sm text-muted-foreground">{m.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Visible to: {m.visible_to === "all" ? "All students" : `${m.visibleStudentIds.length} specific students`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setEditModule({ id: m.id, title: m.title, description: m.description, visible_to: m.visible_to, studentIds: m.visibleStudentIds }); setShowModuleDialog(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteModule(m.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {m.contents.map((c) => (
                      <div key={c.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                        <div>
                          <span className="text-xs font-medium uppercase text-muted-foreground">{c.type}</span>
                          <p className="text-sm text-foreground">{c.title}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setEditContent({ id: c.id, moduleId: m.id, title: c.title, type: c.type, url: c.url }); setShowContentDialog(true); }}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteContent(c.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => { setEditContent({ moduleId: m.id, title: "", type: "note", url: "" }); setShowContentDialog(true); }}>
                    <Plus className="w-3 h-3 mr-1" /> Add Content
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Student Dialog */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editStudent.id ? "Edit" : "Add"} Student</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Full Name" value={editStudent.name || ""} onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })} />
            <Input placeholder="Username" value={editStudent.username || ""} onChange={(e) => setEditStudent({ ...editStudent, username: e.target.value })} />
            <Input placeholder="Email" value={editStudent.email || ""} onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })} />
            <Input type="password" placeholder="Password" value={editStudent.password || ""} onChange={(e) => setEditStudent({ ...editStudent, password: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="hero" onClick={saveStudent}><Save className="w-4 h-4 mr-1" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editModule.id ? "Edit" : "Add"} Module</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Module Title" value={editModule.title} onChange={(e) => setEditModule({ ...editModule, title: e.target.value })} />
            <Textarea placeholder="Description" value={editModule.description} onChange={(e) => setEditModule({ ...editModule, description: e.target.value })} />
            <Select
              value={editModule.visible_to === "all" ? "all" : "specific"}
              onValueChange={(v) => setEditModule({ ...editModule, visible_to: v, studentIds: v === "all" ? [] : editModule.studentIds })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="specific">Specific Students</SelectItem>
              </SelectContent>
            </Select>
            {editModule.visible_to === "specific" && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Select students:</p>
                {students.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={editModule.studentIds.includes(s.id)}
                      onChange={(e) => {
                        setEditModule({
                          ...editModule,
                          studentIds: e.target.checked ? [...editModule.studentIds, s.id] : editModule.studentIds.filter((id) => id !== s.id),
                        });
                      }}
                    />
                    {s.name}
                  </label>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="hero" onClick={saveModule}><Save className="w-4 h-4 mr-1" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Dialog */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editContent.id ? "Edit" : "Add"} Content</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Content Title" value={editContent.title} onChange={(e) => setEditContent({ ...editContent, title: e.target.value })} />
            <Select value={editContent.type} onValueChange={(v) => setEditContent({ ...editContent, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="note">Class Note</SelectItem>
                <SelectItem value="video">Class Video</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="extra-video">Extra Video</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder={editContent.type === "assignment" ? "Assignment text or Drive link" : "URL (Drive link or YouTube embed URL)"} value={editContent.url} onChange={(e) => setEditContent({ ...editContent, url: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="hero" onClick={saveContent}><Save className="w-4 h-4 mr-1" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={!!ratingDialog} onOpenChange={() => setRatingDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Set Student Rating</DialogTitle></DialogHeader>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={ratingDialog?.rating || 0}
              onChange={(e) => ratingDialog && setRatingDialog({ ...ratingDialog, rating: parseFloat(e.target.value) || 0 })}
            />
            <span className="text-sm text-muted-foreground">/ 5.0</span>
          </div>
          <DialogFooter>
            <Button variant="hero" onClick={saveRating}><Save className="w-4 h-4 mr-1" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
