import { motion } from "framer-motion";
import { Target, Eye, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-4">
            About <span className="gradient-text">JR Classroom</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            JR Classroom is a modern digital learning platform designed to make education accessible, interactive, and effective for every student.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-8 mb-8">
          <p className="text-muted-foreground leading-relaxed">
            Founded with the belief that quality education should be available to everyone, JR Classroom brings together cutting-edge technology and thoughtful pedagogy. Our platform offers structured learning modules, video lectures, comprehensive notes, and interactive assignments — all within a secure, admin-managed environment that ensures a focused and safe learning space.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Target, title: "Our Mission", desc: "To provide affordable and smart education through technology, making high-quality learning resources accessible to students across Bangladesh and beyond." },
            { icon: Eye, title: "Our Vision", desc: "Empowering students with technology-driven education that bridges gaps, builds skills, and creates opportunities for a brighter future." },
            { icon: Heart, title: "Our Values", desc: "We value inclusivity, innovation, and the relentless pursuit of educational excellence. Every student deserves the chance to grow." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass rounded-xl p-6 text-center"
            >
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold mb-2 text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
