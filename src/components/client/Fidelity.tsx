/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Award, 
  Flame, 
  Star, 
  Trophy, 
  Sparkles, 
  Check, 
  TrendingUp, 
  Clock, 
  History,
  ShieldCheck,
  Zap,
  Gift,
  ShieldAlert,
  Sliders,
  Sparkle
} from 'lucide-react';
import { motion } from 'motion/react';
import { LoyaltyAccount } from '../../types';

interface FidelityProps {
  currentClient: { name: string; plate: string; phone: string; };
  loyaltyAccounts: LoyaltyAccount[];
}

export default function Fidelity({
  currentClient,
  loyaltyAccounts
}: FidelityProps) {
  
  // Find current client loyalty account
  const account = loyaltyAccounts.find(
    acc => acc.immatriculation === currentClient.plate || acc.clientName === currentClient.name
  );

  // We count STRICTLY in number of visits (inspectionsCount)
  const visits = account?.inspectionsCount || 0;
  
  // Define dynamic status based on visits count
  let level = 'Visiteur Standard';
  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
  
  if (visits >= 5) {
    level = 'Excellence Platine VIP';
    badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
  } else if (visits >= 4) {
    level = 'Membre Or VIP';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse';
  } else if (visits >= 3) {
    level = 'Membre Argent';
    badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
  } else if (visits >= 1) {
    level = 'Membre Bronze';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }

  // 1 to 5 milestones/échelons mapping
  const milestones = [
    { 
      id: 1, 
      count: 1, 
      title: 'Échelon 1 - Enregistrement', 
      desc: 'Accès permanent à vos relevés de plaques.', 
      reward: 'Alerte SMS prioritaires gratuites',
      color: 'emerald'
    },
    { 
      id: 2, 
      count: 2, 
      title: 'Échelon 2 - Fidélisation', 
      desc: 'Relevé de diagnostic prévente offert.', 
      reward: '10% de points d-entretien offerts',
      color: 'teal'
    },
    { 
      id: 3, 
      count: 3, 
      title: 'Échelon 3 - Argent', 
      desc: 'Couloir de passage rapide garanti.', 
      reward: 'Banc d-attente VIP dédié (< 20 min)',
      color: 'blue'
    },
    { 
      id: 4, 
      count: 4, 
      title: 'Échelon 4 - Or', 
      desc: 'Priorité d-inspection absolue sans retard.', 
      reward: 'Prise en charge express (< 15 min)',
      color: 'amber'
    },
    { 
      id: 5, 
      count: 5, 
      title: 'Échelon 5 - Excellence Platine', 
      desc: 'Le summum de la sécurité certifiée.', 
      reward: 'Inspecteur en chef dédié + Diagnostic complet imprimé',
      color: 'purple'
    }
  ];

  // Fluid level percentage based on visits (max 5)
  const fluidPercentage = Math.min(100, (visits / 5) * 100);

  return (
    <div className="space-y-6" id="fidelity-view">
      
      {/* Title */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="font-display text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Award className="h-6 w-6 text-blue-600 animate-pulse" />
          Suivi d'Activité &amp; Jauge de Fidélité
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Suivez votre volume d'inspections réglementaires effectuées. Notre barème évalue directement votre fidélité au <strong>nombre de visites techniques validées</strong>.
        </p>
      </div>

      {/* Grid: Visual progress tube (left) & Perks grid (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column - The capillary liquid tube (vertical thermometer model) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-205/80 p-6 flex flex-col justify-between relative shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-blue-600" />
                Tube de Pression Fidélité
              </h3>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                {level}
              </span>
            </div>

            {/* Current visits counts summary block */}
            <div className="bg-white border border-slate-150 p-4 rounded-xl flex items-center justify-between shadow-3xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block leading-none">
                  Compteur de passages :
                </span>
                <span className="text-3xl font-extrabold text-slate-800 font-mono mt-1 block">
                  {visits} <span className="text-xs font-semibold text-slate-500 font-sans">visite{visits > 1 ? 's' : ''}</span>
                </span>
              </div>
              <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center">
                <Flame className="h-5 w-5 text-blue-600" />
              </div>
            </div>

            {/* HIGHLY STYLISH VERTICAL LIQUID TUBE & NOTCHES */}
            <div className="flex py-6 justify-center">
              <div className="flex items-stretch gap-8 w-full max-w-sm" id="loyalty-fluid-tube-container">
                
                {/* 1. The stylized physical tube glass capillary */}
                <div className="relative w-16 bg-slate-100 border-2 border-slate-300 rounded-full flex flex-col justify-end p-0.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] h-96 overflow-hidden">
                  
                  {/* Glowing background container */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-200/40 via-white/10 to-slate-200/40 pointer-events-none z-10 rounded-full" />
                  
                  {/* Liquid Fill bar */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(5, fluidPercentage)}%` }}
                    transition={{ type: 'spring', stiffness: 45, damping: 15 }}
                    className="w-full rounded-full bg-gradient-to-t from-blue-700 via-indigo-500 to-emerald-400 relative shadow-[0_0_12px_rgba(79,70,229,0.4)]"
                  >
                    
                    {/* Glass glare effect inside liquid */}
                    <div className="absolute top-0 left-1 w-2 h-full opacity-35 bg-white/40 rounded-full pointer-events-none" />

                    {/* Animated Micro bubbles floating inside standard fluid */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute bottom-4 left-3 w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                      <div className="absolute bottom-12 right-2 w-1 h-1 bg-white/40 rounded-full animate-pulse" />
                      <div className="absolute bottom-20 left-4 w-1.5 h-1.5 bg-white/60 rounded-full animate-ping" />
                      <div className="absolute bottom-32 right-4 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
                    </div>

                    {/* Top fluid wave/pulse cap */}
                    <div className="absolute -top-1 left-0 right-0 h-2 bg-white/70 rounded-full mix-blend-overlay animate-pulse" />

                  </motion.div>
                </div>

                {/* 2. Right side vertical notches (Échelons) */}
                <div className="flex flex-col justify-between flex-grow py-1 font-mono text-xs text-slate-500 relative">
                  
                  {/* Vertical connect line behind milestones */}
                  <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-slate-200 -translate-x-2.5 pointer-events-none" />

                  {[5, 4, 3, 2, 1].map((step) => {
                    const isReached = visits >= step;
                    const stepMeta = milestones.find(m => m.count === step);

                    return (
                      <div 
                        key={step} 
                        className={`flex items-center gap-3 transition-all relative ${
                          isReached ? 'text-slate-800 font-bold' : 'text-slate-400 font-medium'
                        }`}
                      >
                        {/* Horizontal tick line extending from the tube connection line */}
                        <div className={`absolute -left-4.5 w-4 h-0.5 -translate-x-0.5 ${
                          isReached ? 'bg-indigo-500' : 'bg-slate-250'
                        }`} />

                        {/* Round checkbox / checkpoint badge */}
                        <div className={`h-5.5 w-5.5 rounded-full flex items-center justify-center border text-[9px] shrink-0 font-bold transition-all ${
                          isReached 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20' 
                            : 'bg-white text-slate-350 border-slate-200'
                        }`}>
                          {isReached ? <Check className="h-3 w-3 stroke-[3]" /> : step}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-sans tracking-tight">
                              {step} {step > 1 ? 'visites' : 'visite'}
                            </span>
                            {isReached && <Sparkle className="h-3 w-3 text-emerald-500 fill-emerald-500" />}
                          </div>
                          <p className="text-[9px] text-slate-400 font-sans font-medium line-clamp-1 leading-none mt-0.5">
                            {stepMeta?.reward}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                </div>

              </div>
            </div>

            {/* Interactive informative note */}
            <div className="bg-slate-50/80 border border-slate-200 p-3.5 rounded-xl text-center">
              {visits >= 5 ? (
                <p className="text-[10px] text-purple-800 font-bold flex items-center justify-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                  Vous avez franchi tous les échelons de fidélité ! Elite Platine actif.
                </p>
              ) : (
                <p className="text-[10px] text-slate-600 font-medium leading-relaxed font-sans">
                  Prévoyez encore <strong className="font-bold font-mono text-blue-700">{5 - visits} passage{5 - visits > 1 ? 's' : ''}</strong> pour faire monter la jauge à pression et débloquer le statut <strong>Excellence Platine VIP</strong> !
                </p>
              )}
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 mt-5 text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-650" />
            Suivi des validations certifié par l'atelier
          </div>
        </div>

        {/* Right column - Perks bento-list cards */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-205 shadow-xs p-6 space-y-4">
            <h3 className="font-display font-bold text-slate-850 text-sm uppercase tracking-wider flex items-center gap-2">
              <Gift className="h-4.5 w-4.5 text-blue-600" />
              Vos Privilèges par Échelon de Passage
            </h3>

            <div className="space-y-3.5">
              {milestones.map((milestone) => {
                const isActive = visits >= milestone.count;

                let borderClass = 'border-slate-100 bg-slate-50/40 text-slate-500';
                let accentColor = 'text-slate-400';
                let iconBg = 'bg-slate-100 text-slate-500';

                if (isActive) {
                  borderClass = 'border-blue-200 bg-blue-50/10 text-slate-800 shadow-3xs';
                  accentColor = 'text-blue-600 font-bold';
                  iconBg = 'bg-blue-50 text-blue-700 border-blue-100';
                }

                return (
                  <div 
                    key={milestone.id} 
                    className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${borderClass}`}
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center border shrink-0 ${iconBg} font-mono font-bold text-sm`}>
                      {milestone.count}
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-800">{milestone.title}</h4>
                        {isActive && (
                          <span className="text-[8px] bg-emerald-100 text-emerald-850 border border-emerald-250 font-black px-2 py-0.2 rounded-full uppercase tracking-wider">
                            Acquis
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {milestone.desc}
                      </p>
                      
                      <div className="pt-1 flex items-center gap-1.5 font-sans">
                        <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">Avantage :</span>
                        <strong className={`text-[10px] ${accentColor}`}>{milestone.reward}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
