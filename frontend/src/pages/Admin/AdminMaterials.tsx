import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import { useState } from "react";

interface Material {
  id?: number;
  name: string;
  emissionFactor: number;
  unit: string;
  source: string;
  category?: string | null;
  subCategory?: string | null;
  density?: number | null;
  lifeCycleStageCovered?: string | null;
  gwpPerKg?: number | null;
  referenceYear?: number | null;
  dataSourceUrl?: string | null;
}

export default function AdminMaterials() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Material | null>(null);

  const materialsQuery = useQuery({
    queryKey: ["admin", "materials"],
    queryFn: () => apiFetch<Material[]>("/api/materials"),
  });

  const saveMutation = useMutation({
    mutationFn: async (m: Material) => {
      if (m.id) {
        return apiFetch<Material>(`/api/materials/admin/${m.id}`, {
          method: "PUT",
          body: JSON.stringify(m),
        });
      }
      return apiFetch<Material>("/api/materials/admin", {
        method: "POST",
        body: JSON.stringify(m),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "materials"] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiFetch(`/api/materials/admin/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "materials"] });
    },
  });

  const materials = materialsQuery.data ?? [];

  return (
    <div>
      <PageHeader
        title="Matériaux"
        subtitle="Administration des matériaux et facteurs ACV"
        actions={
          <button
            onClick={() =>
              setEditing({
                name: "",
                emissionFactor: 0,
                unit: "tonne",
                source: "ADEME",
              })
            }
            className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
          >
            Nouveau matériau
          </button>
        }
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3.5 font-semibold text-card-foreground">Nom</th>
              <th className="text-left px-4 py-3.5 font-semibold text-card-foreground">Catégorie</th>
              <th className="text-left px-4 py-3.5 font-semibold text-card-foreground">Facteur</th>
              <th className="text-left px-4 py-3.5 font-semibold text-card-foreground">Source</th>
              <th className="text-right px-4 py-3.5 font-semibold text-card-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3.5">{m.name}</td>
                <td className="px-4 py-3.5 text-muted-foreground">
                  {m.category ?? "—"} {m.subCategory ? `· ${m.subCategory}` : ""}
                </td>
                <td className="px-4 py-3.5 text-muted-foreground">
                  {m.gwpPerKg ?? m.emissionFactor} {m.gwpPerKg ? "kgCO₂e/kg" : m.unit}
                </td>
                <td className="px-4 py-3.5 text-muted-foreground">{m.source}</td>
                <td className="px-4 py-3.5 text-right space-x-2">
                  <button
                    onClick={() => setEditing(m)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    Éditer
                  </button>
                  {m.id && (
                    <button
                      onClick={() => deleteMutation.mutate(m.id!)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {materials.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                  Aucun matériau configuré pour le moment.
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
              {editing.id ? "Modifier le matériau" : "Nouveau matériau"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Field label="Nom" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
              <Field
                label="Catégorie"
                value={editing.category ?? ""}
                onChange={(v) => setEditing({ ...editing, category: v })}
              />
              <Field
                label="Sous-catégorie"
                value={editing.subCategory ?? ""}
                onChange={(v) => setEditing({ ...editing, subCategory: v })}
              />
              <Field
                label="Facteur (kgCO₂e/kg ou unité)"
                type="number"
                value={String(editing.gwpPerKg ?? editing.emissionFactor ?? 0)}
                onChange={(v) =>
                  setEditing({
                    ...editing,
                    gwpPerKg: Number(v),
                    emissionFactor: Number(v),
                  })
                }
              />
              <Field
                label="Unité"
                value={editing.unit}
                onChange={(v) => setEditing({ ...editing, unit: v })}
              />
              <Field
                label="Densité (kg/m³)"
                type="number"
                value={editing.density != null ? String(editing.density) : ""}
                onChange={(v) => setEditing({ ...editing, density: v ? Number(v) : null })}
              />
              <Field
                label="Année de référence"
                type="number"
                value={editing.referenceYear != null ? String(editing.referenceYear) : ""}
                onChange={(v) => setEditing({ ...editing, referenceYear: v ? Number(v) : null })}
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

