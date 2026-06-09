/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Calendar, Car, Phone, User, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { RendezVous } from '../types';
import { validateImmatriculation, validatePhone } from '../mockData';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAppointment: (newAppt: RendezVous) => void;
  loggedClient: { name: string; plate: string; phone: string } | null;
}

export default function BookingModal({ isOpen, onClose, onAddAppointment, loggedClient }: BookingModalProps) {
  const [step, setStep] = useState(1);
  
  // Fields state
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [vehicleType, setVehicleType] = useState<'A' | 'B' | 'B1' | 'C' | 'D'>('B');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 - 10:00');
  const [notes, setNotes] = useState('');

  // Auto pre-fill if loggedClient is present on open
  useEffect(() => {
    if (isOpen) {
      if (loggedClient) {
        setClientName(loggedClient.name);
        setPhone(loggedClient.phone);
        setImmatriculation(loggedClient.plate.toUpperCase());
      } else {
        setClientName('');
        setPhone('');
        setImmatriculation('');
      }
    }
  }, [isOpen, loggedClient]);

  // Validation state
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);
  const [plateValid, setPlateValid] = useState<boolean | null>(null);
  const [formError, setFormError] = useState('');
  const [successInfo, setSuccessInfo] = useState<RendezVous | null>(null);

  // Validate fields in real-time
  useEffect(() => {
    if (phone) {
      setPhoneValid(validatePhone(phone));
    } else {
      setPhoneValid(null);
    }
  }, [phone]);

  useEffect(() => {
    if (immatriculation) {
      setImmatriculation(immatriculation.toUpperCase());
      setPlateValid(validateImmatriculation(immatriculation));
    } else {
      setPlateValid(null);
    }
  }, [immatriculation]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!clientName.trim()) {
        setFormError('Veuillez renseigner votre nom complet.');
        return;
      }
      if (!phoneValid) {
        setFormError('Numéro de téléphone invalide (Veuillez utiliser un format valide, ex: 699887766).');
        return;
      }
      if (!plateValid) {
        setFormError('Format d\'immatriculation invalide (ex: LT-482-AA ou AB-123-CD).');
        return;
      }
      setFormError('');
      setStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setFormError('Saisissez une date de contrôle valide.');
      return;
    }
    
    // Determine points earned based on vehicle type (more complex vehicles yield slightly higher rewards)
    let pts = 15;
    if (vehicleType === 'D') pts = 30; // Poids lourds
    if (vehicleType === 'C') pts = 25; // Transports publics
    if (vehicleType === 'B1') pts = 20;

    const newBooking: RendezVous = {
      id: `RDV-${Math.floor(100 + Math.random() * 900)}`,
      clientName: clientName.trim(),
      phone: phone.trim(),
      immatriculation: immatriculation.trim().toUpperCase(),
      vehicleType,
      date,
      timeSlot,
      status: 'En attente',
      notes: notes.trim() || undefined,
      pointsEarned: pts,
      createdAt: new Date().toISOString()
    };

    onAddAppointment(newBooking);
    setSuccessInfo(newBooking);
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setClientName('');
    setPhone('');
    setImmatriculation('');
    setVehicleType('B');
    setDate('');
    setTimeSlot('09:00 - 10:00');
    setNotes('');
    setPhoneValid(null);
    setPlateValid(null);
    setFormError('');
    setSuccessInfo(null);
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  const vehicleCategories = [
    { type: 'A', label: 'Catégorie A (Moto / Scooter)' },
    { type: 'B', label: 'Catégorie B (Véhicule Léger / Particulier)' },
    { type: 'B1', label: 'Catégorie B1 (Taxi / Auxiliaire)' },
    { type: 'C', label: 'Catégorie C (Transport Public / Autobus)' },
    { type: 'D', label: 'Catégorie D (Poids Lourds / Flottes Spéciales)' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleModalClose} />

      {/* Card Content container */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Réserver une Inspection Technique
            </h3>
            <p className="text-xs text-slate-500 mt-1">Évaluation et audit physique du véhicule au centre d'expertise.</p>
          </div>
          <button
            onClick={handleModalClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Error Banner */}
        {formError && (
          <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <span>{formError}</span>
          </div>
        )}

        {/* Steps Progress bar */}
        {step < 3 && (
          <div className="flex items-center gap-2 mb-6" id="booking-steps-bar">
            <div className={`flex-1 h-1.5 rounded-lg transition-all duration-300 ${step >= 1 ? 'bg-blue-600' : 'bg-slate-100'}`} />
            <div className={`flex-1 h-1.5 rounded-lg transition-all duration-300 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-100'}`} />
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {/* Client Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" /> Nom Complet du Client
                </label>
                <input
                  type="text"
                  required
                  placeholder="EX: Jean-Pierre Eto'o"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400 transition-all font-medium"
                />
              </div>

              {/* Grid Client Info: Phone & Plate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone number */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> Téléphone Mobile
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="EX: 699887766"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full bg-slate-50 border rounded-xl pl-4 pr-10 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400 transition-all font-mono font-medium ${
                        phoneValid === true ? 'border-emerald-500 ring-1 ring-emerald-500/20' : phoneValid === false ? 'border-red-400' : 'border-slate-200'
                      }`}
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {phoneValid === true && <Check className="h-4 w-4 text-emerald-600" />}
                      {phoneValid === false && <span className="text-[10px] text-red-600 font-bold">!</span>}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-450 mt-1 block">Validation automatique en format national.</span>
                </div>

                {/* Immatriculation */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5 text-slate-400" /> Immatriculation
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="EX: LT-482-AA"
                      value={immatriculation}
                      onChange={(e) => setImmatriculation(e.target.value)}
                      className={`w-full bg-slate-50 border rounded-xl pl-4 pr-10 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400 transition-all font-mono font-medium ${
                        plateValid === true ? 'border-emerald-500 ring-1 ring-emerald-500/20' : plateValid === false ? 'border-red-400' : 'border-slate-200'
                      }`}
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {plateValid === true && <Check className="h-4 w-4 text-emerald-600" />}
                      {plateValid === false && <span className="text-[10px] text-red-600 font-bold">!</span>}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-450 mt-1 block">Format moderne (ex: LT-482-AA).</span>
                </div>
              </div>

              {/* Vehicle category selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Catégorie du Véhicule (Règles spécifiques)
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                >
                  {vehicleCategories.map((c) => (
                    <option key={c.type} value={c.type}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <div className="mt-2 bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 leading-normal">
                    {vehicleType === 'D' && '⚠️ Les Poids Lourds (Cat. D) exigent des installations de freinage spécifiques et un créneau de sécurité de 1h30 (Donne droit à +30 Points fidélité).'}
                    {vehicleType === 'B' && '✓ Voiture de tourisme standard ou SUV léger. Contrôle classique en 30 minutes (Donne droit à +15 Points fidélité).'}
                    {vehicleType === 'B1' && '✓ Véhicules de transport collectif urbain minoritaires ou Taxis. Visite semestrielle d\'éligibilité (Donne droit à +20 Points fidélité).'}
                    {vehicleType === 'C' && '✓ Transports Publics, autobus interurbains. Contrôle renforcé (Donne droit à +25 Points fidélité).'}
                    {vehicleType === 'A' && '✓ Motocyclette et cyclomoteurs. Banc de contrôle spécifique (Donne droit à +10 Points fidélité).'}
                  </p>
                </div>
              </div>

              {/* Navigation button */}
              <div className="flex justify-end pt-4 mt-2">
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!clientName || !phoneValid || !plateValid}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 font-semibold text-white text-sm flex items-center gap-2 cursor-pointer transition-all duration-200 shadow-md shadow-blue-500/10"
                >
                  Continuer
                  <span>→</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <form key="step2" onSubmit={handleSubmit} className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Date du Passage
                </label>
                <input
                  type="date"
                  required
                  min="2026-06-08" // Ne pas réserver dans le passé local
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-mono font-medium"
                />
              </div>

              {/* Time slot selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Créneau Horaire Disponible
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['08:00 - 09:00', '09:00 - 10:00', '10:30 - 11:30', '13:00 - 14:00', '14:30 - 15:30', '16:00 - 17:00'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold font-mono text-center transition-all ${
                        timeSlot === slot
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-850'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Remarques Particulières (Optionnel)
                </label>
                <textarea
                  placeholder="EX: Problème d'équilibrage constaté, urgence administrative..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  ← Précédent
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold text-white text-sm shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  Confirmer ma Réservation (0 FCFA)
                </button>
              </div>
            </form>
          )}

          {step === 3 && successInfo && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-5"
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h4 className="font-display text-xl font-bold text-slate-900">Réservation Enregistrée !</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
                  Votre demande pour le véhicule <strong className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{successInfo.immatriculation}</strong> a bien été enregistrée et transmise aux techniciens d'accueil.
                </p>
              </div>

              {/* Booking Summary Recipient */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left max-w-sm mx-auto space-y-2 text-xs text-slate-650">
                <div className="flex justify-between">
                  <span className="text-slate-500">ID Réservation :</span>
                  <span className="font-mono font-bold text-slate-850">{successInfo.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nom du Client :</span>
                  <strong className="text-slate-800">{successInfo.clientName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date et Heure :</span>
                  <span className="font-mono text-slate-800 font-bold">{successInfo.date} à {successInfo.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Points Cumulés :</span>
                  <span className="text-emerald-600 font-bold font-mono">+{successInfo.pointsEarned} Points</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Statut initial :</span>
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-bold font-mono">EN ATTENTE</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] text-slate-500">Un SMS automatique de notification a été simulé.</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleModalClose}
                  className="px-6 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-semibold"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
