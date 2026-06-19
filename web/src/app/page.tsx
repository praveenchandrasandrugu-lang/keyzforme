import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import TrustStrip from "@/components/site/TrustStrip";
import HowItWorks from "@/components/site/HowItWorks";
import Marketplace from "@/components/site/Marketplace";
import Audience from "@/components/site/Audience";
import CtaBand from "@/components/site/CtaBand";
import Footer from "@/components/site/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <Marketplace />
        <Audience />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
