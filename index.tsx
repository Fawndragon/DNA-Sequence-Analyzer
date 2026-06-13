import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Activity, Dna, FlaskConical, Scissors, Sparkles, AlignLeft } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fawndragon — DNA Sequence Analyser" },
      { name: "description", content: "Analyse DNA sequences: GC content, restriction sites, complementary strand." },
    ],
  }),
  component: Dashboard,
});

const VALID = /^[ATGCatgc\s]*$/;
const VALID_SITE = /^[ATGCatgc]*$/;

const complement: Record<string, string> = { A: "T", T: "A", G: "C", C: "G" };

function clean(s: string) {
  return s.replace(/\s+/g, "").toUpperCase();
}

function analyse(seqRaw: string, siteRaw: string) {
  const seq = clean(seqRaw);
  const site = clean(siteRaw);

  const length = seq.length;
  let g = 0, c = 0, a = 0, t = 0;
  for (const ch of seq) {
    if (ch === "G") g++;
    else if (ch === "C") c++;
    else if (ch === "A") a++;
    else if (ch === "T") t++;
  }
  const gcCount = g + c;
  const gcPercent = length ? (gcCount / length) * 100 : 0;

  // count occurrences of restriction site (overlapping = no, classical count)
  let siteCount = 0;
  if (site.length && length) {
    let idx = 0;
    while ((idx = seq.indexOf(site, idx)) !== -1) {
      siteCount++;
      idx += site.length;
    }
  }

  // sequence after removing restriction sites
  const cleaved = site.length ? seq.split(site).join("") : seq;

  // complementary strand 5' -> 3' (reverse complement)
  let revComp = "";
  for (let i = seq.length - 1; i >= 0; i--) {
    revComp += complement[seq[i]] ?? "";
  }

  return { seq, site, length, a, t, g, c, gcCount, gcPercent, siteCount, cleaved, revComp };
}

const SAMPLE = "ATGCGTACGTTAGCCGAATTCGGATCCTTAGCGAATTCCGTACGTAGGAATTCGTAACGT";
const SAMPLE_SITE = "GAATTC";

function Dashboard() {
  const [seq, setSeq] = useState("");
  const [site, setSite] = useState("");
  const [submitted, setSubmitted] = useState<{ seq: string; site: string } | null>(null);

  const seqError = !VALID.test(seq) ? "Only A, T, G, C allowed." : "";
  const siteError = !VALID_SITE.test(site.replace(/\s/g, "")) ? "Only A, T, G, C allowed." : "";

  const [result, setResult] = useState<any>(null);

useEffect(() => {
  const fetchAnalysis = async () => {
    if (!submitted) {
      setResult(null);
      return;
    }
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sequence: submitted.seq,
          restriction_site: submitted.site
        }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error connecting to Python backend:", error);
    }
  };

  fetchAnalysis();
}, [submitted]);

  const canSubmit = !seqError && !siteError && clean(seq).length > 0;

  return (
    <div className="min-h-screen text-foreground">
      {/* Header */}
      <header className="border-b border-border/60 backdrop-blur-sm sticky top-0 z-10 bg-background/70">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-primary/15 grid place-items-center ring-1 ring-primary/30">
              <Dna className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl leading-none font-display font-semibold">Fawndragon</h1>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
                Sequence Analytics Suite
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Laboratory build · v1.0
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Title */}
        <section className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/80 mb-3">
            Molecular Diagnostics
          </p>
          <h2 className="text-4xl md:text-5xl font-display font-medium leading-tight">
            DNA Sequence <em className="text-primary not-italic">Analyser</em>
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Submit a nucleotide sequence and restriction site to compute composition,
            cleavage products, and the 5′ → 3′ complementary strand.
          </p>
        </section>

        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          {/* Input panel */}
          <section className="panel p-6 h-fit lg:sticky lg:top-24">
            <div className="flex items-center gap-2 mb-5">
              <FlaskConical className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-display font-semibold">Specimen Input</h3>
            </div>

            <label className="block">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                DNA Sequence (5′ → 3′)
              </span>
              <textarea
                value={seq}
                onChange={(e) => setSeq(e.target.value)}
                placeholder="e.g. ATGCGTACGT…"
                rows={6}
                className="mt-2 w-full rounded-md bg-input/60 border border-border px-3 py-2.5 font-mono text-sm tracking-wider text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/60 resize-none"
              />
              <div className="mt-1.5 flex justify-between text-[11px]">
                <span className={seqError ? "text-destructive" : "text-muted-foreground"}>
                  {seqError || "Whitespace ignored. Case-insensitive."}
                </span>
                <span className="text-muted-foreground font-mono">
                  {clean(seq).length} bp
                </span>
              </div>
            </label>

            <label className="block mt-5">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Restriction Site
              </span>
              <input
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="e.g. GAATTC"
                className="mt-2 w-full rounded-md bg-input/60 border border-border px-3 py-2.5 font-mono text-sm tracking-[0.2em] uppercase focus:outline-none focus:ring-2 focus:ring-ring/60"
              />
              <div className="mt-1.5 text-[11px]">
                <span className={siteError ? "text-destructive" : "text-muted-foreground"}>
                  {siteError || "Recognition sequence for enzymatic cleavage."}
                </span>
              </div>
            </label>

            <div className="mt-6 flex gap-2">
              <button
                disabled={!canSubmit}
                onClick={() => setSubmitted({ seq, site })}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground font-medium py-2.5 px-4 hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="h-4 w-4" />
                Run Analysis
              </button>
              <button
                onClick={() => {
                  setSeq(SAMPLE);
                  setSite(SAMPLE_SITE);
                  setSubmitted({ seq: SAMPLE, site: SAMPLE_SITE });
                }}
                className="rounded-md border border-border bg-surface-elevated/60 px-3 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
              >
                Sample
              </button>
            </div>
          </section>

          {/* Results panel */}
          <section className="space-y-6 min-w-0">
            {!result ? (
              <EmptyState />
            ) : (
              <>
                <StatGrid r={result} />
                <CompositionChart r={result} />
                <SequenceCard
                  icon={<AlignLeft className="h-4 w-4 text-primary" />}
                  title="Complementary Strand"
                  subtitle="Reverse complement, written 5′ → 3′"
                  seq={result.complementary_strand}
                />
                <SequenceCard
                  icon={<Scissors className="h-4 w-4 text-primary" />}
                  title="Post-Cleavage Sequence"
                  subtitle={`Restriction site ${result.restriction_site || "—"} removed from template`}
                  seq={result.fragments.join(" | ")}
                  highlight={result.restriction_site}
                />
              </>
            )}
          </section>
        </div>

        <footer className="mt-16 pt-6 border-t border-border/60 text-xs text-muted-foreground flex justify-between">
          <span>© Fawndragon Analytics — for research use only.</span>
          <span className="font-mono">5′ ——— 3′</span>
        </footer>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="panel p-12 text-center">
      <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 grid place-items-center ring-1 ring-primary/30">
        <Activity className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-5 text-xl font-display font-semibold">Awaiting Specimen</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
        Enter a DNA sequence and restriction site, then run analysis to generate the
        diagnostic report.
      </p>
    </div>
  );
}

