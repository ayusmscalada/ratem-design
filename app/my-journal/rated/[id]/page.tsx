import { Suspense } from "react";
import { RatedMatchPage } from "@/components/Journal";
import { JOURNAL_MATCHES, OPEN_MATCH } from "@/lib/journal";

export function generateStaticParams() {
  return [OPEN_MATCH, ...JOURNAL_MATCHES].map((m) => ({ id: m.id }));
}

type Params = Promise<{ id: string }>;
type Search = Promise<{ from?: string }>;

/**
 * One rated match, opened from a drill-down (insight → the fixtures behind it → this match). `?from=result:W`
 * (or differ:Salah, range:Salah, motm:Salah) says where it came from, so Back returns to the same view.
 */
async function Detail({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { id } = await params;
  const { from } = await searchParams;
  return <RatedMatchPage key={`${id}-${from ?? ""}`} id={id} from={from ?? null} />;
}

export default function Page({ params, searchParams }: { params: Params; searchParams: Search }) {
  return (
    <Suspense fallback={<div className="journal" aria-busy="true" aria-label="Loading the match" />}>
      <Detail params={params} searchParams={searchParams} />
    </Suspense>
  );
}
