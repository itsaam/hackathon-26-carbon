import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/ui/PageHeader";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id?: number;
  email: string;
  fullName: string;
  role?: string | null;
  createdAt?: string;
}

export default function AdminUsers() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<User | null>(null);
  const [password, setPassword] = useState<string>("");

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiFetch<User[]>("/api/users"),
  });

  const users = usersQuery.data ?? [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const payload: any = {
        email: editing.email,
        fullName: editing.fullName,
        role: editing.role ?? "USER",
      };
      if (password.trim().length > 0) {
        payload.password = password;
      }

      if (editing.id) {
        return apiFetch<User>(`/api/users/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
      return apiFetch<User>("/api/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      setEditing(null);
      setPassword("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiFetch(`/api/users/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  return (
    <div>
      <PageHeader
        title="Utilisateurs & rôles"
        subtitle="Visualiser qui a accès à la plateforme et sous quel rôle"
        onBack={() => navigate("/admin")}
        backLabel="Retour à l’administration"
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing({ fullName: "", email: "", role: "USER" });
              setPassword("");
            }}
            className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
          >
            Nouveau compte
          </button>
        }
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3.5 font-semibold text-card-foreground">Nom</th>
              <th className="text-left px-4 py-3.5 font-semibold text-card-foreground">Email</th>
              <th className="text-left px-4 py-3.5 font-semibold text-card-foreground">Rôle</th>
              <th className="text-left px-4 py-3.5 font-semibold text-card-foreground">Créé le</th>
              <th className="text-right px-4 py-3.5 font-semibold text-card-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3.5">{u.fullName}</td>
                <td className="px-4 py-3.5 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3.5 text-muted-foreground">
                  <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide">
                    {u.role ?? "USER"}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-muted-foreground">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "—"}
                </td>
                <td className="px-4 py-3.5 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditing(u);
                      setPassword("");
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    Modifier
                  </button>
                  {u.id && (
                    <button
                      onClick={() => deleteMutation.mutate(u.id!)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  Aucun utilisateur trouvé.
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
              {editing.id ? "Modifier l’utilisateur" : "Nouveau compte utilisateur"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Field
                label="Nom complet"
                value={editing.fullName}
                onChange={(v) => setEditing({ ...editing, fullName: v })}
              />
              <Field
                label="Email"
                value={editing.email}
                onChange={(v) => setEditing({ ...editing, email: v })}
              />
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Rôle</label>
                <select
                  value={editing.role ?? "USER"}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <Field
                label={editing.id ? "Mot de passe (laisser vide pour ne pas changer)" : "Mot de passe initial"}
                type="password"
                value={password}
                onChange={setPassword}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setEditing(null);
                  setPassword("");
                }}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => saveMutation.mutate()}
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

