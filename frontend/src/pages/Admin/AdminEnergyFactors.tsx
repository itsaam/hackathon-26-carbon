import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface EnergyFactor {
  id?: number;
  energyType: string;
  emissionFactor: number;
  country?: string | null;
  region?: string | null;
  source: string;
  year: number;
  gwpPerKwh?: number | null;
  dataSourceUrl?: string | null;
}

export default function AdminEnergyFactors() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<EnergyFactor | null>(null);
  const [ademeLoading, setAdemeLoading] = useState(false);
  const navigate = useNavigate();

  const factorsQuery = useQuery({
    queryKey: ["admin", "energy-factors"],
    queryFn: () => apiFetch<EnergyFactor[]>("/api/energy-factors"),
  });

  const saveMutation = useMutation({
    mutationFn: async (f: EnergyFactor) => {
      if (f.id) {
        return apiFetch<EnergyFactor>(`/api/energy-factors/admin/${f.id}`, {
          method: "PUT",
          body: JSON.stringify(f),
        });
      }
      return apiFetch<EnergyFactor>("/api/energy-factors/admin", {
        method: "POST",
        body: JSON.stringify(f),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "energy-factors"] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiFetch(`/api/energy-factors/admin/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "energy-factors"] });
    },
  });

  const handleRefreshAdeme = async () => {
    try {
      setAdemeLoading(true);
      await apiFetch<void>("/api/admin/ademe/refresh-factors", {
        method: "POST",
      });
      qc.invalidateQueries({ queryKey: ["admin", "energy-factors"] });
    } finally {
      setAdemeLoading(false);
    }
  };

  const factors = factorsQuery.data ?? [];

  return (
    <div>
      <PageHeader
        title="Facteurs d'énergie"
        subtitle="Administration des facteurs d'émission énergétiques"
        onBack={() => navigate("/admin")}
        backLabel="Retour à l’administration"
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleRefreshAdeme}
              disabled={ademeLoading}
              className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {ademeLoading ? "Synchronisation ADEME..." : "Rafraîchir depuis ADEME"}
            </button>
            <button
              onClick={() =>
                setEditing({
                  energyType: "electricity",
                  emissionFactor: 0,
                  source: "ADEME",
                  year: new Date().getFullYear(),
                })
              }
              className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
            >
              Nouveau facteur
            </button>
          </div>
        }
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3.5 font-semibold text-card-foreground">Énergie</th>
              <th className="text-left px-4 py-3.5 font-semibold text-card-foreground">Pays/Région</th>
              <th className="text-left px-4 py-3.5 font-semibold text-card-foreground">Année</th>
              <th className="text-left px-4 py-3.5 font-semibold text-card-foreground">Facteur (kgCO₂e/kWh)</th>
              <th className="text-right px-4 py-3.5 font-semibold text-card-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {factors.map((f) => (
              <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3.5">{f.energyType}</td>
                <td className="px-4 py-3.5 text-muted-foreground">
                  {f.country ?? "—"}
                  {f.region ? ` / ${f.region}` : ""}
                </td>
                <td className="px-4 py-3.5 text-muted-foreground">{f.year}</td>
                <td className="px-4 py-3.5 text-muted-foreground">
                  {f.gwpPerKwh ?? f.emissionFactor} kgCO₂e/kWh
                </td>
                <td className="px-4 py-3.5 text-right space-x-2">
                  <button
                    onClick={() => setEditing(f)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    Éditer
                  </button>
                  {f.id && (
                    <button
                      onClick={() => deleteMutation.mutate(f.id!)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {factors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  Aucun facteur configuré pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-base font-semibold">
              {editing.id ? "Modifier le facteur" : "Nouveau facteur"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Field
                label="Énergie"
                value={editing.energyType}
                onChange={(v) => setEditing({ ...editing, energyType: v })}
              />
              <Field
                label="Pays"
                value={editing.country ?? ""}
                onChange={(v) => setEditing({ ...editing, country: v })}
              />
              <Field
                label="Région"
                value={editing.region ?? ""}
                onChange={(v) => setEditing({ ...editing, region: v })}
              />
              <Field
                label="Année"
                type="number"
                value={String(editing.year)}
                onChange={(v) => setEditing({ ...editing, year: Number(v) })}
              />
              <Field
                label="Facteur (kgCO₂e/kWh)"
                type="number"
                value={String(editing.gwpPerKwh ?? editing.emissionFactor ?? 0)}
                onChange={(v) =>
                  setEditing({
                    ...editing,
                    gwpPerKwh: Number(v),
                    emissionFactor: Number(v),
                  })
                }
              />
              <Field
                label="Source"
                value={editing.source}
                onChange={(v) => setEditing({ ...editing, source: v })}
              />
              <Field
                label="URL source"
                value={editing.dataSourceUrl ?? ""}
                onChange={(v) => setEditing({ ...editing, dataSourceUrl: v })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => saveMutation.mutate(editing)}
                className="px-4 py-2 text-sm rounded-lg bg-cap-vibrant text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs"
      />
    </div>
  );
}

