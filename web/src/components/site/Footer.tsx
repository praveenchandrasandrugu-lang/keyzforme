import Container from "./Container";
import Logo from "./Logo";

const columns = [
  {
    heading: "Product",
    links: ["How it works", "The marketplace", "Readiness check"],
  },
  {
    heading: "Partners",
    links: ["For counselors", "For lenders", "For realtors"],
  },
  {
    heading: "Company",
    links: ["About", "Contact", "Privacy"],
  },
];

export default function Footer() {
  return (
    <footer id="about" className="py-[56px] pb-10 text-brandmuted text-[14px]">
      <Container>
        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-[30px] mb-9">
          {/* Brand column */}
          <div>
            <Logo />
            <p className="mt-3 max-w-[260px]">
              Bringing finances, coaching and the right partners into one human path to home ownership.
            </p>
          </div>

          {/* Link columns */}
          {columns.map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="font-sans text-[13px] uppercase tracking-[0.06em] text-navy mb-[14px]">
                {heading}
              </h4>
              {links.map((label) => (
                <a
                  key={label}
                  href="#"
                  className="block mb-[9px] hover:text-navy transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-line pt-[22px] flex flex-col sm:flex-row gap-2 justify-between text-[13px]">
          <span>© 2026 Keyz. All rights reserved.</span>
          <span>Made with care for first-time buyers.</span>
        </div>
      </Container>
    </footer>
  );
}
