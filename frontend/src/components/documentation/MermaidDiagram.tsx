import { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
  id?: string;
  className?: string;
}

export function MermaidDiagram({ chart, id, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uniqueId = id ?? `mermaid-${Math.random().toString(36).slice(2, 9)}`;

  useEffect(() => {
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          flowchart: { useMaxWidth: true },
          sequence: { useMaxWidth: true },
          er: { useMaxWidth: true },
        });
        const { svg: rendered } = await mermaid.render(uniqueId, chart);
        if (!cancelled) setSvg(rendered);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erreur Mermaid");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, uniqueId]);

  if (error) {
    return (
      <div className={className}>
        <pre className="rounded-lg bg-muted/50 p-4 text-sm overflow-x-auto border border-border">
          <code>{chart}</code>
        </pre>
        <p className="text-destructive text-sm mt-2">{error}</p>
      </div>
    );
  }
  if (!svg) {
    return (
      <div className={`flex items-center justify-center min-h-[200px] bg-muted/30 rounded-lg animate-pulse ${className ?? ""}`}>
        <span className="text-muted-foreground text-sm">Chargement du diagramme…</span>
      </div>
    );
  }
  return (
    <div
      ref={containerRef}
      className={`mermaid-diagram flex justify-center overflow-x-auto [&_svg]:max-w-full ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
