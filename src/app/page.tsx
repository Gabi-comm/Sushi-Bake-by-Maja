import FindUs from "@/components/FindUs";
import Flavors from "@/components/Flavors";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import Sizes from "@/components/Sizes";
import SmoothScroll from "@/components/SmoothScroll";
import Testimonials from "@/components/Testimonials";
import TrustStrip from "@/components/TrustStrip";
import TrayBuilder from "@/components/order/TrayBuilder";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main>
        <Hero />
        <TrustStrip />
        <Flavors />
        <Sizes />
        <TrayBuilder />
        <Gallery />
        <Testimonials />
        <FindUs />
      </main>
      <Footer />
    </>
  );
}
