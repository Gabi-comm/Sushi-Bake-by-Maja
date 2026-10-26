import type { Metadata } from "next";
import { Suspense } from "react";
import TrayBuilder from "@/components/order/TrayBuilder";
import TrayBuilderFromUrl from "@/components/order/TrayBuilderFromUrl";

export const metadata: Metadata = {
  title: "Build your tray",
  description: "Pick a size and flavor, add nori packs, and send your sushi bake order on Messenger or GrabFood.",
};

export default function OrderPage() {
  return (
    <main>
      {/* The static builder renders first; the URL-aware one takes over with any preselection. */}
      <Suspense fallback={<TrayBuilder />}>
        <TrayBuilderFromUrl />
      </Suspense>
    </main>
  );
}