function StatGrid({ r }: { r: NonNullable<ReturnType<typeof analyse>> }) {
  const stats = [
    {label: "Sequence Length", value: r.sequence_length.toLocaleString(), unit: "bp" },
    { label: "GC Count", value: (r.base_composition.G.count + r.base_composition.C.count).toLocaleString(), unit: "bases" },,
    { label: "GC Content", value: r.gc_percent.toFixed(2), unit: "%" },
    { label: "Restriction Sites", value: r.site_count.toLocaleString(), unit: ""},
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="panel p-4">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {s.label}
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-display font-semibold text-foreground">
              {s.value}
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">{s.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompositionChart({ r }: { r: NonNullable<ReturnType<typeof analyse>> }) {
  const bases = [
    { k: "A", n: r.base_composition.A.count, color: "var(--base-a)" },
    { k: "T", n: r.base_composition.T.count, color: "var(--base-t)" },
    { k: "G", n: r.base_composition.G.count, color: "var(--base-g)" },
    { k: "C", n: r.base_composition.C.count, color: "var(--base-c)" },
  ];
  const total = r.sequence_length || 1;

  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-display font-semibold">Base Composition</h3>
          <p className="text-xs text-muted-foreground">Nucleotide distribution across the strand</p>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{r.sequence_length} bp total</span>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-elevated ring-1 ring-border">
        {bases.map((b) => (
          <div key={b.k} style={{ width: `${(b.n / total) * 100}%`, background: b.color }} />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {bases.map((b) => {
          const pct = (b.n / total) * 100;
          return (
            <div key={b.k} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md grid place-items-center font-mono font-semibold text-base"
                   style={{ background: `color-mix(in oklab, ${b.color} 20%, transparent)`, color: b.color }}>
                {b.k}
              </div>
              <div className="leading-tight">
                <div className="text-sm font-mono">{b.n}</div>
                <div className="text-[11px] text-muted-foreground">{pct.toFixed(1)}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function colorFor(base: string) {
  switch (base) {
    case "A": return "var(--base-a)";
    case "T": return "var(--base-t)";
    case "G": return "var(--base-g)";
    case "C": return "var(--base-c)";
    default: return "var(--muted-foreground)";
  }
}

function SequenceCard({
  icon, title, subtitle, seq, highlight,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  seq: string;
  highlight?: string;
}) {
  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between mb-3 gap-4">
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <div className="min-w-0">
            <h3 className="text-lg font-display font-semibold truncate">{title}</h3>
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-mono text-muted-foreground">{seq.length} bp</span>
          <button
            onClick={() => navigator.clipboard?.writeText(seq)}
            className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-primary transition border border-border rounded px-2 py-1"
          >
            Copy
          </button>
        </div>
      </div>

      <div className="rounded-md bg-background/60 border border-border p-4 font-mono text-sm leading-7 break-all">
        <span className="text-muted-foreground select-none">5′ </span>
        {seq.length === 0 ? (
          <span className="text-muted-foreground italic">— empty —</span>
        ) : (
          seq.split("").map((b, i) => (
            <span key={i} className="text-foreground">{b}</span>
          ))
        )}
        <span className="text-muted-foreground select-none"> 3′</span>
      </div>

      {highlight ? (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Removed motif: <span className="font-mono text-foreground tracking-wider">{highlight}</span>
        </p>
      ) : null}
    </div>
  );
}
