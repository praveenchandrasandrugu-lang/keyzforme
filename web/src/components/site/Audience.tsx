import { House, Compass, Handshake } from "lucide-react";
import Container from "./Container";
import SectionHeading from "./SectionHeading";

const cards = [
  {
    Icon: House,
    title: "For home buyers",
    body: "Your finances, a real coach, and ranked offers — from “someday” to keys-in-hand.",
    cta: { text: "Always free →", type: "free" as const },
  },
  {
    Icon: Compass,
    title: "For financial counselors",
    body: "Coach more clients with their full picture in one place — and get paid to do it.",
    cta: { text: "Partner with us →", type: "link" as const },
  },
  {
    Icon: Handshake,
    title: "For lenders & realtors",
    body: "Meet ready, verified buyers actively comparing offers — not cold leads.",
    cta: { text: "List on Keyz →", type: "link" as const },
  },
];

export default function Audience() {
  return (
    <section id="partners" className="py-16 md:py-[88px]">
      <Container>
        <SectionHeading
          eyebrow="Built for everyone at the table"
          heading={
            <>
              One platform,{" "}
              <span className="text-green italic font-semibold">three sides</span>{" "}
              that win.
            </>
          }
        />

        <div className="grid md:grid-cols-3 gap-[22px]">
          {cards.map(({ Icon, title, body, cta }) => (
            <div
              key={title}
              className="bg-surface border border-line rounded-[18px] p-[30px_26px]"
            >
              {/* Icon box */}
              <div className="w-[46px] h-[46px] rounded-[12px] bg-pill grid place-items-center mb-4">
                <Icon size={22} className="text-green" />
              </div>

              <h3 className="text-[21px] mb-[9px]">{title}</h3>
              <p className="text-[14.5px] text-brandmuted mb-4">{body}</p>

              {cta.type === "free" ? (
                <span className="inline-block mt-1 text-[12px] font-bold text-green">
                  {cta.text}
                </span>
              ) : (
                <a href="#" className="text-green text-[14px] font-semibold rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-1">
                  {cta.text}
                </a>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
