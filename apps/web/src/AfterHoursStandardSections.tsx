import type { ReactNode } from 'react';

export type StandardFact = { label: string; value: string };
export type HeadphonePick = { meta: string; title: string; artist: string; note: string; href?: string; linkLabel?: string };

export function StandardIntro({
  number,
  eyebrow,
  title,
  subtitle,
  lead,
  facts,
  whyTitle = 'Why we study it',
  why,
  note
}: {
  number: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  lead: ReactNode;
  facts: StandardFact[];
  why?: ReactNode;
  whyTitle?: string;
  note?: ReactNode;
}) {
  return <>
    <section className="ah-port-hero">
      <span className="eyebrow">Standard № {number} · {eyebrow}</span>
      <h1>{title}</h1>
      <p className="ah-port-subtitle">{subtitle}</p>
      <div className="ah-piece-history"><span className="eyebrow">Brief history</span><p className="ah-port-lead">{lead}</p></div>
    </section>
    <section className="ah-port-intro-grid">
      <article>
        <span className="eyebrow">At a glance</span>
        <dl>{facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
      </article>
      <article>
        <span className="eyebrow">{whyTitle}</span>
        {why && <p>{why}</p>}
        {note && <small>{note}</small>}
      </article>
    </section>
  </>;
}

export function KeyArrangementReference({ title, copy, href, linkLabel = 'Open YouTube reference ↗' }: { title: string; copy: ReactNode; href: string; linkLabel?: string }) {
  return <aside className="ah-arrangement-reference">
    <span className="eyebrow">Arrangement reference</span>
    <strong>{title}</strong>
    <p>{copy}</p>
    <a href={href} target="_blank" rel="noreferrer">{linkLabel}</a>
  </aside>;
}

export function ThreeForHeadphones({ title, subtitle, picks }: { title: string; subtitle: string; picks: HeadphonePick[] }) {
  return <section className="ah-port-renditions">
    <span className="eyebrow">Three for the headphones</span>
    <h2>{title}</h2>
    <p className="ah-port-renditions-intro">{subtitle}</p>
    <div>{picks.map(pick => <article key={`${pick.artist}-${pick.title}`}>
      <small>{pick.meta}</small>
      <h3>{pick.title}</h3>
      <strong>{pick.artist}</strong>
      <p>{pick.note}</p>
      {pick.href && <a href={pick.href} target="_blank" rel="noreferrer">{pick.linkLabel ?? 'Open YouTube reference ↗'}</a>}
    </article>)}</div>
  </section>;
}

export function StandardFooter() {
  return <footer className="ah-port-footer"><a href="#/after-hours">← Back to Standards Library</a><span>After Hours · Morning Changes</span></footer>;
}
