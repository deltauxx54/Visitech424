/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  CreditCard, 
  ShieldCheck, 
  Save, 
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { ExpirationInfo } from '../../types';

interface ProfileEditFormProps {
  currentClient: { name: string; plate: string; phone: string };
  onUpdateProfile: (updated: { name: string; plate: string; phone: string }) => void;
  registeredClients: { name: string; plate: string; phone: string }[];
  expirations: ExpirationInfo[];
}

export default function ProfileEditForm({
  currentClient,
  onUpdateProfile,
  registeredClients,
  expirations
}: ProfileEditFormProps) {
  
  const [name, setName] = useState(currentClient.name);
  const [plate, setPlate] = useState(currentClient.plate.toUpperCase().trim());
  const [phone, setPhone] = useState(currentClient.phone);
  
  const [notify, setNotify] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!name.trim()) {
      setNotify({ type: 'error', message: 'Le nom du propriétaire ne peut pas être vide.' });
      return;
    }
    
    const plateRegex = /^[A-Z0-9-]{3,15}$/i;
    if (!plateRegex.test(plate.trim())) {
      setNotify({ type: 'error', message: 'L\'immatriculation doit être valide (3 à 15 caractères alphanumériques).' });
      return;
    }

    if (phone.trim().length < 8) {
      setNotify({ type: 'error', message: 'Le numéro de téléphone doit comporter au moins 8 chiffres.' });
      return;
    }

    const cleanPlate = plate.trim().toUpperCase().replace(/\s/g, '');
    const currentPlate = currentClient.plate.trim().toUpperCase().replace(/\s/g, '');

    if (cleanPlate !== currentPlate) {
      // 1. Check if the plate is already registered to another client account
      const isTakenByAnotherClient = registeredClients.some(
        c => c.plate.toUpperCase().replace(/\s/g, '') === cleanPlate && 
             c.name.toLowerCase() !== currentClient.name.toLowerCase()
      );
      
      // 2. Check if the plate belongs to another different owner in the global expirations registry
      const isTakenByAnotherVehicle = expirations.some(
        exp => exp.immatriculation.toUpperCase().replace(/\s/g, '') === cleanPlate &&
               exp.clientName.toLowerCase() !== currentClient.name.toLowerCase()
      );

      if (isTakenByAnotherClient || isTakenByAnotherVehicle) {
        setNotify({ 
          type: 'error', 
          message: `L'immatriculation ${plate.toUpperCase()} est déjà enregistrée par un autre utilisateur ou associée à un autre véhicule.` 
        });
        return;
      }
    }

    onUpdateProfile({
      name: name.trim(),
      plate: plate.trim().toUpperCase(),
      phone: phone.trim()
    });

    setNotify({
      type: 'success',
      message: 'Votre profil a été mis à jour avec succès ! Les données d\'expiration et de fidélité ont été synchronisées.'
    });

    setTimeout(() => {
      setNotify(null);
    }, 5000);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="profile-edit-view">
      
      {/* Title */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="font-display text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <User className="h-6 w-6 text-blue-600" />
          Paramètres du Profil Client
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Mettez à jour vos coordonnées administratives de façon autonome. Tous vos rendez-vous futurs s'adapteront automatiquement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Modern Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-205 shadow-xs p-6 space-y-6">
          <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider">
            Informations Personnelles
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            
            {/* 1. Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Nom Complet du Propriétaire
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-150-outline rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 transition-all focus:outline-hidden"
                  placeholder="Ex : Christian Benjamin"
                  required
                />
              </div>
            </div>

            {/* 2. Plate */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Numéro d'Immatriculation de Référence
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <CreditCard className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:focus:ring-2 focus:ring-blue-150 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono font-bold text-slate-800 transition-all uppercase focus:outline-hidden"
                  placeholder="Ex : AA-123-BB"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Saisissez la plaque exacte liée à votre certificat de contrôle technique pour assurer l'adressage automatique.
              </p>
            </div>

            {/* 3. Phone */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Téléphone de Notification Standard (SMS)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:focus:ring-2 focus:ring-blue-150 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 transition-all focus:outline-hidden"
                  placeholder="Ex : +33 6 12 34 56 78"
                  required
                />
              </div>
            </div>

            {/* Status alerts notifications render */}
            {notify && (
              <div className={`p-4 rounded-xl border text-xs font-medium ${
                notify.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                  : 'bg-red-50 border-red-100 text-red-800'
              }`}>
                {notify.message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-500/10 active:scale-98"
            >
              <Save className="h-4 w-4" />
              Sauvegarder le Profil
            </button>

          </form>
        </div>

        {/* Right Side: Virtual Certificate Card Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-tr from-slate-900 via-slate-850 to-slate-950 border border-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
            
            {/* Visual hologram badge */}
            <div className="absolute -top-3 -right-3 w-20 h-20 bg-blue-500/10 rounded-full blur-xl" />
            <div className="absolute bottom-4 right-4 text-white/5 font-mono text-7xl font-extrabold select-none pointer-events-none">
              TECH
            </div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 font-mono">
                  CARTE GRISE DÉMATÉRIALISÉE
                </span>
                <h4 className="font-display font-extrabold text-white text-base mt-0.5">
                  VISITE-TECH ID
                </h4>
              </div>
              <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center text-blue-400 border border-white/10">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-4">
              
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">
                  PROPRIÉTAIRE CERTIFIÉ
                </span>
                <span className="text-xs font-bold text-slate-200 block truncate">
                  {name || 'Non spécifié'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">
                    IMMATRICULATION
                  </span>
                  <span className="text-xs font-mono font-black text-white block bg-white/10 px-2 py-0.5 rounded border border-white/5 uppercase select-all tracking-wider text-center">
                    {plate || '---'}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">
                    CONTACT SÉCURISÉ
                  </span>
                  <span className="text-xs font-bold text-slate-200 block truncate">
                    {phone || '---'}
                  </span>
                </div>
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400 font-mono">
              <span>STATUT DU COMPTE : ACTIF</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Dernière synchro live
              </span>
            </div>

          </div>

          {/* Secure details card */}
          <div className="bg-blue-50/50 border border-blue-150 p-4 rounded-xl flex gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-800 leading-normal font-medium">
              Afin de conserver la validité de vos certificats en situation d'audit règlementaire routière, toute modification d'immatriculation met également à jour la file d'attente métrologique du centre d'essai.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
