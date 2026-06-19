import Container from "@/components/site/Container";

interface Stat {
  value: string;
  caption: string;
}

const stats: Stat[] = [
  { value: "1 place", caption: "Finances, coaching & offers" },
  { value: "$0", caption: "Cost to home buyers" },
  { value: "Real data", caption: "Offers based on your actual position" },
  { value: "Side by side", caption: "Compare lenders & realtors" },
];

export default function TrustStrip() {
  return (
    <div className="bg-creamband border-y border-line">
      <Container>
        <div className="flex items-center justify-between py-[22px] gap-6 flex-wrap">
          {stats.map((stat) => (
            <div key={stat.value} className="text-center flex-1 min-w-[140px]">
              <b className="font-serif text-[30px] text-navy block font-semibold">
                {stat.value}
              </b>
              <span className="text-[13px] text-brandmuted">{stat.caption}</span>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
