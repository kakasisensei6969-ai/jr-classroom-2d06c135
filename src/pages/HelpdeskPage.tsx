import { useState, useEffect } from "react"; //m
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cloudDb, type HelpdeskPost, type HelpdeskComment } from "@/lib/supabaseDb";
import { db } from "@/lib/mockData";
import { MessageCircle, Send, Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type PostWithComments = HelpdeskPost & { comments: HelpdeskComment[] };

export default function HelpdeskPage() {
  const [posts, setPosts] = useState<PostWithComments[]>([]);
  const [newPost, setNewPost] = useState("");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const user = db.getCurrentUser();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await cloudDb.getHelpdeskPosts();
    setPosts(data);
    setLoading(false);
  };

  const getAiReply = async (postId: string, question: string) => {
    setAiLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("helpdesk-ai", {
        body: { question },
      });
      if (error) throw error;
      const reply = data?.reply || "Could not generate a response.";
      await cloudDb.addHelpdeskComment(postId, "🤖 AI Assistant", reply, true);
      await loadPosts();
    } catch (err) {
      console.error("AI reply error:", err);
      toast.error("AI assistant could not respond right now.");
    } finally {
      setAiLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const addPost = async () => {
    if (!newPost.trim()) return;
    const authorName = user?.name || "Anonymous";
    const post = await cloudDb.addHelpdeskPost(authorName, newPost);
    if (!post) { toast.error("Failed to post"); return; }
    setNewPost("");
    toast.success("Question posted!");
    await loadPosts();
    getAiReply(post.id, post.content);
  };

  const addComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    await cloudDb.addHelpdeskComment(postId, user?.name || "Anonymous", text);
    setCommentInputs({ ...commentInputs, [postId]: "" });
    await loadPosts();
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">
            <span className="gradient-text">Helpdesk</span>
          </h1>
          <p className="text-muted-foreground">Ask questions, get answers from the community</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">AI Assistant</p>
            <p className="text-xs text-muted-foreground">Powered by AI — auto-replies to every question</p>
          </div>
        </motion.div>

        <div className="glass rounded-xl p-4 mb-8">
          <Textarea
            placeholder="Describe your problem or question..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <Button onClick={addPost} variant="hero" size="sm">
              <Send className="w-4 h-4 mr-1" /> Post Question
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {loading && <p className="text-center text-muted-foreground py-12">Loading...</p>}
          {!loading && posts.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No questions yet. Be the first to ask!</p>
          )}
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {post.author_name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{post.author_name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-sm text-foreground mb-4">{post.content}</p>

              {aiLoading[post.id] && (
                <div className="border-t border-border pt-3 mb-3 flex items-center gap-2 pl-4 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs">AI Assistant is thinking...</span>
                </div>
              )}

              {post.comments.length > 0 && (
                <div className="border-t border-border pt-3 space-y-3 mb-3">
                  {post.comments.map((c) => (
                    <div key={c.id} className={`flex gap-2 pl-4 ${c.is_ai ? "bg-accent/30 rounded-lg p-2 -ml-2" : ""}`}>
                      {c.is_ai ? (
                        <Bot className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      ) : (
                        <MessageCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-medium text-foreground">{c.author_name} <span className="text-muted-foreground font-normal">· {new Date(c.created_at).toLocaleDateString()}</span></p>
                        <div className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {c.content}
  </ReactMarkdown>
</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={commentInputs[post.id] || ""}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addComment(post.id)}
                  className="text-sm"
                />
                <Button size="sm" variant="ghost" onClick={() => addComment(post.id)}>
                  Reply
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
