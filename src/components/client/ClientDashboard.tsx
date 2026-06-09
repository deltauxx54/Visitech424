import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Award, 
  Calendar, 
  ArrowRight, 
  Car, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  AlertCircle,
  X,
  Send,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ExpirationInfo, LoyaltyAccount, RendezVous } from '../../types';

interface ClientDashboardProps {
  currentClient: { name: string; plate: string; phone: string; };
  expirations: ExpirationInfo[];
  loyaltyAccounts: LoyaltyAccount[];
  appointments: RendezVous[];
  onTabChange: (tab: string) => void;
  onRequestReschedule: (apptId: string, requestedDate: string, requestedTimeSlot: string, reason: string) => void;
}

const TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00'
];

export default function ClientDashboard({
  currentClient,
  expirations,
  loyaltyAccounts,
  appointments,
  onTabChange,
  onRequestReschedule
}: ClientDashboardProps) {
  
  // Reschedule state
  const [reschedulingAppt, setReschedulingAppt] = useState<RendezVous | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00 - 11:00');
  const [reason, setReason] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Find expirations for current client
  const clientExpirations = expirations.filter(
    exp => exp.immatriculation === currentClient.plate || exp.clientName === currentClient.name
  );

  // Find loyalty account for current client
  const clientLoyalty = loyaltyAccounts.find(
    acc => acc.immatriculation === currentClient.plate || acc.clientName === currentClient.name
  );

  // Find upcoming appointments for current client
  const clientAppointments = appointments.filter(
    appt => (appt.immatriculation === currentClient.plate || appt.clientName === currentClient.name) && 
            ['En attente', 'Confirmé', 'Relancé', 'Retour effectué'].includes(appt.status)
  ).slice(0, 3);

  // Expiration within 30 days
  const criticalExpirations = clientExpirations.filter(exp => exp.daysLeft <= 30);
  const isExpired = clientExpirations.some(exp => exp.daysLeft <= 0);

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingAppt) return;
    
    onRequestReschedule(reschedulingAppt.id, newDate, newTime, reason);
    setReschedulingAppt(null);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  return (
    <div className="space-y-6" id="client-dashboard">
      
      {/* Banner de bienvenue */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 font-mono uppercase tracking-wide">
            Espace Client Sécurisé
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
            Ravi de vous revoir, {currentClient.name} !
          </h2>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
            Consultez instantanément les alertes administratives de vos véhicules et suivez en direct votre solde de récompenses Rebours.
          </p>
        </div>
        <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
          <Car className="h-40 w-40 text-blue-600" />
        </div>
      </div>

      {/* Grid d'indicateurs de haut niveau */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Résumé des Alertes d'Expiration à 30 jours */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Alertes Légales (30J)
              </h3>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                criticalExpirations.length > 0 
                  ? 'bg-red-50 text-red-700 border border-red-100' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}>
                {criticalExpirations.length} Alerte{criticalExpirations.length > 1 ? 's' : ''}
              </span>
            </div>

            {criticalExpirations.length > 0 ? (
              <div className="space-y-3 my-3">
                {criticalExpirations.map((exp) => (
                  <div 
                    key={exp.immatriculation} 
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      exp.daysLeft <= 10 
                        ? 'bg-red-50/60 border-red-100 text-red-900' 
                        : 'bg-amber-50/60 border-amber-100 text-amber-900'
                    }`}
                  >
                    <ShieldAlert className={`h-5 w-5 shrink-0 mt-0.5 ${exp.daysLeft <= 10 ? 'text-red-600' : 'text-amber-600'}`} />
                    <div className="text-xs">
                      <p className="font-bold font-mono">Plaque : {exp.immatriculation}</p>
                      <p className="mt-1 font-medium text-slate-650">
                        Prochain contrôle obligatoire le <strong className="font-bold">{exp.nextInspectionDate}</strong> ({exp.daysLeft < 0 ? 'Expiré depuis ' + Math.abs(exp.daysLeft) + 'j' : 'expire dans ' + exp.daysLeft + ' jours'}).
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <ShieldCheck className="h-5.5 w-5.5" />
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Félicitations ! Tous vos véhicules sont conformes administrativement pour les 30 prochains jours.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => onTabChange('calendar')}
            className="mt-4 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all w-full cursor-pointer"
          >
            Réserver une inspection préventive
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Résumé Solde de Points de Fidélité */}
        <div className="rounded-2xl border border-slate-101 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-500 animate-pulse" />
                Votre Statut Fidélité Rebours
              </h3>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                (clientLoyalty?.inspectionsCount || 0) >= 5 
                  ? 'bg-purple-50 text-purple-700 border-purple-200' 
                  : (clientLoyalty?.inspectionsCount || 0) >= 4
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : (clientLoyalty?.inspectionsCount || 0) >= 3
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : (clientLoyalty?.inspectionsCount || 0) >= 1
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                {(clientLoyalty?.inspectionsCount || 0) >= 5 ? 'Excellence Platine' :
                 (clientLoyalty?.inspectionsCount || 0) >= 4 ? 'Membre Or' :
                 (clientLoyalty?.inspectionsCount || 0) >= 3 ? 'Membre Argent' :
                 (clientLoyalty?.inspectionsCount || 0) >= 1 ? 'Membre Bronze' : 'Nouveau Visiteur'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-xl flex items-center justify-between my-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Visites &amp; Passages Certifiés</span>
                <div className="text-3xl font-extrabold text-emerald-600 font-mono mt-0.5">
                  {clientLoyalty?.inspectionsCount || 0} <span className="text-xs text-slate-500 font-semibold font-sans">visite{ (clientLoyalty?.inspectionsCount || 0) > 1 ? 's' : '' }</span>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Échelon Atteint</span>
                <span className="text-sm font-extrabold text-slate-705 font-mono mt-0.5 block">
                  {clientLoyalty?.inspectionsCount || 0} / 5
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Vos privilèges grimpent directement selon le nombre d'inspections de sécurité effectuées. Les membres Or et Platine VIP profitent du couloir prioritaire Zéro Attente.
            </p>
          </div>

          <button
            onClick={() => onTabChange('fidelity')}
            className="mt-4 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all w-full cursor-pointer"
          >
            Voir la jauge à pression &amp; mes avantages
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* Rendez-vous et passages planifiés */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
        <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 mb-4">
          <Clock className="h-4.5 w-4.5 text-blue-600" />
          Prochains Passages et Réservations de Créneaux
        </h3>

        {clientAppointments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {clientAppointments.map((appt) => (
              <div key={appt.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100/50 flex items-center justify-center shrink-0">
                    <Calendar className="h-4.5 w-4.5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold text-slate-800 font-mono">{appt.immatriculation}</span>
                      <span className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded font-mono font-bold text-slate-600">Catégorie {appt.vehicleType}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-mono">Prévu le : <strong className="text-slate-700 font-sans">{appt.date}</strong> à {appt.timeSlot}</p>
                    
                    {/* Active Modification Request Indicator Box */}
                    {appt.modificationRequest && (
                      <div className="mt-2 p-3 rounded-xl border bg-slate-50 border-slate-150 space-y-1 text-left max-w-md shadow-3xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Demande de report :</span>
                          <span className={`px-2 py-0.2 rounded font-mono text-[9px] font-bold border uppercase leading-none ${
                            appt.modificationRequest.status === 'en_attente' ? 'bg-amber-50 text-amber-800 border-amber-205 animate-pulse' :
                            appt.modificationRequest.status === 'accepté' ? 'bg-emerald-50 text-emerald-800 border-emerald-205' :
                            'bg-red-50 text-red-800 border-red-205'
                          }`}>
                            {appt.modificationRequest.status === 'en_attente' ? '🕒 En attente de validation' :
                             appt.modificationRequest.status === 'accepté' ? '✓ Accepté' : '✕ Refusé'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Souhaité le <strong className="font-bold">{appt.modificationRequest.requestedDate}</strong> ({appt.modificationRequest.requestedTimeSlot})
                        </p>
                        {appt.modificationRequest.reason && (
                          <p className="text-[10px] text-slate-400 italic">
                            Motif : "{appt.modificationRequest.reason}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider uppercase border ${
                    appt.status === 'Confirmé' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    appt.status === 'Relancé' ? 'bg-purple-100/80 text-purple-800 border-purple-200/50 font-bold' :
                    appt.status === 'Retour effectué' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    'bg-yellow-50 text-yellow-800 border-yellow-250'
                  }`}>
                    {appt.status}
                  </span>
                  
                  {/* Reschedule button trigger - only visible if visit is not done, and request is not pending */}
                  {appt.status !== 'Retour effectué' && (!appt.modificationRequest || appt.modificationRequest.status === 'refusé') && (
                    <button
                      type="button"
                      onClick={() => {
                        setReschedulingAppt(appt);
                        setNewDate(appt.date);
                        setNewTime(appt.timeSlot);
                        setReason('');
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-700 rounded-xl transition-all cursor-pointer shadow-3xs active:scale-95"
                    >
                      Reporter la visite
                    </button>
                  )}

                  <span className="text-slate-400 text-xs font-mono">{appt.id}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 space-y-3">
            <p className="text-xs">Aucune réservation active enregistrée pour vos véhicules actuels.</p>
            <button
              onClick={() => onTabChange('calendar')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded-xl cursor-pointer shadow-sm transition-all shadow-blue-500/10"
            >
              Planifier un premier passage
            </button>
          </div>
        )}
      </div>

      {/* Success Notification Hub Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-white flex items-center gap-3 animate-slide-up">
          <CalendarDays className="h-5.5 w-5.5 text-blue-400" />
          <div className="text-xs">
            <p className="font-bold">Demande de report transmise</p>
            <p className="text-slate-400">Le centre technique de contrôle a été notifié pour validation.</p>
          </div>
        </div>
      )}

      {/* MODAL FOR SCHEDULING MODIFICATION COMPONENT */}
      <AnimatePresence>
        {reschedulingAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" id="reschedule-request-modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl border border-slate-150 p-6 shadow-2xl relative space-y-4"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display font-black text-slate-850 text-sm uppercase tracking-wider flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  Demander le report de visite
                </h3>
                <button
                  type="button"
                  onClick={() => setReschedulingAppt(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Specific info summary */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-705">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Véhicule concerné :</span>
                <p className="font-mono text-slate-850 font-bold mt-0.5">{reschedulingAppt.immatriculation} (Cat. {reschedulingAppt.vehicleType})</p>
                <p className="text-[10px] text-slate-450 mt-1">Actuellement planifié le {reschedulingAppt.date} à {reschedulingAppt.timeSlot}</p>
              </div>

              {/* Form */}
              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Proposer une nouvelle date *
                  </label>
                  <input
                    type="date"
                    required
                    min="2026-06-01"
                    max="2026-06-30"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Choisissez un jour ouvrable du mois courant (Juin 2026).</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Proposer un nouveau créneau horaire *
                  </label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    {TIME_SLOTS.map(ts => (
                      <option key={ts} value={ts}>{ts.split(' ')[0]} (Disponible)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Raison ou contrainte de report (Optionnel)
                  </label>
                  <textarea
                    placeholder="Ex: Réparation d'un feu défectueux en cours, empêchement professionnel..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReschedulingAppt(null)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-650 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Soumettre
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
