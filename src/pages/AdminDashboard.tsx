import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, type User, type Module, type ModuleContent } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, BookOpen, LogOut, Plus, Trash2, Edit, Star, Save, X, Menu,
  ChevronRight,
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
  const [admin, setAdmin] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("students");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Students
  const [students, setStudents] = useState<User[]>([]);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [editStudent, setEditStudent] = useState<Partial<User>>({});

  // Modules
  const [modules, setModules] = useState<Module[]>([]);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [editModule, setEditModule] = useState<Partial<Module>>({});
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [editContent, setEditContent] = useState<Partial<ModuleContent & { moduleId: string }>>({});

  // Rating
  const [ratingDialog, setRatingDialog] = useState<{ studentId: string; rating: number } | null>(null);

  useEffect(() => {
    const u = db.getCurrentUser();
    if (!u || u.role !== "admin") { navigate("/login"); return; }
    setAdmin(u);
    refreshData();
  }, [navigate]);

  const refreshData = () => {
    const allUsers = db.getUsers();
    setStudents(allUsers.filter((u) => u.role === "student"));
    setModules(db.getModules());
  };

  const handleLogout = () => { db.logout(); navigate("/"); toast.success("Logged out"); };

  // Student CRUD
  const saveStudent = () => {
    const users = db.getUsers();
    if (editStudent.id) {
      const updated = users.map((u) => u.id === editStudent.id ? { ...u, ...editStudent } as User : u);
      db.setUsers(updated);
    } else {
      const newUser: User = {
        id: "s" + Date.now(),
        username: editStudent.username || "",
        password: editStudent.password || "",
        role: "student",
        name: editStudent.name || "",
        email: editStudent.email || "",
        rating: 0,
        assignedModules: [],
      };
      db.setUsers([...users, newUser]);
    }
    setShowStudentDialog(false);
    setEditStudent({});
    refreshData();
    toast.success("Student saved!");
  };

  const deleteStudent = (id: string) => {
    db.setUsers(db.getUsers().filter((u) => u.id !== id));
    refreshData();
    toast.success("Student deleted");
  };

  const saveRating = () => {
    if (!ratingDialog) return;
    const users = db.getUsers();
    const updated = users.map((u) => u.id === ratingDialog.studentId ? { ...u, rating: ratingDialog.rating } : u);
    db.setUsers(updated);
    setRatingDialog(null);
    refreshData();
    toast.success("Rating updated!");
  };

  // Module CRUD
  const saveModule = () => {
    const mods = db.getModules();
    if (editModule.id) {
      const updated = mods.map((m) => m.id === editModule.id ? { ...m, ...editModule } as Module : m);
      db.setModules(updated);
    } else {
      const newMod: Module = {
        id: "m" + Date.now(),
        title: editModule.title || "",
        description: editModule.description || "",
        contents: [],
        visibleTo: editModule.visibleTo || "all",
      };
      db.setModules([...mods, newMod]);
    }
    setShowModuleDialog(false);
    setEditModule({});
    refreshData();
    toast.success("Module saved!");
  };

  const deleteModule = (id: string) => {
    db.setModules(db.getModules().filter((m) => m.id !== id));
    refreshData();
    toast.success("Module deleted");
  };

  const saveContent = () => {
    if (!editContent.moduleId) return;
    const mods = db.getModules();
    const updated = mods.map((m) => {
      if (m.id !== editContent.moduleId) return m;
      if (editContent.id && m.contents.some((c) => c.id === editContent.id)) {
        return { ...m, contents: m.contents.map((c) => c.id === editContent.id ? { ...c, ...editContent } as ModuleContent : c) };
      }
      const newContent: ModuleContent = {
        id: "c" + Date.now(),
        title: editContent.title || "",
        type: (editContent.type as ModuleContent["type"]) || "note",
        url: editContent.url || "",
      };
      return { ...m, contents: [...m.contents, newContent] };
    });
    db.setModules(updated);
    setShowContentDialog(false);
    setEditContent({});
    refreshData();
    toast.success("Content saved!");
  };

  const deleteContent = (moduleId: string, contentId: string) => {
    const mods = db.getModules();
    const updated = mods.map((m) => m.id === moduleId ? { ...m, contents: m.contents.filter((c) => c.id !== contentId) } : m);
    db.setModules(updated);
    refreshData();
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
        {tab === "students" && (
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
                    <Button size="sm" variant="ghost" onClick={() => setRatingDialog({ studentId: s.id, rating: s.rating || 0 })}>
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

        {tab === "modules" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Modules</h2>
              <Button variant="hero" size="sm" onClick={() => { setEditModule({}); setShowModuleDialog(true); }}>
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
                        Visible to: {m.visibleTo === "all" ? "All students" : `${(m.visibleTo as string[]).length} specific students`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setEditModule(m); setShowModuleDialog(true); }}>
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
                          <Button size="sm" variant="ghost" onClick={() => { setEditContent({ ...c, moduleId: m.id }); setShowContentDialog(true); }}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteContent(m.id, c.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => { setEditContent({ moduleId: m.id }); setShowContentDialog(true); }}>
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
            <Input placeholder="Module Title" value={editModule.title || ""} onChange={(e) => setEditModule({ ...editModule, title: e.target.value })} />
            <Textarea placeholder="Description" value={editModule.description || ""} onChange={(e) => setEditModule({ ...editModule, description: e.target.value })} />
            <Select
              value={editModule.visibleTo === "all" || !editModule.visibleTo ? "all" : "specific"}
              onValueChange={(v) => setEditModule({ ...editModule, visibleTo: v === "all" ? "all" : [] })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="specific">Specific Students</SelectItem>
              </SelectContent>
            </Select>
            {Array.isArray(editModule.visibleTo) && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Select students:</p>
                {students.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={(editModule.visibleTo as string[]).includes(s.id)}
                      onChange={(e) => {
                        const current = editModule.visibleTo as string[];
                        setEditModule({
                          ...editModule,
                          visibleTo: e.target.checked ? [...current, s.id] : current.filter((id) => id !== s.id),
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
            <Input placeholder="Content Title" value={editContent.title || ""} onChange={(e) => setEditContent({ ...editContent, title: e.target.value })} />
            <Select value={editContent.type || "note"} onValueChange={(v) => setEditContent({ ...editContent, type: v as ModuleContent["type"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="note">Class Note</SelectItem>
                <SelectItem value="video">Class Video</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
                <SelectItem value="extra-video">Extra Video</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder={editContent.type === "assignment" ? "Assignment text or Drive link" : "URL (Drive link or YouTube embed URL)"} value={editContent.url || ""} onChange={(e) => setEditContent({ ...editContent, url: e.target.value })} />
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
