import Container from "./Container";
import ReadinessCard from "./ReadinessCard";

export default function Hero() {
  return (
    <header className="pt-[72px] pb-20">
      <Container>
        <div className="grid md:grid-cols-[1.05fr_0.95fr] gap-[54px] items-center">
          {/* Left column: copy */}
          <div>
            {/* Pill badge */}
            <span className="inline-block bg-pill text-pilltext text-[13px] font-semibold px-[15px] py-[7px] rounded-full">
              No cost to you, ever
            </span>

            {/* Heading */}
            <h1 className="text-4xl md:text-[60px] font-semibold mt-[18px]">
              Home ownership,
              <br />
              <span className="text-green italic font-semibold">
                made human.
              </span>
            </h1>

            {/* Lead paragraph */}
            <p className="text-[19px] text-brandmuted mt-6 mb-8 max-w-[90%]">
              Keyz brings your finances, a real coach, and the right lenders
              &amp; realtors into one place — so you go from &ldquo;someday&rdquo; to
              keys-in-hand with a plan, not a guess.
            </p>

            {/* CTA buttons */}
            <div className="flex gap-[14px] items-center">
              <a
                href="#"
                className="rounded-[11px] px-6 py-3 text-[15px] font-semibold bg-navy text-white transition-opacity hover:opacity-90"
              >
                Check my readiness →
              </a>
              <a
                href="#how"
                className="rounded-[11px] px-6 py-3 text-[15px] font-semibold border border-line text-navy transition-colors hover:bg-line/40"
              >
                See how it works
              </a>
            </div>

            {/* Reassurance row */}
            <div className="mt-5 flex gap-[18px] text-[13.5px] text-brandmuted flex-wrap">
              <span className="flex items-center gap-[7px]">
                <i className="not-italic w-[7px] h-[7px] rounded-full bg-sage inline-block" />
                Free for buyers
              </span>
              <span className="flex items-center gap-[7px]">
                <i className="not-italic w-[7px] h-[7px] rounded-full bg-sage inline-block" />
                Bank-level security
              </span>
              <span className="flex items-center gap-[7px]">
                <i className="not-italic w-[7px] h-[7px] rounded-full bg-sage inline-block" />
                No credit impact
              </span>
            </div>
          </div>

          {/* Right column: readiness card */}
          <ReadinessCard />
        </div>
      </Container>
    </header>
  );
}
