import PageHeader from "@/components/ui/PageHeader";
import { apiFetch } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Site } from "@/hooks/useSites";

type User = {
  id: number;
  email: string;
  fullName: string;
  role?: string | null;
};

export default function AdminSiteAccess() {
  const { id } = useParams();
  const siteId = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [query, setQuery] = useState("");

  const siteQuery = useQuery({
    queryKey: ["admin", "site", siteId],
    enabled: Number.isFinite(siteId),
    queryFn: () => apiFetch<Site>(`/api/sites/${siteId}`),
  });

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiFetch<User[]>("/api/users"),
  });

  const accessQuery = useQuery({
    queryKey: ["admin", "site", siteId, "user-access"],
    enabled: Number.isFinite(siteId),
    queryFn: async () => {
      const ids = await apiFetch<number[]>(`/api/admin/sites/${siteId}/user-access`);
      setSelectedUserIds(ids ?? []);
      return ids ?? [];
    },
  });

  const ownerId: number | null = useMemo(() => {
    // On ne reçoit pas l'owner via SiteResponseDTO actuellement. On s'appuie donc sur le backend
    // qui garantit que le propriétaire reste dans la liste.
    return null;
  }, []);

  useEffect(() => {
    // Si on recharge la page, accessQuery remet déjà l'état via setSelectedUserIds.
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiFetch<void>(`/api/admin/sites/${siteId}/user-access`, {
        method: "PUT",
        body: JSON.stringify({ userIds: selectedUserIds }),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin", "site", siteId, "user-access"] }),
        qc.invalidateQueries({ queryKey: ["admin", "users"] }),
        qc.invalidateQueries({ queryKey: ["sites"] }),
      ]);
    },
  });

  const users = usersQuery.data ?? [];
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = users.slice().sort((a, b) => a.fullName.localeCompare(b.fullName, "fr"));
    if (!q) return list;
    return list.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [query, users]);

  const toggle = (userId: number, checked: boolean) => {
    setSelectedUserIds((prev) => {
      const set = new Set(prev);
      if (checked) set.add(userId);
      else set.delete(userId);
      return Array.from(set);
    });
  };

  const title = siteQuery.data?.name ? `Accès – ${siteQuery.data.name}` : "Accès au site";

  return (
    <div>
      <PageHeader
        title={title}
        subtitle="Choisir les utilisateurs autorisés à accéder à ce site."
        onBack={() => navigate("/admin/sites")}
        backLabel="Retour aux sites"
        actions={
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            className="px-4 py-2 text-sm rounded-lg bg-cap-vibrant text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Enregistrer
          </button>
        }
      />

      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un utilisateur (nom ou email)…"
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="text-sm font-semibold text-card-foreground">Utilisateurs</div>
          <div className="text-xs text-muted-foreground">
            {selectedUserIds.length} sélectionné(s)
            {accessQuery.isFetching ? " • chargement…" : ""}
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">
            {usersQuery.isLoading ? "Chargement…" : "Aucun utilisateur trouvé."}
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            {filteredUsers.map((u) => {
              const checked = selectedUserIds.includes(u.id);
              const disabled = ownerId != null && u.id === ownerId;
              return (
                <label
                  key={u.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-card-foreground truncate">{u.fullName}</div>
                    <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={(e) => toggle(u.id, e.target.checked)}
                  />
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

