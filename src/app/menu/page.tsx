import type { Metadata } from "next";
import Link from "next/link";
import Flavors from "@/components/Flavors";
import { Arrow } from "@/components/Nav";
import Sizes from "@/components/Sizes";

export const metadata: Metadata = {
  title: "Flavors & tray sizes",
  description: "See every sushi bake flavor layer by layer in 3D, and compare Regular, Large, Family and Quad trays at true size.",
};

export default function MenuPage() {
  return (
    <main>
      <h1 className="sr-only">Our sushi bake menu</h1>
      <Flavors />
      <Sizes />
      <section className="px-4 pb-24 text-center md:px-8">
        <p className="display text-[clamp(2.4rem,5vw,4rem)]">
          Hungry <span className="italic text-orange">yet?</span>
        </p>
        <Link href="/order" className="btn btn-orange mt-6">
          Build your tray <Arrow />
        </Link>
      </section>
    </main>
  );
}
