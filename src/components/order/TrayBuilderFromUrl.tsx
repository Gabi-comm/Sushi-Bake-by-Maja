"use client";

import { useSearchParams } from "next/navigation";
import { parseStart } from "@/lib/order";
import TrayBuilder from "./TrayBuilder";

/** Preselects from ?size= / ?flavor= (the "Add to my tray" links). */

export default function TrayBuilderFromUrl() {
  const params = useSearchParams();
  const start = parseStart(params.get("size"), params.get("flavor"));
  return <TrayBuilder key={`${start.size}:${start.flavor ?? ""}`} start={start} />;
}
