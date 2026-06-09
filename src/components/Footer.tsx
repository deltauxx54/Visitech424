/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

interface FooterProps {
  currentSection: 'home' | 'admin' | 'client';
  onChangeSection: (section: 'home' | 'admin' | 'client') => void;
}

export default function Footer({ currentSection, onChangeSection }: FooterProps) {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-500 text-sm" id="app-footer">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <span className="font-display text-base font-bold text-slate-850 tracking-tight">
                VISITE<span className="text-blue-600">TECH</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Solution technologique moderne de gestion et d'automatisation des contrôles techniques pour centres automobiles agréés.
            </p>
            <span className="font-mono text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded font-semibold">
              Gouvernance de Niveau 1
            </span>
          </div>

          {/* Column 2: Raccourcis */}
          <div>
            <h3 className="font-display font-bold text-slate-800 mb-4 text-xs uppercase tracking-wider">Services Directs</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onChangeSection('home')} 
                  className="hover:text-blue-600 transition-colors cursor-pointer text-slate-500"
                >
                  Prise de Rendez-vous Rapide
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onChangeSection('home')} 
                  className="hover:text-blue-600 transition-colors cursor-pointer text-slate-500"
                >
                  Suivi des Validités Légales
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onChangeSection('home')} 
                  className="hover:text-blue-600 transition-colors cursor-pointer text-slate-500"
                >
                  Fidélisation & Flottes Multi-Véhicules
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact physique */}
          <div>
            <h3 className="font-display font-bold text-slate-800 mb-4 text-xs uppercase tracking-wider">Centre de Contrôle</h3>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>Zone Industrielle de Douala, Cameroun</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>+237 233 44 55 66</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>contact@visitetech-centre.cm</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Governance Policy */}
          <div>
            <h3 className="font-display font-bold text-slate-800 mb-4 text-xs uppercase tracking-wider">Gouvernance & Sécurité</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Conformité totale avec les régulations de sécurité OWASP Top 10. Audit complet d'authentification et logs d'activité inaltérables.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-semibold">
                OWASP Secure
              </span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-semibold">
                ISO 9001
              </span>
            </div>
          </div>
        </div>

        {/* Warning label regarding No payments */}
        <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <p>© {new Date().getFullYear()} VisiteTech Inc. Tous droits réservés.</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
              ⚠️ <strong>Note administrative :</strong> Aucun paiement en ligne, abonnement ou frais transactionnel n'est géré sur cette plateforme. Toutes les évaluations s'effectuent physiquement au centre.
            </p>
          </div>

          {/* Core admin quick entrance - Only shown when inside admin portal */}
          {currentSection === 'admin' && (
            <div>
              <button
                onClick={() => onChangeSection('home')}
                className="inline-flex items-center gap-1.5 text-slate-750 hover:text-blue-600 bg-white border border-slate-200 px-3.5 py-1.5 rounded-lg transition-colors text-xs font-semibold cursor-pointer shadow-sm hover:border-slate-300"
              >
                <span>Retourner à l'Accueil</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
