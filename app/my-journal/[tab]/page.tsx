import { Suspense } from "react";
import { notFound } from "next/navigation";
import { JournalTab } from "@/components/Journal";
import { JOURNAL_TABS, type JournalTabId } from "@/lib/journal";

export function generateStaticParams() {
  return JOURNAL_TABS.map((t) => ({ tab: t.id }));
}

type Params = Promise<{ tab: string }>;

async function Tab({ params }: { params: Params }) {
  const { tab } = await params;
  if (!JOURNAL_TABS.some((t) => t.id === tab)) notFound();
  return <JournalTab tab={tab as JournalTabId} />;
}

/** Loading shell that follows the final layout: header, tabs, one insight. No numbers. */
function TabSkeleton() {
  return (
    <div className="insights journal" aria-busy="true" aria-label="Loading your insights">
      <div className="insights-bar j-bar" />
      <div className="tab-panel">
        <div className="moment accent-green">
          <div className="skeleton"><span /><span /><span /><span /></div>
        </div>
      </div>
    </div>
  );
}

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Tab params={params} />
    </Suspense>
  );
}
