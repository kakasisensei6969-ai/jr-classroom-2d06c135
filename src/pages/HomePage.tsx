import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Users, Sparkles, Monitor, Shield } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: BookOpen, title: "Interactive Learning", desc: "Engage with rich multimedia content and structured modules." },
  { icon: Brain, title: "AI-Powered Help", desc: "Get instant assistance through our intelligent helpdesk." },
  { icon: Users, title: "Collaborative Space", desc: "Connect with peers, ask questions, and grow together." },
  { icon: Monitor, title: "Video Lectures", desc: "Watch embedded video lessons anytime, anywhere." },
  { icon: Shield, title: "Secure Platform", desc: "Admin-managed accounts ensure a safe learning environment." },
  { icon: Sparkles, title: "Smart Ratings", desc: "Track your progress with personalized performance ratings." },
];

const benefits = [
  { title: "Structured Curriculum", desc: "Organized modules with notes, videos, and assignments for systematic learning." },
  { title: "Accessible Anywhere", desc: "Learn from any device — mobile, tablet, or desktop — anytime you want." },
  { title: "Personalized Experience", desc: "Modules tailored to individual students with progress tracking and ratings." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-60 h-60 rounded-full bg-secondary/10 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" /> Modern Digital Learning Platform
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Welcome to <span className="gradient-text">JR Classroom</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light mb-8">
              Learn Smart, Grow Faster
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button variant="hero" size="lg" className="text-base px-8">
                  Get Started
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="glass" size="lg" className="text-base px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-bold text-center mb-12"
          >
            Why Choose <span className="gradient-text">JR Classroom?</span>
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-xl p-6 hover:scale-[1.02] transition-transform"
              >
                <h3 className="font-display font-semibold text-lg mb-2 text-foreground">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-bold text-center mb-4"
          >
            Powerful <span className="gradient-text">Features</span>
          </motion.h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Everything you need for an exceptional learning experience
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 group hover:scale-[1.03] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold mb-2 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
