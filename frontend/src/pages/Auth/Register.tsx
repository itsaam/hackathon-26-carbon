import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch {
      setError("Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cap-vibrant/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-cap-blue/5 blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 shadow-glow">
            <img src="/icon.png" alt="CarbonTrack" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CarbonTrack</h1>
          <p className="text-sm text-white/70 mt-1">Empreinte carbone de vos sites</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
          <h2 className="text-lg font-semibold text-card-foreground mb-6">Créer un compte</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1.5">Nom complet</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Marie Dupont" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="marie.dupont@capgemini.com" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1.5">Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1.5">Confirmer</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40" required />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" className="w-full gradient-brand text-primary-foreground font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm">
              S'inscrire <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Déjà inscrit ? <Link to="/login" className="text-cap-vibrant hover:underline font-medium">Se connecter</Link>
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <img src="/logo.png" alt="Capgemini" className="h-5 w-auto opacity-80" />
        </div>
      </motion.div>
    </div>
  );
}
