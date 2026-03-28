import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold gradient-text">JR Classroom</span>
            </div>
            <p className="text-sm text-muted-foreground">Learn Smart, Grow Faster</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {["/about", "/contact", "/helpdesk"].map((p) => (
                <Link key={p} to={p} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {p.slice(1).charAt(0).toUpperCase() + p.slice(2)}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Contact</h4>
            <p className="text-sm text-muted-foreground">m.jahidrayhanjkt@gmail.com</p>
            <p className="text-sm text-muted-foreground">+8801765283585</p>
            <p className="text-sm text-muted-foreground">Dhaka, Bangladesh</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} JR Classroom. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
