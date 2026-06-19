import Container from "@/components/site/Container";

interface Stat {
  value: React.ReactNode;
  caption: string;
}

const stats: Stat[] = [
  { value: "1 place", caption: "Finances, coaching & offers" },
  { value: "$0", caption: "Cost to home buyers" },
  { value: "Real data", caption: "Offers based on your actual position" },
  { value: <>Side&nbsp;by&nbsp;side</>, caption: "Compare lenders & realtors" },
];

export default function TrustStrip() {
  return (
    <div className="bg-creamband border-y border-line">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 py-6 md:py-[22px]">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
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
