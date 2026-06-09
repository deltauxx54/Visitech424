/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Calendar, Search, Star, CheckCircle } from 'lucide-react';

interface HeroSectionProps {
  onOpenBooking: () => void;
  onOpenExpiry: () => void;
  onOpenLoyalty: () => void;
}

export default function HeroSection({ onOpenBooking, onOpenExpiry, onOpenLoyalty }: HeroSectionProps) {
  // Use the image generated for us
  const bgPath = '/src/assets/images/vehicle_inspection_bg_1780804516806.png';

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-50 pb-16 pt-12 border-b border-slate-100" id="hero-section">
      {/* Background radial gradient and soft background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgPath}
          alt="Automotive diagnostic environment background"
          className="w-full h-full object-cover object-center opacity-8 scale-102"
          referrerPolicy="no-referrer"
          id="hero-bg-img"
        />
        {/* Glow & Vignette overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-slate-50/80 to-slate-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(37,99,235,0.06),transparent_50%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge - Professional Polish Style */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 backdrop-blur-sm mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>Expertise Technique & Gestion Digitale</span>
        </motion.div>
 
        {/* Heading - Space Grotesk pairing */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight"
        >
          La sécurité de votre véhicule <span className="text-blue-600">sans compromis.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed"
        >
          Planifiez votre rendez-vous de contrôle technique en 3 clics, suivez la validité réglementaire de vos véhicules et profitez de notre programme fidélité.
          <span className="block mt-2 font-semibold text-blue-600 text-xs sm:text-sm font-sans uppercase tracking-wider">
            Zéro paiement en ligne requis — Traitement transparent en centre agréé.
          </span>
        </motion.p>

        {/* Responsive CTA Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
        >
          <button
            onClick={onOpenBooking}
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-500/10 hover:bg-blue-700 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            id="hero-cta-book"
          >
            <Calendar className="h-5 w-5" />
            Prendre Rendez-vous
          </button>
          
          <button
            onClick={onOpenExpiry}
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
            id="hero-cta-expiry"
          >
            <Search className="h-5 w-5" />
            Vérifier une Échéance
          </button>
        </motion.div>

        {/* Mini stats cards - Staggered entrance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.65 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto text-left"
        >
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xl sm:text-2xl font-bold font-display text-slate-800">1 753</div>
            <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Véhicules mensuels</div>
          </div>
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xl sm:text-2xl font-bold font-display text-emerald-600 flex items-center gap-1.5">
              62.6% <CheckCircle className="h-4 w-4" />
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Taux de renouvellement</div>
          </div>
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={onOpenLoyalty}>
            <div className="text-xl sm:text-2xl font-bold font-display text-blue-600 flex items-center gap-1.5">
              Fidélité <Star className="h-4 w-4 fill-blue-600 text-blue-600" />
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider font-sans">Récompenses Actives</div>
          </div>
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xl sm:text-2xl font-bold font-display text-slate-800">0 FCFA</div>
            <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Frais de dossier</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
