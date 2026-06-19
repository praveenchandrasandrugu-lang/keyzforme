"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Container from "./Container";

const navLinks = [
  { label: "How it works", href: "#how" },
  { label: "The marketplace", href: "#marketplace" },
  { label: "For partners", href: "#partners" },
  { label: "About", href: "#about" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-10 bg-cream/80 backdrop-blur border-b border-line">
      <Container>
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <span className="font-serif font-bold text-[25px] text-navy tracking-[-0.5px]">
            Key<span className="text-sage">z</span>
          </span>

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
            <a
              href="#"
              className="rounded-[11px] px-6 py-3 text-[15px] font-semibold border border-linecool text-navy transition-colors hover:bg-linecool/40"
            >
              Sign in
            </a>
            <a
              href="#"
              className="rounded-[11px] px-6 py-3 text-[15px] font-semibold bg-navy text-white transition-opacity hover:opacity-90"
            >
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
                  className="flex items-center justify-center min-h-[44px] rounded-[11px] px-6 text-[15px] font-semibold border border-linecool text-navy transition-colors hover:bg-linecool/40"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center min-h-[44px] rounded-[11px] px-6 text-[15px] font-semibold bg-navy text-white transition-opacity hover:opacity-90"
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
