/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Award, Search, Sparkles, Check, Flame, Star, Trophy } from 'lucide-react';
import { LoyaltyAccount } from '../types';

interface LoyaltyTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  loyaltyAccounts: LoyaltyAccount[];
}

export default function LoyaltyTracker({ isOpen, onClose, loyaltyAccounts }: LoyaltyTrackerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState<LoyaltyAccount | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setErrorText('Veuillez entrer une plaque d\'immatriculation ou un numéro de téléphone.');
      return;
    }

    const clean = searchQuery.trim().toUpperCase();
    const found = loyaltyAccounts.find(
      (item) => item.immatriculation === clean || item.phone === clean || item.phone.includes(clean)
    );

    setResult(found || null);
    setSearched(true);
    setErrorText('');
  };

  const handleSelectSample = (plate: string) => {
    setSearchQuery(plate);
    const found = loyaltyAccounts.find((item) => item.immatriculation === plate);
    setResult(found || null);
    setSearched(true);
    setErrorText('');
  };

  const handleCloseModal = () => {
    setSearchQuery('');
    setResult(null);
    setSearched(false);
    setErrorText('');
    onClose();
  };

  // Tier color settings
  const getTierDetails = (level: 'Bronze' | 'Silver' | 'Gold') => {
    switch (level) {
      case 'Gold':
        return {
          textColor: 'text-amber-700',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          icon: Trophy,
          benefits: [
            'Couloir d\'examen prioritaire VIP sans attente (Temps de passage < 15 minutes)',
            'Contrôle gratuit de la géométrie et de l\'équilibrage des roues',
            'Lavage complet de courtoisie (Pare-brise et phares)'
          ]
        };
      case 'Silver':
        return {
          textColor: 'text-slate-700',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          icon: Star,
          benefits: [
            'Couloir d\'examen rapide (Attente garantie < 20 minutes)',
            'Vaporisation antibactérienne de l\'habitacle de courtoisie',
            'Rappels et alertes personnalisés par SMS et courriel'
          ]
        };
      default:
        return {
          textColor: 'text-amber-800',
          bgColor: 'bg-amber-50/60',
          borderColor: 'border-amber-100',
          icon: Flame,
          benefits: [
            'Suivi d\'échéance automatisé gratuit',
            '-5% de réduction à l\'achat d\'un extincteur réglementaire au centre',
            'Alerte SMS de rappel d\'inspection'
          ]
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseModal} />

      {/* Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-650" />
              Programme de Fidélité Rebours
            </h3>
            <p className="text-xs text-slate-500 mt-1">Avantages exclusifs et points cumulés par véhicule d'expertise.</p>
          </div>
          <button
            onClick={handleCloseModal}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Query Input */}
        <form onSubmit={handleSearch} className="space-y-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Entrez votre Plaque ou Téléphone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-800 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {errorText && <p className="text-xs text-red-650 font-bold">{errorText}</p>}

          {/* Quick link tags of sample accounts configured in initial db */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Comptes d'essai :</span>
            {loyaltyAccounts.map((item) => (
              <button
                key={item.immatriculation}
                type="button"
                onClick={() => handleSelectSample(item.immatriculation)}
                className="px-2 py-1 text-xs font-mono font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded transition-colors cursor-pointer"
              >
                {item.immatriculation} (★{item.level})
              </button>
            ))}
          </div>
        </form>

        <hr className="border-slate-100 mb-6" />

        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {result ? (
              <div className="space-y-4">
                
                {/* Account card */}
                {(() => {
                  const details = getTierDetails(result.level);
                  const IconComponent = details.icon;
                  return (
                    <div className="space-y-4">
                      {/* Visual Badge representing status */}
                      <div className={`p-4 rounded-2xl border ${details.bgColor} ${details.borderColor} flex items-center justify-between gap-4`}>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-white border border-slate-200/50 shadow-sm">
                            <IconComponent className={`h-6 w-6 stroke-[2.5] ${details.textColor}`} />
                          </div>
                          <div>
                            <span className="text-[10px] tracking-widest font-bold uppercase text-slate-400">Statut Fidélité</span>
                            <h4 className={`text-base font-bold font-display ${details.textColor} tracking-wide`}>
                              Membre {result.level}
                            </h4>
                          </div>
                        </div>

                        {/* Points Indicator */}
                        <div className="text-right">
                          <span className="text-[10px] tracking-widest font-bold uppercase text-slate-400">Points Cumulés</span>
                          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600">
                            {result.points} <span className="text-xs text-slate-500 font-semibold">pts</span>
                          </div>
                        </div>
                      </div>

                      {/* Benefits listed */}
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          Privilèges Applicables Directement
                        </h5>
                        <ul className="space-y-2 text-xs text-slate-600">
                          {details.benefits.map((b, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Simple history logs */}
                      {result.history.length > 0 && (
                        <div className="border-t border-slate-100 pt-4">
                          <span className="text-[10px] uppercase font-bold text-slate-450 block mb-2 tracking-widest">
                            Historique d'activité
                          </span>
                          <div className="max-h-24 overflow-y-auto space-y-1.5 pr-2">
                            {result.history.map((h) => (
                              <div key={h.id} className="flex justify-between items-center text-[11px] bg-slate-50 p-2 rounded border border-slate-150 font-mono text-slate-700">
                                <span>{h.date} - {h.type}</span>
                                <span className="text-emerald-650 text-xs font-bold">+{h.points} pts</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-mono text-xs block mb-2 font-bold tracking-wider uppercase">AUCUN SUIVI DE POINTS</span>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Le véhicule saisi n'a pas encore cumulé de points chez nous. Les points bonus et avantages sont activés dès votre premier passage d'inspection !
                </p>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}
