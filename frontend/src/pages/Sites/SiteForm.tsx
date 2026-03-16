import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import { ArrowLeft, Save, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function SiteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [form, setForm] = useState({
    name: "",
    surface: "",
    employees: "",
    workstations: "",
    parkingUnderSlab: "",
    parkingUnderground: "",
    parkingOutdoor: "",
    energyConsumption: "",
    // Localisation
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
    // Typologie / usage
    buildingType: "",
    usageType: "",
    yearOfConstruction: "",
    yearOfRenovation: "",
    floorsCount: "",
    heatedAreaM2: "",
    cooledAreaM2: "",
    // Profil d'occupation
    occupancyDaysPerWeek: "",
    occupancyHoursPerDay: "",
    averageOccupancyRate: "",
    // Énergie détaillée
    electricityConsumption: "",
    gasConsumption: "",
    fuelOilConsumption: "",
    districtHeatingConsumption: "",
    renewableProduction: "",
    renewableSelfConsumptionRate: "",
    // Matériaux principaux (t)
    concreteTons: "",
    steelTons: "",
    glassTons: "",
    woodTons: "",
    // Notes
    activityDescription: "",
    notes: "",
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const site = await apiFetch<any>(`/api/sites/${id}`);
        setForm({
          name: site.name ?? "",
          surface: site.surfaceM2 != null ? String(site.surfaceM2) : "",
          employees: site.employeeCount != null ? String(site.employeeCount) : "",
          workstations: site.workstationCount != null ? String(site.workstationCount) : "",
          parkingUnderSlab: site.parkingBasement != null ? String(site.parkingBasement) : "",
          parkingUnderground: site.parkingUnderground != null ? String(site.parkingUnderground) : "",
          parkingOutdoor: site.parkingOutdoor != null ? String(site.parkingOutdoor) : "",
          energyConsumption: site.energyConsumptionKwh != null ? String(site.energyConsumptionKwh / 1000) : "",
          addressLine1: site.addressLine1 ?? "",
          addressLine2: site.addressLine2 ?? "",
          postalCode: site.postalCode ?? "",
          city: site.city ?? "",
          country: site.country ?? "",
          latitude: site.latitude != null ? String(site.latitude) : "",
          longitude: site.longitude != null ? String(site.longitude) : "",
          buildingType: site.buildingType ?? "",
          usageType: site.usageType ?? "",
          yearOfConstruction: site.yearOfConstruction != null ? String(site.yearOfConstruction) : "",
          yearOfRenovation: site.yearOfRenovation != null ? String(site.yearOfRenovation) : "",
          floorsCount: site.floorsCount != null ? String(site.floorsCount) : "",
          heatedAreaM2: site.heatedAreaM2 != null ? String(site.heatedAreaM2) : "",
          cooledAreaM2: site.cooledAreaM2 != null ? String(site.cooledAreaM2) : "",
          occupancyDaysPerWeek: site.occupancyDaysPerWeek != null ? String(site.occupancyDaysPerWeek) : "",
          occupancyHoursPerDay: site.occupancyHoursPerDay != null ? String(site.occupancyHoursPerDay) : "",
          averageOccupancyRate: site.averageOccupancyRate != null ? String(site.averageOccupancyRate * 100) : "",
          electricityConsumption: site.electricityConsumptionKwh != null ? String(site.electricityConsumptionKwh / 1000) : "",
          gasConsumption: site.gasConsumptionKwh != null ? String(site.gasConsumptionKwh / 1000) : "",
          fuelOilConsumption: site.fuelOilConsumptionKwh != null ? String(site.fuelOilConsumptionKwh / 1000) : "",
          districtHeatingConsumption: site.districtHeatingConsumptionKwh != null ? String(site.districtHeatingConsumptionKwh / 1000) : "",
          renewableProduction: site.renewableProductionKwh != null ? String(site.renewableProductionKwh / 1000) : "",
          renewableSelfConsumptionRate: site.renewableSelfConsumptionRate != null ? String(site.renewableSelfConsumptionRate * 100) : "",
          activityDescription: site.activityDescription ?? "",
          notes: site.notes ?? "",
        concreteTons: "",
        steelTons: "",
        glassTons: "",
        woodTons: "",
        });
      } catch (e: any) {
        toast({
          title: "Erreur lors du chargement du site",
          description: e?.message ?? "Impossible de charger les données du site.",
          variant: "destructive",
        });
      }
    })();
  }, [isEdit, id]);

  const handleSubmit = async (_calcul: boolean) => {
    const surfaceM2 = Number(form.surface);
    const employeeCount = Number(form.employees);
    const workstationCount = form.workstations ? Number(form.workstations) : 0;
    const parkingBasement = form.parkingUnderSlab ? Number(form.parkingUnderSlab) : 0;
    const parkingUnderground = form.parkingUnderground ? Number(form.parkingUnderground) : 0;
    const parkingOutdoor = form.parkingOutdoor ? Number(form.parkingOutdoor) : 0;
    const energyConsumptionKwh = form.energyConsumption ? Number(form.energyConsumption) * 1000 : 0; // MWh -> kWh

    const electricityConsumptionKwh = form.electricityConsumption
      ? Number(form.electricityConsumption) * 1000
      : energyConsumptionKwh || 0;
    const gasConsumptionKwh = form.gasConsumption ? Number(form.gasConsumption) * 1000 : 0;
    const fuelOilConsumptionKwh = form.fuelOilConsumption ? Number(form.fuelOilConsumption) * 1000 : 0;
    const districtHeatingConsumptionKwh = form.districtHeatingConsumption
      ? Number(form.districtHeatingConsumption) * 1000
      : 0;
    const renewableProductionKwh = form.renewableProduction ? Number(form.renewableProduction) * 1000 : 0;
    const renewableSelfConsumptionRate = form.renewableSelfConsumptionRate
      ? Number(form.renewableSelfConsumptionRate) / 100
      : undefined;

    const averageOccupancyRate = form.averageOccupancyRate
      ? Number(form.averageOccupancyRate) / 100
      : undefined;

    const payload = {
      name: form.name,
      surfaceM2,
      employeeCount,
      workstationCount,
      parkingBasement,
      parkingUnderground,
      parkingOutdoor,
      energyConsumptionKwh,
      // Localisation
      addressLine1: form.addressLine1 || undefined,
      addressLine2: form.addressLine2 || undefined,
      postalCode: form.postalCode || undefined,
      city: form.city || undefined,
      country: form.country || undefined,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      // Typologie / usage
      buildingType: form.buildingType || undefined,
      usageType: form.usageType || undefined,
      yearOfConstruction: form.yearOfConstruction ? Number(form.yearOfConstruction) : undefined,
      yearOfRenovation: form.yearOfRenovation ? Number(form.yearOfRenovation) : undefined,
      floorsCount: form.floorsCount ? Number(form.floorsCount) : undefined,
      heatedAreaM2: form.heatedAreaM2 ? Number(form.heatedAreaM2) : undefined,
      cooledAreaM2: form.cooledAreaM2 ? Number(form.cooledAreaM2) : undefined,
      // Profil d'occupation
      occupancyDaysPerWeek: form.occupancyDaysPerWeek ? Number(form.occupancyDaysPerWeek) : undefined,
      occupancyHoursPerDay: form.occupancyHoursPerDay ? Number(form.occupancyHoursPerDay) : undefined,
      averageOccupancyRate,
      // Énergie détaillée
      electricityConsumptionKwh,
      gasConsumptionKwh,
      fuelOilConsumptionKwh,
      districtHeatingConsumptionKwh,
      renewableProductionKwh,
      renewableSelfConsumptionRate,
      // Infos complémentaires
      activityDescription: form.activityDescription || undefined,
      notes: form.notes || undefined,
    };

    try {
      if (isEdit && id) {
        await apiFetch(`/api/sites/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        // Met à jour la composition matériaux pour le calcul construction
        await apiFetch(`/api/sites/${id}/composition`, {
          method: "POST",
          body: JSON.stringify({
            concreteTons: form.concreteTons ? Number(form.concreteTons) : 0,
            steelTons: form.steelTons ? Number(form.steelTons) : 0,
            glassTons: form.glassTons ? Number(form.glassTons) : 0,
            woodTons: form.woodTons ? Number(form.woodTons) : 0,
          }),
        });

        toast({
          title: "Site mis à jour",
          description: "Les informations du site et la composition matériaux ont bien été enregistrées.",
        });
        navigate(`/sites/${id}`);
        return;
      }

      const created = await apiFetch<any>("/api/sites", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          surfaceM2,
          employeeCount,
          workstationCount,
          parkingBasement,
          parkingUnderground,
          parkingOutdoor,
          energyConsumptionKwh,
          ...payload,
        }),
      });

      if (created?.id) {
        await apiFetch(`/api/sites/${created.id}/composition`, {
          method: "POST",
          body: JSON.stringify({
            concreteTons: form.concreteTons ? Number(form.concreteTons) : 0,
            steelTons: form.steelTons ? Number(form.steelTons) : 0,
            glassTons: form.glassTons ? Number(form.glassTons) : 0,
            woodTons: form.woodTons ? Number(form.woodTons) : 0,
          }),
        });
      }

      toast({
        title: "Site créé",
        description: "Le site a été créé avec succès.",
      });
      navigate("/sites");
    } catch (e: any) {
      toast({
        title: "Erreur lors de l'enregistrement",
        description: e?.message ?? "Une erreur est survenue lors de la sauvegarde du site.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={isEdit ? "Modifier le site" : "Nouveau site"}
        subtitle={isEdit ? "Mettez à jour les informations du site" : "Renseignez les informations du site"}
        actions={
          <Link to="/sites" className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        }
      />

      <div className="space-y-6">
        {/* General info */}
        <FormSection title="Informations générales">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Nom du site" value={form.name} onChange={(v) => update("name", v)} placeholder="Tour Europlaza — La Défense" required />
            <FormInput label="Surface (m²)" type="number" value={form.surface} onChange={(v) => update("surface", v)} placeholder="52000" required />
            <FormInput label="Nombre d'employés" type="number" value={form.employees} onChange={(v) => update("employees", v)} placeholder="3200" required />
            <FormInput label="Postes de travail" type="number" value={form.workstations} onChange={(v) => update("workstations", v)} placeholder="2800" />
          </div>
        </FormSection>

        {/* Parkings */}
        <FormSection title="Parkings">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput label="Sous-dalle" type="number" value={form.parkingUnderSlab} onChange={(v) => update("parkingUnderSlab", v)} placeholder="120" />
            <FormInput label="Sous-sol" type="number" value={form.parkingUnderground} onChange={(v) => update("parkingUnderground", v)} placeholder="300" />
            <FormInput label="Aérien" type="number" value={form.parkingOutdoor} onChange={(v) => update("parkingOutdoor", v)} placeholder="50" />
          </div>
        </FormSection>

        {/* Energy */}
        <FormSection title="Énergie">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <FormInput
              label="Consommation totale (MWh/an)"
              type="number"
              value={form.energyConsumption}
              onChange={(v) => update("energyConsumption", v)}
              placeholder="4200"
            />
            <FormInput
              label="Électricité (MWh/an)"
              type="number"
              value={form.electricityConsumption}
              onChange={(v) => update("electricityConsumption", v)}
              placeholder="3500"
            />
            <FormInput
              label="Gaz (MWh/an)"
              type="number"
              value={form.gasConsumption}
              onChange={(v) => update("gasConsumption", v)}
              placeholder="500"
            />
            <FormInput
              label="Fioul / Autres (MWh/an)"
              type="number"
              value={form.fuelOilConsumption}
              onChange={(v) => update("fuelOilConsumption", v)}
              placeholder="200"
            />
            <FormInput
              label="Chauffage urbain (MWh/an)"
              type="number"
              value={form.districtHeatingConsumption}
              onChange={(v) => update("districtHeatingConsumption", v)}
              placeholder="300"
            />
            <FormInput
              label="Production renouvelable (MWh/an)"
              type="number"
              value={form.renewableProduction}
              onChange={(v) => update("renewableProduction", v)}
              placeholder="150"
            />
            <FormInput
              label="Taux autoconsommation (%)"
              type="number"
              value={form.renewableSelfConsumptionRate}
              onChange={(v) => update("renewableSelfConsumptionRate", v)}
              placeholder="60"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Soit {form.energyConsumption ? (Number(form.energyConsumption) * 1000).toLocaleString("fr-FR") : "—"} kWh/an au total
          </p>
        </FormSection>

        {/* Localisation */}
        <FormSection title="Localisation & identification">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Adresse (ligne 1)" value={form.addressLine1} onChange={(v) => update("addressLine1", v)} placeholder="5 Rue Exemple" />
            <FormInput label="Adresse (ligne 2)" value={form.addressLine2} onChange={(v) => update("addressLine2", v)} placeholder="Batiment B" />
            <FormInput label="Code postal" value={form.postalCode} onChange={(v) => update("postalCode", v)} placeholder="75015" />
            <FormInput label="Ville" value={form.city} onChange={(v) => update("city", v)} placeholder="Paris" />
            <FormInput label="Pays" value={form.country} onChange={(v) => update("country", v)} placeholder="France" />
            <FormInput label="Code interne" value={form.internalCode} onChange={(v) => update("internalCode", v)} placeholder="SITE-RNS-01" />
            <FormInput label="Code externe / SIRET" value={form.externalCode} onChange={(v) => update("externalCode", v)} placeholder="123 456 789 00010" />
            <FormInput label="Latitude" type="number" value={form.latitude} onChange={(v) => update("latitude", v)} placeholder="48.8566" />
            <FormInput label="Longitude" type="number" value={form.longitude} onChange={(v) => update("longitude", v)} placeholder="2.3522" />
          </div>
        </FormSection>

        {/* Typologie & usage */}
        <FormSection title="Typologie & usage">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput label="Type de bâtiment" value={form.buildingType} onChange={(v) => update("buildingType", v)} placeholder="Bureaux" />
            <FormInput label="Usage principal" value={form.usageType} onChange={(v) => update("usageType", v)} placeholder="Centre de services" />
            <FormInput label="Année de construction" type="number" value={form.yearOfConstruction} onChange={(v) => update("yearOfConstruction", v)} placeholder="2008" />
            <FormInput label="Année de rénovation" type="number" value={form.yearOfRenovation} onChange={(v) => update("yearOfRenovation", v)} placeholder="2018" />
            <FormInput label="Nombre d'étages" type="number" value={form.floorsCount} onChange={(v) => update("floorsCount", v)} placeholder="8" />
            <FormInput label="Surface chauffée (m²)" type="number" value={form.heatedAreaM2} onChange={(v) => update("heatedAreaM2", v)} placeholder="9000" />
            <FormInput label="Surface climatisée (m²)" type="number" value={form.cooledAreaM2} onChange={(v) => update("cooledAreaM2", v)} placeholder="6000" />
          </div>
        </FormSection>

        {/* Profil d'occupation */}
        <FormSection title="Profil d'occupation">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Jours d'occupation / semaine"
              type="number"
              value={form.occupancyDaysPerWeek}
              onChange={(v) => update("occupancyDaysPerWeek", v)}
              placeholder="5"
            />
            <FormInput
              label="Heures d'occupation / jour"
              type="number"
              value={form.occupancyHoursPerDay}
              onChange={(v) => update("occupancyHoursPerDay", v)}
              placeholder="10"
            />
            <FormInput
              label="Taux d'occupation moyen (%)"
              type="number"
              value={form.averageOccupancyRate}
              onChange={(v) => update("averageOccupancyRate", v)}
              placeholder="70"
            />
          </div>
        </FormSection>

        {/* Composition principale (ACV) */}
        <FormSection title="Composition principale (ACV)">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormInput
              label="Béton armé (t)"
              type="number"
              value={form.concreteTons}
              onChange={(v) => update("concreteTons", v)}
              placeholder="500"
            />
            <FormInput
              label="Acier primaire (t)"
              type="number"
              value={form.steelTons}
              onChange={(v) => update("steelTons", v)}
              placeholder="80"
            />
            <FormInput
              label="Verre plat (t)"
              type="number"
              value={form.glassTons}
              onChange={(v) => update("glassTons", v)}
              placeholder="20"
            />
            <FormInput
              label="Bois résineux (t)"
              type="number"
              value={form.woodTons}
              onChange={(v) => update("woodTons", v)}
              placeholder="50"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Estimation des tonnages structuraux pour alimenter le calcul ACV (conversion automatique en kg).
          </p>
        </FormSection>

        {/* Notes */}
        <FormSection title="Contexte & remarques">
          <div className="space-y-3">
            <FormInput
              label="Description de l'activité"
              value={form.activityDescription}
              onChange={(v) => update("activityDescription", v)}
              placeholder="Plateforme de services numériques pour clients européens..."
            />
            <FormInput
              label="Notes (audit, spécificités, projets)"
              value={form.notes}
              onChange={(v) => update("notes", v)}
              placeholder="Travaux prévus en 2026, rénovation CVC..."
            />
          </div>
        </FormSection>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
          <button onClick={() => handleSubmit(true)} className="inline-flex items-center justify-center gap-2 gradient-brand text-primary-foreground font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm">
            <Zap className="w-4 h-4" /> Enregistrer et calculer
          </button>
          <button onClick={() => handleSubmit(false)} className="inline-flex items-center justify-center gap-2 border border-border text-foreground font-medium px-5 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm">
            <Save className="w-4 h-4" /> Enregistrer sans calcul
          </button>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-base font-semibold text-card-foreground mb-4">{title}</h2>
      {children}
    </motion.div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-card-foreground mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-shadow"
      />
    </div>
  );
}
