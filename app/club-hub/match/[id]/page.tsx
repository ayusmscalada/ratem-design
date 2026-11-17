import { Suspense } from "react";
import { FanMatchStory } from "@/components/FanMatchStory";
import { FIXTURES } from "@/lib/data";

export function generateStaticParams() {
  return FIXTURES.map((f) => ({ id: f.id }));
}

type Params = Promise<{ id: string }>;
type Search = Promise<{ m?: string }>;

/**
 * Fan match insights for one finished match: the fans' view, for anyone, rated or not.
 * `?m=3` opens on a given moment (review links).
 */
async function Story({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { id } = await params;
  const { m } = await searchParams;
  const start = Math.max(0, Number(m ?? 1) - 1) || 0;
  return <FanMatchStory key={`${id}-${m ?? ""}`} id={id} start={start} />;
}

export default function Page({ params, searchParams }: { params: Params; searchParams: Search }) {
  return (
    <Suspense fallback={<div className="story tone-gold" aria-busy="true" aria-label="Loading fan match insights" />}>
      <Story params={params} searchParams={searchParams} />
    </Suspense>
  );
}
