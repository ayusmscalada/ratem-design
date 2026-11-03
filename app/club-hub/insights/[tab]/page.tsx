import { notFound } from "next/navigation";
import { Insights } from "@/components/Insights";
import { TABS, type TabId } from "@/lib/data";

export function generateStaticParams() {
  return TABS.map((t) => ({ tab: t.id }));
}

export default async function Page({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params;
  if (!TABS.some((t) => t.id === tab)) notFound();
  return <Insights tab={tab as TabId} />;
}
