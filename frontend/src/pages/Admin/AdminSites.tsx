import PageHeader from "@/components/ui/PageHeader";
import { apiFetch } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Site } from "@/hooks/useSites";

export default function AdminSites() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [query, setQuery] = useState("");

  const sitesQuery = useQuery({
    queryKey: ["admin", "sites"],
    queryFn: () => apiFetch<Site[]>("/api/sites"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiFetch<void>(`/api/sites/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "sites"] });
      qc.invalidateQueries({ queryKey: ["sites"] });
    },
  });

  const sites = sitesQuery.data ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter((s) => {
      const name = (s.name ?? "").toLowerCase();
      const city = (s.city ?? "").toLowerCase();
      const code = (s.internalCode ?? "").toLowerCase();
      return name.includes(q) || city.includes(q) || code.includes(q);
    });
  }, [query, sites]);

  return (
    <div>
      <PageHeader
        title="Sites"
        subtitle="Lister, supprimer et gérer les accès utilisateur par site."
        onBack={() => navigate("/admin")}
        backLabel="Retour à l’administration"
        actions={
          <button
            type="button"
            onClick={() => navigate("/sites/new")}
            className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
          >
            Nouveau site
          </button>
        }
      />

      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher (nom, ville, code interne)…"
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3.5 font-semibold text-card-foreground">Nom</th>
              <th className="text-left px-4 py-3.5 font-semibold text-card-foreground">Ville</th>
              <th className="text-left px-4 py-3.5 font-semibold text-card-foreground">Code interne</th>
              <th className="text-right px-4 py-3.5 font-semibold text-card-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3.5">{s.name}</td>
                <td className="px-4 py-3.5 text-muted-foreground">{s.city ?? "—"}</td>
                <td className="px-4 py-3.5 text-muted-foreground">{s.internalCode ?? "—"}</td>
                <td className="px-4 py-3.5 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/sites/${s.id}/edit`)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/sites/${s.id}/access`)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    Accès
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(s.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  {sitesQuery.isLoading ? "Chargement…" : "Aucun site trouvé."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

