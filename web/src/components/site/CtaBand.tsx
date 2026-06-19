import Container from "./Container";

export default function CtaBand() {
  return (
    <section className="pt-0 pb-16 md:pb-[88px]">
      <Container>
        <div className="bg-[linear-gradient(135deg,var(--color-ctafrom),var(--color-navy)_55%,var(--color-ctato))] rounded-[26px] p-14 text-center text-white">
          <h2 className="text-white text-3xl md:text-[40px] font-semibold">
            Your first home is closer
            <br />
            than it feels.
          </h2>
          <p className="text-ctasub text-[17px] mt-4 mb-7 mx-auto max-w-[520px]">
            See where you stand today — in two minutes, with no credit impact and no cost.
          </p>
          <a
            href="#"
            className="rounded-[11px] px-6 py-3 text-[15px] font-semibold bg-white text-navy transition-opacity hover:opacity-90"
          >
            Check my readiness →
          </a>
        </div>
      </Container>
    </section>
  );
}
