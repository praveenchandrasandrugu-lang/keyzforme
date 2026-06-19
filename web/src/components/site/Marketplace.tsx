import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Container from "@/components/site/Container";
import SectionHeading from "@/components/site/SectionHeading";

const bullets: React.ReactNode[] = [
  <>
    Offers based on your <b>real</b> data, not a credit-score guess
  </>,
  <>Compare rates, fees and fit in one view</>,
  <>
    You stay anonymous until <b>you</b> choose to connect
  </>,
];

interface LenderRow {
  who: string;
  fees: string;
  apr: string;
  monthly: string;
  rank: string;
  best: boolean;
}

const rows: LenderRow[] = [
  {
    who: "Summit Home Loans",
    fees: "30-yr fixed · $4,200 fees",
    apr: "6.08%",
    monthly: "$1,840",
    rank: "Best fit",
    best: true,
  },
  {
    who: "Harbor Credit Union",
    fees: "30-yr fixed · $3,100 fees",
    apr: "6.24%",
    monthly: "$1,879",
    rank: "#2",
    best: false,
  },
  {
    who: "Nationwide Direct",
    fees: "30-yr fixed · $5,500 fees",
    apr: "6.31%",
    monthly: "$1,896",
    rank: "#3",
    best: false,
  },
];

export default function Marketplace() {
  return (
    <section id="marketplace" className="py-16 md:py-[88px] bg-navy text-mktink">
      <Container>
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-[54px] items-center">
          {/* Left column */}
          <div>
            <SectionHeading
              eyebrow="The marketplace"
              eyebrowClassName="text-mktaccent"
              heading={
                <>
                  Let lenders &amp; realtors{" "}
                  <span className="text-mktaccent italic font-semibold">
                    compete for you.
                  </span>
                </>
              }
              h2ClassName="text-white"
              className="text-left mx-0 mb-0"
            />
            <p className="text-mktlead text-[17px] mt-[18px] mb-[26px]">
              No more cold-calling banks or guessing if a rate is fair. Your verified
              financial profile goes to vetted partners, and the offers come to you —
              transparent and ranked.
            </p>
            <ul className="list-none p-0 m-0 mb-[28px]">
              {bullets.map((bullet, i) => (
                <li
                  key={i}
                  className="flex gap-[12px] items-start mb-[14px] text-[15.5px] text-mktli"
                >
                  <span className="flex-none w-[22px] h-[22px] rounded-full bg-mktchip text-mktaccent grid place-items-center mt-[1px]">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <a
              href="#"
              className={cn(
                "rounded-[11px] px-6 py-3 text-[15px] font-semibold text-white",
                "border border-mktborder transition-colors hover:bg-white/5",
                "inline-block",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy",
              )}
            >
              Explore the marketplace
            </a>
          </div>

          {/* Right column — compare card */}
          <div className="bg-white rounded-[18px] p-5 text-ink shadow-compare">
            <p className="text-[13px] text-brandmuted font-bold uppercase tracking-[0.05em] mb-[14px]">
              Your lender offers · ranked for you
            </p>
            {rows.map((row) => (
              <div
                key={row.who}
                className={cn(
                  "grid grid-cols-[1.4fr_.8fr_.8fr_auto] gap-[10px] items-center",
                  "p-[13px_14px] border border-line rounded-[12px] mb-[10px]",
                  row.best && "border-sage bg-bestbg ring-1 ring-sage",
                )}
              >
                <div>
                  <p className="font-semibold text-navy text-[14px] leading-tight">
                    {row.who}
                  </p>
                  <p className="text-[11px] text-brandmuted mt-[2px]">{row.fees}</p>
                </div>
                <div>
                  <p className="font-serif font-semibold text-[17px] text-navy leading-tight">
                    {row.apr}
                  </p>
                  <p className="text-[11px] text-brandmuted">APR</p>
                </div>
                <div>
                  <p className="font-serif font-semibold text-[17px] text-navy leading-tight">
                    {row.monthly}
                  </p>
                  <p className="text-[11px] text-brandmuted">/mo</p>
                </div>
                <div>
                  {row.best ? (
                    <span className="bg-sage text-bestink text-[10.5px] font-bold px-2 py-[3px] rounded-full whitespace-nowrap">
                      {row.rank}
                    </span>
                  ) : (
                    <span className="text-[11px] text-brandmuted">{row.rank}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
