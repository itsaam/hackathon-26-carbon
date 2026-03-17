import PageHeader from "@/components/ui/PageHeader";
import { apiFetch } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

type Employee = {
  id: number;
  managerId: number;
  firstName: string;
  lastName: string;
  email: string;
};

type Manager = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  employees: Employee[];
};

export default function AdminOrganization() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);

  const [newManager, setNewManager] = useState({ firstName: "", lastName: "", email: "" });
  const [newEmployee, setNewEmployee] = useState({ managerId: "", firstName: "", lastName: "", email: "" });

  const managerOptions = useMemo(
    () =>
      managers
        .slice()
        .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "fr"))
        .map((m) => ({ id: m.id, label: `${m.lastName} ${m.firstName}` })),
    [managers]
  );

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<Manager[]>("/api/org/managers");
      setManagers(data || []);
    } catch (e: any) {
      setError(e?.message || "Impossible de charger l’organisation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createManager = async () => {
    try {
      setError(null);
      await apiFetch("/api/org/managers", { method: "POST", body: JSON.stringify(newManager) });
      setNewManager({ firstName: "", lastName: "", email: "" });
      await load();
    } catch (e: any) {
      setError(e?.message || "Impossible de créer le manager.");
    }
  };

  const createEmployee = async () => {
    try {
      setError(null);
      const body = { ...newEmployee, managerId: Number(newEmployee.managerId) };
      await apiFetch("/api/org/employees", { method: "POST", body: JSON.stringify(body) });
      setNewEmployee({ managerId: "", firstName: "", lastName: "", email: "" });
      await load();
    } catch (e: any) {
      setError(e?.message || "Impossible de créer l’employé.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Managers & employés"
        subtitle="Liste des managers et des employés rattachés (nom, prénom, email)."
      />

      {error && (
        <div className="mb-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-card-foreground">Créer un manager</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={newManager.firstName}
              onChange={(e) => setNewManager((s) => ({ ...s, firstName: e.target.value }))}
              placeholder="Prénom"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <input
              value={newManager.lastName}
              onChange={(e) => setNewManager((s) => ({ ...s, lastName: e.target.value }))}
              placeholder="Nom"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <input
              value={newManager.email}
              onChange={(e) => setNewManager((s) => ({ ...s, email: e.target.value }))}
              placeholder="Email"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={createManager}
              className="px-4 py-2 rounded-lg gradient-brand text-primary-foreground text-sm font-medium"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={load}
              className="px-3 py-2 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted transition-colors"
            >
              Rafraîchir
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-card-foreground">Créer un employé</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={newEmployee.managerId}
              onChange={(e) => setNewEmployee((s) => ({ ...s, managerId: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">Manager…</option>
              {managerOptions.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.label}
                </option>
              ))}
            </select>
            <input
              value={newEmployee.firstName}
              onChange={(e) => setNewEmployee((s) => ({ ...s, firstName: e.target.value }))}
              placeholder="Prénom"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <input
              value={newEmployee.lastName}
              onChange={(e) => setNewEmployee((s) => ({ ...s, lastName: e.target.value }))}
              placeholder="Nom"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <input
              value={newEmployee.email}
              onChange={(e) => setNewEmployee((s) => ({ ...s, email: e.target.value }))}
              placeholder="Email"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <button
            type="button"
            disabled={!newEmployee.managerId}
            onClick={createEmployee}
            className="px-4 py-2 rounded-lg gradient-brand text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            Ajouter
          </button>
        </div>
      </div>

      <div className="mt-6 bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-card-foreground">Liste</h2>
          <span className="text-xs text-muted-foreground">
            {loading ? "Chargement..." : `${managers.length} manager(s)`}
          </span>
        </div>

        {managers.length === 0 && !loading ? (
          <div className="text-sm text-muted-foreground">Aucun manager pour le moment.</div>
        ) : (
          <div className="space-y-4">
            {managers.map((m) => (
              <div key={m.id} className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="text-sm font-semibold text-card-foreground">
                    {m.lastName} {m.firstName}
                  </div>
                  <div className="text-xs text-muted-foreground">{m.email}</div>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground mb-2">
                    Employés ({m.employees?.length ?? 0})
                  </div>
                  {(m.employees?.length ?? 0) === 0 ? (
                    <div className="text-sm text-muted-foreground">Aucun employé rattaché.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {m.employees.map((e) => (
                        <div key={e.id} className="rounded-md border border-border bg-background px-3 py-2">
                          <div className="text-sm text-card-foreground">
                            {e.lastName} {e.firstName}
                          </div>
                          <div className="text-xs text-muted-foreground">{e.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

