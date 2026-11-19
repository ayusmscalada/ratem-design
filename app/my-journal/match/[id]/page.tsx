import { Suspense } from "react";
import { MatchStory } from "@/components/MatchStory";
import { JOURNAL_MATCHES, OPEN_MATCH } from "@/lib/journal";

export function generateStaticParams() {
  return [OPEN_MATCH, ...JOURNAL_MATCHES].map((m) => ({ id: m.id }));
}

type Params = Promise<{ id: string }>;
type Search = Promise<{ reveal?: string; m?: string }>;

/**
 * Post-match insights for one match you rated.
 * `?reveal=1` plays the rating → patterns reveal; `?m=3` opens on a given moment (review links), `?m=rare` on the rare moment, `?m=rare-gap` on one record in it.
 */
async function Story({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { id } = await params;
  const { reveal, m } = await searchParams;
  // ?m=rare opens on the rare moment, if this match has one (Your records shelf).
  const rare = m?.startsWith("rare");
  const start = rare ? -1 : Math.max(0, Number(m ?? 1) - 1) || 0;
  return <MatchStory key={`${id}-${reveal ?? ""}-${m ?? ""}`} id={id} reveal={reveal === "1"} start={start} startKey={rare ? m : undefined} />;
}

export default function Page({ params, searchParams }: { params: Params; searchParams: Search }) {
  return (
    <Suspense fallback={<div className="story tone-you" aria-busy="true" aria-label="Loading your match insights" />}>
      <Story params={params} searchParams={searchParams} />
    </Suspense>
  );
}
