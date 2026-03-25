import { supabase } from "@/integrations/supabase/client";

export interface Student {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string | null;
  rating: number;
  created_at: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  visible_to: string; // "all" or "specific"
  created_at: string;
}

export interface ModuleContent {
  id: string;
  module_id: string;
  title: string;
  type: string;
  url: string;
  created_at: string;
}

export interface ModuleVisibility {
  id: string;
  module_id: string;
  student_id: string;
}

export interface HelpdeskPost {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface HelpdeskComment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  is_ai: boolean;
  created_at: string;
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  name: string;
}

// Enriched module with contents and visibility info
export interface ModuleWithContents extends Module {
  contents: ModuleContent[];
  visibleStudentIds: string[];
}

export const cloudDb = {
  // ─── Auth ───
  async login(username: string, password: string): Promise<{ role: "student" | "admin"; user: Student | Admin } | null> {
    // Check admins first
    const { data: admin } = await supabase
      .from("admins")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .maybeSingle();
    if (admin) return { role: "admin", user: admin as Admin };

    const { data: student } = await supabase
      .from("students")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .maybeSingle();
    if (student) return { role: "student", user: student as Student };

    return null;
  },

  // ─── Students ───
  async getStudents(): Promise<Student[]> {
    const { data } = await supabase.from("students").select("*").order("created_at");
    return (data || []) as Student[];
  },

  async upsertStudent(student: Partial<Student> & { username: string; password: string; name: string }): Promise<Student | null> {
    if (student.id) {
      const { data } = await supabase.from("students").update(student).eq("id", student.id).select().single();
      return data as Student | null;
    }
    const { data } = await supabase.from("students").insert(student).select().single();
    return data as Student | null;
  },

  async deleteStudent(id: string) {
    await supabase.from("students").delete().eq("id", id);
  },

  async updateRating(studentId: string, rating: number) {
    await supabase.from("students").update({ rating }).eq("id", studentId);
  },

  async getStudentById(id: string): Promise<Student | null> {
    const { data } = await supabase.from("students").select("*").eq("id", id).maybeSingle();
    return data as Student | null;
  },

  // ─── Modules ───
  async getModulesWithContents(): Promise<ModuleWithContents[]> {
    const { data: modules } = await supabase.from("modules").select("*").order("created_at");
    if (!modules) return [];

    const { data: contents } = await supabase.from("module_contents").select("*").order("created_at");
    const { data: visibility } = await supabase.from("module_visibility").select("*");

    return (modules as Module[]).map((m) => ({
      ...m,
      contents: (contents || []).filter((c: any) => c.module_id === m.id) as ModuleContent[],
      visibleStudentIds: (visibility || []).filter((v: any) => v.module_id === m.id).map((v: any) => v.student_id),
    }));
  },

  async getStudentModules(studentId: string): Promise<ModuleWithContents[]> {
    const all = await this.getModulesWithContents();
    return all.filter(
      (m) => m.visible_to === "all" || m.visibleStudentIds.includes(studentId)
    );
  },

  async upsertModule(mod: { id?: string; title: string; description: string; visible_to: string; studentIds?: string[] }): Promise<string | null> {
    let moduleId: string;
    if (mod.id) {
      await supabase.from("modules").update({ title: mod.title, description: mod.description, visible_to: mod.visible_to }).eq("id", mod.id);
      moduleId = mod.id;
    } else {
      const { data } = await supabase.from("modules").insert({ title: mod.title, description: mod.description, visible_to: mod.visible_to }).select("id").single();
      if (!data) return null;
      moduleId = data.id;
    }

    // Update visibility
    await supabase.from("module_visibility").delete().eq("module_id", moduleId);
    if (mod.visible_to === "specific" && mod.studentIds && mod.studentIds.length > 0) {
      await supabase.from("module_visibility").insert(
        mod.studentIds.map((sid) => ({ module_id: moduleId, student_id: sid }))
      );
    }

    return moduleId;
  },

  async deleteModule(id: string) {
    await supabase.from("modules").delete().eq("id", id);
  },

  // ─── Module Contents ───
  async upsertContent(content: Partial<ModuleContent> & { module_id: string; title: string; type: string; url: string }): Promise<ModuleContent | null> {
    if (content.id) {
      const { data } = await supabase.from("module_contents").update({ title: content.title, type: content.type, url: content.url }).eq("id", content.id).select().single();
      return data as ModuleContent | null;
    }
    const { data } = await supabase.from("module_contents").insert({ module_id: content.module_id, title: content.title, type: content.type, url: content.url }).select().single();
    return data as ModuleContent | null;
  },

  async deleteContent(id: string) {
    await supabase.from("module_contents").delete().eq("id", id);
  },

  // ─── Helpdesk ───
  async getHelpdeskPosts(): Promise<(HelpdeskPost & { comments: HelpdeskComment[] })[]> {
    const { data: posts } = await supabase.from("helpdesk_posts").select("*").order("created_at", { ascending: false });
    if (!posts) return [];

    const { data: comments } = await supabase.from("helpdesk_comments").select("*").order("created_at");

    return (posts as HelpdeskPost[]).map((p) => ({
      ...p,
      comments: (comments || []).filter((c: any) => c.post_id === p.id) as HelpdeskComment[],
    }));
  },

  async addHelpdeskPost(authorName: string, content: string): Promise<HelpdeskPost | null> {
    const { data } = await supabase.from("helpdesk_posts").insert({ author_name: authorName, content }).select().single();
    return data as HelpdeskPost | null;
  },

  async addHelpdeskComment(postId: string, authorName: string, content: string, isAi = false): Promise<HelpdeskComment | null> {
    const { data } = await supabase.from("helpdesk_comments").insert({ post_id: postId, author_name: authorName, content, is_ai: isAi }).select().single();
    return data as HelpdeskComment | null;
  },
};
