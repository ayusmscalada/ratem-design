import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Insights } from "@/components/Insights";
import { TABS, type TabId } from "@/lib/data";

export function generateStaticParams() {
  return TABS.map((t) => ({ tab: t.id }));
}

type Params = PageProps<"/club-hub/insights/[tab]">["params"];

async function Tab({ params }: { params: Params }) {
  const { tab } = await params;
  if (!TABS.some((t) => t.id === tab)) notFound();
  return <Insights tab={tab as TabId} />;
}

/** Loading shell that follows the final layout: header, tabs, one insight. No numbers. */
function InsightsSkeleton() {
  return (
    <div className="insights" aria-busy="true" aria-label="Loading insights">
      <div className="insights-bar" />
      <div className="tab-panel">
        <div className="moment accent-blue">
          <div className="skeleton"><span /><span /><span /><span /></div>
        </div>
      </div>
    </div>
  );
}

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<InsightsSkeleton />}>
      <Tab params={params} />
    </Suspense>
  );
}
