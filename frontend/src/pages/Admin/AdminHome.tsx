import PageHeader from "@/components/ui/PageHeader";
import { Users, Boxes, Fuel } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminHome() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Administration"
        subtitle="Centre de contrôle pour les utilisateurs, les matériaux et les facteurs énergie"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="group bg-card border border-border rounded-xl p-4 text-left hover:border-primary/60 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <div className="font-semibold text-card-foreground">Utilisateurs & rôles</div>
              <div className="text-xs text-muted-foreground">Visualiser qui a accès à la plateforme.</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Aucun utilisateur actif pour le moment.
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/materials")}
          className="group bg-card border border-border rounded-xl p-4 text-left hover:border-primary/60 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Boxes className="h-5 w-5" />
            </span>
            <div>
              <div className="font-semibold text-card-foreground">Matériaux</div>
              <div className="text-xs text-muted-foreground">Gestion de la base de matériaux et facteurs.</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Bientôt : édition fine des facteurs matériaux directement depuis cette page.
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/energy-factors")}
          className="group bg-card border border-border rounded-xl p-4 text-left hover:border-primary/60 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Fuel className="h-5 w-5" />
            </span>
            <div>
              <div className="font-semibold text-card-foreground">Facteurs énergie & ADEME</div>
              <div className="text-xs text-muted-foreground">
                Synchroniser les facteurs avec la Base Carbone de l&apos;ADEME.
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Derniers facteurs disponibles utilisés dans les calculs.</span>
          </div>
        </button>
      </div>
    </div>
  );
}

