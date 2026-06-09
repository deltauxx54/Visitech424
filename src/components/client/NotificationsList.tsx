/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Bell, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Info,
  Calendar,
  Lock,
  UserCheck,
  Terminal,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { AuditLog, RendezVous, ExpirationInfo } from '../../types';

interface NotificationsListProps {
  currentClient: { name: string; plate: string; phone: string };
  auditLogs: AuditLog[];
  appointments: RendezVous[];
  expirations: ExpirationInfo[];
}

export default function NotificationsList({
  currentClient,
  auditLogs = [],
  appointments = [],
  expirations = []
}: NotificationsListProps) {
  
  const clientName = currentClient.name;
  const clientPlate = currentClient.plate.toUpperCase().trim();
  const clientPhone = currentClient.phone.trim();

  // 1. Filter Audit Logs relative to this client
  const relativeLogs = auditLogs.filter(log => {
    const details = (log.details || '').toLowerCase();
    const action = (log.action || '').toLowerCase();
    
    const matchesPlate = clientPlate ? details.includes(clientPlate.toLowerCase()) || action.includes(clientPlate.toLowerCase()) : false;
    const matchesName = clientName ? details.includes(clientName.toLowerCase()) : false;
    const matchesPhone = clientPhone ? details.includes(clientPhone) : false;

    return matchesPlate || matchesName || matchesPhone;
  });

  // 2. Map current appointments as active notifications (e.g. status changed, booked)
  const clientAppts = appointments.filter(appt => {
    return appt.immatriculation.toUpperCase().trim() === clientPlate || appt.clientName.toLowerCase() === clientName.toLowerCase();
  });

  // 3. Build a combined premium notification feed
  const combinedNotifications: {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    sender: 'Centre Technique' | 'Système' | 'Agent d\'Accueil';
    status: 'success' | 'warning' | 'info';
    icon: any;
  }[] = [];

  // Add customized welcome notification
  combinedNotifications.push({
    id: 'NOTIF-WELCOME',
    title: 'Activation de véhicule réussie',
    message: `Votre garage est synchronisé avec le réseau de la station. Le suivi intelligent de la plaque d'immatriculation ${clientPlate} est opérationnel.`,
    timestamp: new Date().toISOString(),
    sender: 'Système',
    status: 'success',
    icon: ShieldCheck
  });

  // Convert the relative audit logs into premium notifications
  relativeLogs.forEach(log => {
    let icon = Info;
    if (log.status === 'success') icon = CheckCircle2;
    if (log.status === 'warning') icon = AlertTriangle;
    if (log.action.toLowerCase().includes('sandbox') || log.action.toLowerCase().includes('configuration')) {
      icon = Terminal;
    }

    combinedNotifications.push({
      id: log.id,
      title: log.action,
      message: log.details,
      timestamp: log.timestamp,
      sender: log.userRole === 'Administrateur' ? 'Centre Technique' : log.userRole === 'Agent' ? 'Agent d\'Accueil' : 'Système',
      status: log.status,
      icon
    });
  });

  // Convert client appointments into notifications as well
  clientAppts.forEach(appt => {
    let message = '';
    let status: 'success' | 'warning' | 'info' = 'info';
    let title = '';

    if (appt.status === 'Confirmé') {
      title = 'Rendez-vous Validé & Bloqué';
      message = `Le centre de contrôle technique a confirmé votre créneau du ${appt.date} de ${appt.timeSlot} pour le véhicule ${clientPlate}. Votre ticket prioritaire est émis.`;
      status = 'success';
    } else if (appt.status === 'Relancé') {
      title = 'Alerte réglementaire urgente';
      message = `Une relance de contrôle a été émise pour votre immatriculation ${clientPlate}. Veuillez valider ou confirmer votre horaire.`;
      status = 'warning';
    } else if (appt.status === 'Non joignable') {
      title = 'Tentative de contact Centre';
      message = `Les techniciens de VisiteTech ont tenté de vous contacter concernant votre dossier technique ${clientPlate}.`;
      status = 'warning';
    } else if (appt.status === 'Retour effectué') {
      title = 'Visite Technique Validée';
      message = `Félicitations, le contrôle de votre véhicule ${clientPlate} a été validé avec succès sur notre banc d'essai métrologique.`;
      status = 'success';
    } else {
      title = 'Demande de réservation en attente';
      message = `Votre créneau pour le ${appt.date} de ${appt.timeSlot} est enregistré. En attente de contrôle de validité par les agents.`;
      status = 'info';
    }

    combinedNotifications.push({
      id: `NOTIF-APPT-${appt.id}`,
      title,
      message,
      timestamp: appt.createdAt || new Date().toISOString(),
      sender: 'Centre Technique',
      status,
      icon: Calendar
    });
  });

  // Sort custom notifications feed by timestamp descending
  const sortedFeed = combinedNotifications.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="space-y-6 animate-fade-in" id="client-notifications-view">
      
      {/* Header section with live indicator badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-display text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="h-5.5 w-5.5 text-blue-600 animate-swing" />
            Centre de Notifications &amp; Actes Réglementaires
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualisez en temps réel l'ensemble des interventions, validations, et saisies de conformité sur votre compte.
          </p>
        </div>
        <span className="text-[10px] bg-blue-50 border border-blue-150 text-blue-800 font-mono px-3 py-1 rounded-full uppercase tracking-wider font-bold">
          {sortedFeed.length} Message{sortedFeed.length > 1 ? 's' : ''} enregistré{sortedFeed.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Area - Dynamic Feed list */}
        <div className="lg:col-span-8 space-y-4">
          {sortedFeed.length > 0 ? (
            <div className="space-y-4.5">
              {sortedFeed.map((notif, index) => {
                const Icon = notif.icon;

                return (
                  <motion.div
                    key={notif.id + '-' + index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-5 rounded-2xl border bg-white shadow-xs hover:shadow-md transition-all flex gap-4 ${
                      notif.status === 'success' ? 'border-l-4 border-l-emerald-500 border-slate-150' :
                      notif.status === 'warning' ? 'border-l-4 border-l-amber-500 border-slate-150' :
                      'border-l-4 border-l-blue-500 border-slate-150'
                    }`}
                  >
                    {/* Visual status round icon wrapper */}
                    <div className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center border font-bold ${
                      notif.status === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                      notif.status === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                      'bg-blue-50 border-blue-100 text-blue-700'
                    }`}>
                      <Icon className="h-5.5 w-5.5" />
                    </div>

                    <div className="flex-grow space-y-1.5 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="font-display font-bold text-slate-850 text-sm truncate">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] font-mono font-medium text-slate-400 shrink-0">
                          {new Date(notif.timestamp).toLocaleString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-650 leading-relaxed break-words font-medium">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Émetteur :</span>
                        <span className={`text-[9px] font-mono font-black border px-2 py-0.2 rounded-full tracking-tight ${
                          notif.sender === 'Centre Technique' ? 'bg-slate-900 text-white border-slate-950' :
                          notif.sender === 'Système' ? 'bg-indigo-50 text-indigo-700 border-indigo-105' :
                          'bg-blue-50 text-blue-700 border-blue-105'
                        }`}>
                          {notif.sender}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 mb-3">
                <Bell className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">Aucune notification pour l'instant</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto leading-normal">
                Dès que le centre technique validera un créneau de rendez-vous ou saisira des informations de contrôle, les alertes apparaîtront ici.
              </p>
            </div>
          )}
        </div>

        {/* Right Area - Security metrics & Live Feed Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-tr from-slate-900 via-slate-855 to-slate-950 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-4">
              <Activity className="h-4 w-4 text-blue-400" />
              Actes de Sécurité Conformes
            </h3>

            <div className="space-y-4">
              
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center text-emerald-400 shrink-0 font-bold text-xs mt-0.5 font-mono">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Traçabilité complète</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    Chaque changement opéré sur votre dossier technique est signé cryptographiquement par l'agent ou le chef d'atelier.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center text-emerald-400 shrink-0 font-bold text-xs mt-0.5 font-mono">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Machine-to-Client direct</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    Les valeurs métrologiques saisies lors des contrôles de freinage et pollution dans la sandbox de test sont instantanément notifiées.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center text-blue-400 shrink-0 font-bold text-xs mt-0.5 font-mono">
                  i
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Alertes SMS automatiques</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    Notifications doublées par passerelle de messagerie standard de la station VISITE-TECH.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
