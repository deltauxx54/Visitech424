/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Search, BellRing, Navigation, ShieldCheck, ShieldAlert, CalendarClock, Mail, MessageSquare } from 'lucide-react';
import { ExpirationInfo } from '../types';
import { validateImmatriculation } from '../mockData';

interface ExpiryTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  expirations: ExpirationInfo[];
  onToggleAlert: (plate: string, type: 'SMS' | 'Email') => void;
}

export default function ExpiryTracker({ isOpen, onClose, expirations, onToggleAlert }: ExpiryTrackerProps) {
  const [searchPlate, setSearchPlate] = useState('');
  const [result, setResult] = useState<ExpirationInfo | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Auto-validate search input style
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPlate.trim()) {
      setErrorText('Saisissez une plaque d\'immatriculation.');
      return;
    }

    const clean = searchPlate.trim().toUpperCase();
    const found = expirations.find(item => item.immatriculation === clean);
    
    setResult(found || null);
    setSearched(true);
    setErrorText('');
  };

  const handleSelectSample = (plate: string) => {
    setSearchPlate(plate);
    const found = expirations.find(item => item.immatriculation === plate);
    setResult(found || null);
    setSearched(true);
    setErrorText('');
  };

  const handleCloseModal = () => {
    setSearchPlate('');
    setResult(null);
    setSearched(false);
    setErrorText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseModal} />

      {/* Main Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-blue-600" />
              Calculateur d'Échéance Légale
            </h3>
            <p className="text-xs text-slate-500 mt-1">Conformité administrative et alertes d'expiration de visite.</p>
          </div>
          <button
            onClick={handleCloseModal}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info panel */}
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          En Afrique centrale et dans le cadre du règlement de la sécurité routière, les véhicules doivent passer un contrôle technique périodique obligatoire pour certifier leur bon état de marche.
        </p>

        {/* Search form */}
        <form onSubmit={handleSearch} className="space-y-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Saisissez l'immatriculation (Ex: LT-482-AA)"
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-800 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-650 font-semibold"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {errorText && <p className="text-xs text-red-600 font-medium">{errorText}</p>}

          {/* Quick links samples */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Exemples rapides :</span>
            {expirations.slice(0, 3).map((item) => (
              <button
                key={item.immatriculation}
                type="button"
                onClick={() => handleSelectSample(item.immatriculation)}
                className="px-2 py-1 text-xs font-mono font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded transition-colors cursor-pointer"
              >
                {item.immatriculation}
              </button>
            ))}
          </div>
        </form>

        {/* Result Block */}
        <hr className="border-slate-100 mb-6" />

        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {result ? (
              <div className="space-y-4">
                {/* Result Status Banner */}
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  result.daysLeft <= 10 
                    ? 'bg-red-50 border-red-100 text-red-900' 
                    : result.daysLeft <= 30 
                    ? 'bg-amber-50 border-amber-200 text-amber-900' 
                    : 'bg-emerald-50 border-emerald-100 text-emerald-990'
                }`}>
                  {result.daysLeft <= 10 ? (
                    <ShieldAlert className="h-5.5 w-5.5 shrink-0 mt-0.5 text-red-600" />
                  ) : (
                    <ShieldCheck className="h-5.5 w-5.5 shrink-0 mt-0.5 text-emerald-600" />
                  )}
                  
                  <div>
                    <h4 className="text-sm font-bold font-display text-slate-905">
                      {result.daysLeft === 0 
                        ? 'Inspection Expirée aujourd\'hui !' 
                        : result.daysLeft < 0 
                        ? 'CONTRÔLE TECHNIQUE EXPIRÉ !' 
                        : `Expire dans ${result.daysLeft} jours`}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-normal">
                      Plaque {result.immatriculation} &bull; Client : {result.clientName}
                    </p>
                  </div>
                </div>

                {/* Expiration Timeline cards */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-mono text-xs text-slate-600">
                  <div>
                    <span className="text-slate-450 block text-[10px] uppercase">Dernier passage:</span>
                    <strong className="text-slate-900 font-bold">{result.lastInspectionDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-450 block text-[10px] uppercase">Prochain passage:</span>
                    <strong className="text-red-600 font-bold">{result.nextInspectionDate}</strong>
                  </div>
                </div>

                {/* Simulated notifications activation */}
                <div className="bg-slate-50 border border-slate-205 p-4 rounded-xl space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <BellRing className="h-4.5 w-4.5 text-blue-600" />
                    <span>Rappels de conformité auto (Zéro pénalité)</span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {/* SMS */}
                    <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MessageSquare className="h-4 w-4 text-slate-400" />
                        <span>Alerte SMS (+237 {result.phone})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleAlert(result.immatriculation, 'SMS')}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          result.alertSMS ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          result.alertSMS ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between text-xs py-1.5">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>Courriel d'alerte</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleAlert(result.immatriculation, 'Email')}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          result.alertEmail ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          result.alertEmail ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-mono text-sm block mb-2 font-bold tracking-wider uppercase">AUCUN SUIVI EXISTANT</span>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                  Cette immatriculation n'est pas encore enregistrée dans notre système de suivi de visite.
                </p>
                <button
                  onClick={() => {
                    handleCloseModal();
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-750 text-xs font-bold text-white transition-colors"
                >
                  Prendre rendez-vous d'évaluation
                </button>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}
