"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Container from "./Container";
import Logo from "./Logo";
import { cn } from "@/lib/utils";
import { btnPrimary, btnGhost } from "./button-styles";

const navLinks = [
  { label: "How it works", href: "#how" },
  { label: "The marketplace", href: "#marketplace" },
  { label: "For partners", href: "#partners" },
  { label: "About", href: "#about" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-cream/80 backdrop-blur border-b border-line">
      <Container>
        <div className="flex items-center justify-between h-[var(--nav-h)]">
          {/* Logo */}
          <Logo href="/" aria-label="Keyz home" />

          {/* Desktop nav links — hidden below md */}
          <div className="hidden md:flex gap-[30px] text-[15px] text-brandmuted font-medium">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-navy transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs — hidden below md */}
          <div className="hidden md:flex items-center gap-3">
            <a href="#" className={btnGhost}>
              Sign in
            </a>
            <a href="#" className={btnPrimary}>
              Check my readiness
            </a>
          </div>

          {/* Hamburger button — visible below md only */}
          <button
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg text-navy hover:bg-line/40 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      {/* Mobile dropdown panel */}
      {open && (
        <div className="md:hidden bg-cream border-b border-line">
          <Container>
            <div className="py-4 flex flex-col">
              {/* Stacked nav links */}
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center min-h-[44px] text-[15px] font-medium text-brandmuted hover:text-navy transition-colors border-b border-line/60 last:border-b-0"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              {/* Sign in + CTA at the bottom */}
              <div className="pt-4 flex flex-col gap-3">
                <a
                  href="#"
                  className={cn(btnGhost, "w-full text-center min-h-[44px] flex items-center justify-center")}
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </a>
                <a
                  href="#"
                  className={cn(btnPrimary, "w-full flex items-center justify-center min-h-[44px]")}
                  onClick={() => setOpen(false)}
                >
                  Check my readiness
                </a>
              </div>
            </div>
          </Container>
        </div>
      )}
    </nav>
  );
}
