import Container from "./Container";

const navLinks = [
  { label: "How it works", href: "#how" },
  { label: "The marketplace", href: "#marketplace" },
  { label: "For partners", href: "#partners" },
  { label: "About", href: "#about" },
];

export default function Nav() {
  return (
    <nav className="sticky top-0 z-10 bg-cream/80 backdrop-blur border-b border-line">
      <Container>
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <span className="font-serif font-bold text-[25px] text-navy tracking-[-0.5px]">
            Key<span className="text-sage">z</span>
          </span>

          {/* Nav links */}
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

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="rounded-[11px] px-6 py-3 text-[15px] font-semibold border border-line text-navy transition-colors hover:bg-line/40"
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
        </div>
      </Container>
    </nav>
  );
}
