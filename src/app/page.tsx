import FindUs from "@/components/FindUs";
import FlavorTeaser from "@/components/FlavorTeaser";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import TrustStrip from "@/components/TrustStrip";

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustStrip />
      <FlavorTeaser />
      <Gallery />
      <Testimonials />
      <FindUs />
    </main>
  );
}
