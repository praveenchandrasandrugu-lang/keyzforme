import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";

interface Step {
  num: string;
  title: string;
  body: string;
}

const steps: Step[] = [
  {
    num: "1",
    title: "Centralize your money",
    body: "Securely connect your accounts and see your full financial picture in one clean dashboard — no spreadsheets, no judgment.",
  },
  {
    num: "2",
    title: "Get coached to ready",
    body: "A real financial counselor builds your plan and coaches you up — improving your credit, savings, and debt until you genuinely qualify.",
  },
  {
    num: "3",
    title: "Compare real offers",
    body: "When you're ready, lenders and realtors compete for you. Compare real offers built on your actual financial position — side by side.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-16 md:py-[88px]">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          heading={
            <>
              Three steps from{" "}
              <span className="text-green italic font-semibold">wanting</span>{" "}
              to{" "}
              <span className="text-green italic font-semibold">ready</span>.
            </>
          }
          sub="Most people don't fail to buy a home because they can't — they fail because no one showed them the path. Keyz is that path."
        />
        <div className="grid md:grid-cols-3 gap-[22px]">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-surface border border-line rounded-[18px] p-[30px_26px]"
            >
              <div className="w-[42px] h-[42px] rounded-[12px] bg-pill text-green grid place-items-center font-serif font-bold text-[20px] mb-[18px]">
                {step.num}
              </div>
              <h3 className="text-[22px] mb-[10px]">{step.title}</h3>
              <p className="text-[15px] text-brandmuted">{step.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
