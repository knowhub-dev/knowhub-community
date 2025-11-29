import StatusClient from "./StatusClient";
import { generateStaticMetadata } from "@/lib/metadata-helpers";

export const generateMetadata = generateStaticMetadata({
  title: "Tizim holati",
  description: "KnowHub Community xizmatlarining joriy ishlash holati va kuzatuv ma'lumotlari.",
  path: "/status",
});

export default function StatusPage() {
  return <StatusClient />;
}
