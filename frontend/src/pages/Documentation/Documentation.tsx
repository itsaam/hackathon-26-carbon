import { motion } from "framer-motion";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MermaidDiagram } from "@/components/documentation/MermaidDiagram";
import {
  FileText,
  Layers,
  Database,
  BookOpen,
  Package,
  ArrowRight,
  Play,
} from "lucide-react";

const YOUTUBE_VIDEO_ID = "MTRxSBIodiQ";
const YOUTUBE_EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`;
const YOUTUBE_WATCH_URL = `https://youtu.be/${YOUTUBE_VIDEO_ID}`;

const ERD_MARKDOWN = `erDiagram
  USERS ||--o{ SITES : owns
  SITES ||--o{ CARBON_RESULTS : has
  SITES ||--o{ SITE_MATERIALS : has
  MATERIALS ||--o{ SITE_MATERIALS : referenced_by

  USERS {
    int id PK
    string email
    string password_hash
    string full_name
    datetime created_at
  }

  SITES {
    int id PK
    int user_id FK
    string name
    float surface_m2
    int employee_count
    float energy_consumption_kwh
    float electricity_mwh
    float gas_mwh
    float latitude
    float longitude
    string address
    datetime created_at
    datetime updated_at
  }

  MATERIALS {
    int id PK
    string name
    float emission_factor_kgco2e_per_tonne
    string unit
    string source
  }

  SITE_MATERIALS {
    int id PK
    int site_id FK
    int material_id FK
    float quantity_tonnes
  }

  CARBON_RESULTS {
    int id PK
    int site_id FK
    float construction_co2_kg
    float exploitation_co2_kg
    float total_co2_kg
    float co2_per_m2
    float co2_per_employee
    datetime calculated_at
  }

  ENERGY_FACTORS {
    int id PK
    string energy_type
    float emission_factor_kgco2e_per_kwh
    int year
    string source
  }
`;

const UML_CLASS_MARKDOWN = `classDiagram
  direction LR

  class User {
    +id: number
    +email: string
    +fullName: string
    +createdAt: datetime
  }

  class Site {
    +id: number
    +name: string
    +surfaceM2: number
    +employeeCount: number
    +energyConsumptionKwh: number
    +latitude: number
    +longitude: number
  }

  class Material {
    +id: number
    +name: string
    +emissionFactor: number
    +unit: string
    +source: string
  }

  class SiteMaterial {
    +id: number
    +quantityTonnes: number
  }

  class CarbonResult {
    +id: number
    +constructionCo2Kg: number
    +exploitationCo2Kg: number
    +totalCo2Kg: number
    +calculatedAt: datetime
  }

  class EnergyFactor {
    +id: number
    +energyType: string
    +emissionFactor: number
    +year: number
  }

  User "1" --> "0..*" Site : owns
  Site "1" --> "0..*" CarbonResult : results
  Site "1" --> "0..*" SiteMaterial : composition
  SiteMaterial "*" --> "1" Material : material
`;

const UML_SEQUENCE_MARKDOWN = `sequenceDiagram
  autonumber
  actor Client as Web/Mobile
  participant API as Backend (Spring)
  participant DB as PostgreSQL
  participant GEO as Nominatim (optionnel)

  Client->>API: POST /api/sites/{id}/calculate (JWT)
  API->>DB: Charger Site + SiteMaterials + Materials
  DB-->>API: Données site + composition
  API->>DB: Charger facteurs énergie (année 2024)
  DB-->>API: energy_factors
  API->>API: Calcul construction + exploitation + KPIs
  API->>DB: INSERT carbon_results (historisation)
  DB-->>API: OK
  API-->>Client: 200 CarbonResultDTO
`;

const sectionVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function Documentation() {
  return (
    <div className="space-y-12 pb-12">
      <PageHeader
        title="Documentation"
        subtitle="UML, architecture, MCD/ERD, cahier des charges et livrables du projet CarbonTrack."
      />

      <motion.section
        id="video"
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.35 }}
        className="scroll-mt-8"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-cap-vibrant" />
              <CardTitle>Vidéo</CardTitle>
            </div>
            <CardDescription>
              Démo ou présentation du projet CarbonTrack.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video w-full max-w-3xl mx-auto rounded-lg overflow-hidden border border-border bg-muted">
              <iframe
                src={YOUTUBE_EMBED_URL}
                title="Vidéo CarbonTrack"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              <a
                href={YOUTUBE_WATCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cap-vibrant hover:underline inline-flex items-center gap-1.5"
              >
                <Play className="h-4 w-4" />
                Voir sur YouTube
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        id="uml"
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.35 }}
        className="scroll-mt-8"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-cap-vibrant" />
              <CardTitle>UML</CardTitle>
            </div>
            <CardDescription>
              Schémas UML du domaine (classes) et séquence de recalcul d’un site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Diagramme de classes — cœur du domaine</h3>
              <MermaidDiagram chart={UML_CLASS_MARKDOWN} id="uml-classes" className="min-h-[280px]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Diagramme de séquence — recalcul d’un site</h3>
              <MermaidDiagram chart={UML_SEQUENCE_MARKDOWN} id="uml-sequence" className="min-h-[280px]" />
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        id="architecture"
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.35, delay: 0.05 }}
        className="scroll-mt-8"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-cap-vibrant" />
              <CardTitle>Architecture</CardTitle>
            </div>
            <CardDescription>
              Architecture logique et stack technique du projet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted/30 p-4 font-mono text-sm">
              <pre className="whitespace-pre">
{`Mobile (Expo)  ─┐
               ├──> Backend (Spring Boot, API REST, JWT) ───> PostgreSQL
Web (React)   ──┘`}
              </pre>
            </div>
            <div className="rounded-lg overflow-hidden border border-border">
              <img
                src="/docs/architecture.png"
                alt="Schéma d’architecture Web + Mobile + API"
                className="w-full h-auto object-contain bg-muted/20"
              />
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong className="text-foreground">Backend :</strong> Java 17, Spring Boot 3.x, Spring Security (JWT), JPA/Hibernate, PostgreSQL</li>
              <li><strong className="text-foreground">Frontend web :</strong> React 18 + Vite, Tailwind (UI), React Query, Recharts, Leaflet</li>
              <li><strong className="text-foreground">Mobile :</strong> Expo (expo-router), React Native</li>
              <li><strong className="text-foreground">Géocodage :</strong> Nominatim (OpenStreetMap)</li>
              <li><strong className="text-foreground">Export PDF :</strong> openpdf (dépendance Maven)</li>
            </ul>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        id="mcd-erd"
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.35, delay: 0.1 }}
        className="scroll-mt-8"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-cap-vibrant" />
              <CardTitle>MCD / ERD</CardTitle>
            </div>
            <CardDescription>
              Modèle conceptuel / schéma relationnel (entités JPA du projet).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MermaidDiagram chart={ERD_MARKDOWN} id="erd" className="min-h-[400px]" />
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        id="cahier-des-charges"
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.35, delay: 0.15 }}
        className="scroll-mt-8"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cap-vibrant" />
              <CardTitle>Cahier des charges</CardTitle>
            </div>
            <CardDescription>
              Alignement avec le cahier des charges (paliers livrés).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cap-vibrant/20">
                  <span className="text-xs font-bold text-cap-vibrant">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Palier base — Socle technique</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Backend Spring Boot + PostgreSQL + API REST. Saisie d’un site, calcul CO₂ (construction + exploitation)
                    et historisation via CarbonResult. Front web en React (validé avec le client pour le hackathon).
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cap-vibrant/20">
                  <span className="text-xs font-bold text-cap-vibrant">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Palier 1 — Dashboard & Mobile</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Dashboard web : KPIs (CO₂ total, /m², /employé), graphiques, répartition construction / exploitation.
                    Application mobile Expo : auth JWT, saisie rapide terrain (énergie + matériaux), consultation et historique.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cap-vibrant/20">
                  <span className="text-xs font-bold text-cap-vibrant">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Palier 2 — Fonctions avancées & comparaison</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comparaison multi-sites (tableau + bar chart), historisation avancée (courbes, page History),
                    export rapports site (HTML + PDF) et scénarios (PDF réel vs scénario), carte avec markers colorés (tCO₂e),
                    facteurs ADEME Base Carbone 2024 en base.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section
        id="livrables"
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.35, delay: 0.2 }}
        className="scroll-mt-8"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-cap-vibrant" />
              <CardTitle>Livrables</CardTitle>
            </div>
            <CardDescription>
              Résumé des livrables — Hackathon #26 Empreinte Carbone Site Physique (Capgemini, 16–17 mars 2026).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                Résumé exécutif
              </h4>
              <p className="text-sm text-muted-foreground">
                Plateforme full-stack pour la création et gestion de sites (surface, employés, énergie, typologie,
                géolocalisation, composition matériaux ACV simplifiée), calcul et historisation de l’empreinte carbone,
                dashboard web (KPI, graphiques, carte/heatmap, comparaison), et application mobile terrain (consultation,
                saisie rapide exploitation + matériaux, historique). Calcul : construction (tonnages × facteurs) et
                exploitation (consommation × facteurs énergie ADEME 2024) ; KPIs total, /m², /employé.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-4 space-y-2">
                <h4 className="font-medium text-foreground text-sm">Backend (API REST)</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Auth JWT (register, login)</li>
                  <li>• CRUD Sites + composition matériaux</li>
                  <li>• Calcul construction + exploitation, historisation</li>
                  <li>• Dashboard, comparaison, exports (rapport site, scénario)</li>
                  <li>• Géocodage Nominatim</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border p-4 space-y-2">
                <h4 className="font-medium text-foreground text-sm">Frontend web</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Auth, navigation, sites (création / édition / détail, recalcul)</li>
                  <li>• Dashboard KPI + graphiques</li>
                  <li>• Historique, comparaison multi-sites, carte</li>
                  <li>• Scénarios what-if, export rapport HTML/PDF</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border p-4 space-y-2 sm:col-span-2">
                <h4 className="font-medium text-foreground text-sm">Mobile (Expo)</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Auth JWT, liste et détail des sites (KPI), recalcul (année 2024)</li>
                  <li>• Saisie rapide exploitation (MWh/an) et matériaux (tonnages), historique des calculs par site</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              Document complet : <code className="bg-muted px-1 rounded">docs/LIVRABLE.md</code> dans le dépôt.
            </p>
          </CardContent>
        </Card>
      </motion.section>

      {/* Navigation rapide */}
      <nav className="sticky bottom-4 rounded-lg border border-border bg-card/95 backdrop-blur p-4 shadow-lg">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Navigation</p>
        <ScrollArea className="w-full">
          <div className="flex flex-wrap gap-2">
            <a href="#video" className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors">
              <Play className="h-3.5 w-3.5" /> Vidéo
            </a>
            <a href="#uml" className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors">
              <Layers className="h-3.5 w-3.5" /> UML
            </a>
            <a href="#architecture" className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors">
              <Layers className="h-3.5 w-3.5" /> Architecture
            </a>
            <a href="#mcd-erd" className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors">
              <Database className="h-3.5 w-3.5" /> MCD / ERD
            </a>
            <a href="#cahier-des-charges" className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors">
              <BookOpen className="h-3.5 w-3.5" /> Cahier des charges
            </a>
            <a href="#livrables" className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors">
              <Package className="h-3.5 w-3.5" /> Livrables
            </a>
          </div>
        </ScrollArea>
      </nav>
    </div>
  );
}
