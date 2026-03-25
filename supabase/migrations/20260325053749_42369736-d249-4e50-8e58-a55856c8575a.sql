
-- Students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  rating NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Modules table
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  visible_to TEXT NOT NULL DEFAULT 'all',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Module contents table
CREATE TABLE public.module_contents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'note',
  url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Module visibility (for specific student assignments)
CREATE TABLE public.module_visibility (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(module_id, student_id)
);

-- Helpdesk posts
CREATE TABLE public.helpdesk_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Helpdesk comments
CREATE TABLE public.helpdesk_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.helpdesk_posts(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_ai BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin users table
CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default admin
INSERT INTO public.admins (username, password, name) VALUES ('admin', 'admin123', 'Admin');

-- Insert default students
INSERT INTO public.students (username, password, name, email, rating) VALUES
  ('student1', 'pass123', 'Rahim Ahmed', 'rahim@example.com', 4.5),
  ('student2', 'pass123', 'Fatima Khan', 'fatima@example.com', 4.0);

-- RLS: All tables publicly readable/writable since auth is manual (no Supabase Auth used)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Since this app uses manual auth (not Supabase Auth), allow public access
CREATE POLICY "Public access" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.modules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.module_contents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.module_visibility FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.helpdesk_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.helpdesk_comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON public.admins FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for helpdesk
ALTER PUBLICATION supabase_realtime ADD TABLE public.helpdesk_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.helpdesk_comments;
