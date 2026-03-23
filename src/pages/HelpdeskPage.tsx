import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { db, type HelpdeskPost } from "@/lib/mockData";
import { MessageCircle, Send, Bot } from "lucide-react";
import { toast } from "sonner";

export default function HelpdeskPage() {
  const [posts, setPosts] = useState<HelpdeskPost[]>(db.getHelpdesk());
  const [newPost, setNewPost] = useState("");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const user = db.getCurrentUser();

  const addPost = () => {
    if (!newPost.trim()) return;
    const post: HelpdeskPost = {
      id: Date.now().toString(),
      authorName: user?.name || "Anonymous",
      content: newPost,
      createdAt: new Date().toISOString(),
      comments: [],
    };
    const updated = [post, ...posts];
    setPosts(updated);
    db.setHelpdesk(updated);
    setNewPost("");
    toast.success("Question posted!");
  };

  const addComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            { id: Date.now().toString(), authorName: user?.name || "Anonymous", content: text, createdAt: new Date().toISOString() },
          ],
        };
      }
      return p;
    });
    setPosts(updated);
    db.setHelpdesk(updated);
    setCommentInputs({ ...commentInputs, [postId]: "" });
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

        {/* AI Assistant placeholder */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">AI Assistant</p>
            <p className="text-xs text-muted-foreground">AI-powered answers coming soon — API integration ready</p>
          </div>
        </motion.div>

        {/* Post input */}
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

        {/* Posts */}
        <div className="space-y-6">
          {posts.length === 0 && (
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
                  {post.authorName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{post.authorName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-sm text-foreground mb-4">{post.content}</p>

              {/* Comments */}
              {post.comments.length > 0 && (
                <div className="border-t border-border pt-3 space-y-3 mb-3">
                  {post.comments.map((c) => (
                    <div key={c.id} className="flex gap-2 pl-4">
                      <MessageCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{c.authorName} <span className="text-muted-foreground font-normal">· {new Date(c.createdAt).toLocaleDateString()}</span></p>
                        <p className="text-sm text-muted-foreground">{c.content}</p>
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
