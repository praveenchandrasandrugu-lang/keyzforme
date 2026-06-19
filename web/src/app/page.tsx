import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import TrustStrip from "@/components/site/TrustStrip";
import HowItWorks from "@/components/site/HowItWorks";
import Marketplace from "@/components/site/Marketplace";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Marketplace />
      </main>
    </>
  );
}
