import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Car, 
  CalendarDays, 
  Award, 
  UserCircle,
  LogOut,
  Bell,
  Settings,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';

import ClientDashboard from './client/ClientDashboard';
import Garage from './client/Garage';
import BookingCalendar from './client/BookingCalendar';
import Fidelity from './client/Fidelity';
import NotificationsList from './client/NotificationsList';
import ProfileEditForm from './client/ProfileEditForm';
import ClientAuthentication from './ClientAuthentication';
import HelpCenter from './client/HelpCenter';

import { ExpirationInfo, LoyaltyAccount, RendezVous, AuditLog, SupportTicket } from '../types';

interface ClientSpaceProps {
  expirations: ExpirationInfo[];
  loyaltyAccounts: LoyaltyAccount[];
  appointments: RendezVous[];
  auditLogs: AuditLog[];
  supportTickets: SupportTicket[];
  onAddAppointment: (newAppt: RendezVous) => void;
  onAddVehicle: (newVehicle: Partial<ExpirationInfo>) => void;
  loggedClient: { name: string; plate: string; phone: string } | null;
  onLoginClient: (client: { name: string; plate: string; phone: string }) => void;
  onRegisterClient: (client: { name: string; plate: string; phone: string }) => void;
  registeredClients: { name: string; plate: string; phone: string }[];
  onLogoutClient: () => void;
  onUpdateClientProfile: (client: { name: string; plate: string; phone: string }) => void;
  onCreateSupportTicket: (ticket: SupportTicket) => void;
  onRequestReschedule: (apptId: string, requestedDate: string, requestedTimeSlot: string, reason: string) => void;
  onLoginAdmin: (user: string, pass: string) => boolean;
  onChangeSection: (section: 'home' | 'admin' | 'client') => void;
}

export default function ClientSpace({
  expirations,
  loyaltyAccounts,
  appointments,
  auditLogs = [],
  supportTickets = [],
  onAddAppointment,
  onAddVehicle,
  loggedClient,
  onLoginClient,
  onRegisterClient,
  registeredClients,
  onLogoutClient,
  onUpdateClientProfile,
  onCreateSupportTicket,
  onRequestReschedule,
  onLoginAdmin,
  onChangeSection
}: ClientSpaceProps) {
  
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // If the user is a visitor (not logged in), we display the Authentication screen
  if (!loggedClient) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-50/50 min-h-screen relative z-10" id="client-unauth-space">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-widest text-blue-600">Plateforme Sécurisée</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">
            Espace Client Personnel
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Identifiez-vous pour charger votre garage particulier, faire vos réservations de contrôle technique, et suivre vos privilèges de fidélité.
          </p>
        </div>

        <ClientAuthentication 
          onLogin={onLoginClient}
          onRegister={onRegisterClient}
          registeredClients={registeredClients}
          onLoginAdmin={onLoginAdmin}
          onChangeSection={onChangeSection}
        />
      </div>
    );
  }

  // Active client is the loggedIn user
  const activeClient = loggedClient;

  // Calculate matching relative notification count for the glowing badge
  const clientPlate = activeClient.plate.toUpperCase().trim();
  const clientName = activeClient.name.toLowerCase();
  const clientPhone = activeClient.phone.trim();

  const relativeLogsCount = auditLogs.filter(log => {
    const details = (log.details || '').toLowerCase();
    const action = (log.action || '').toLowerCase();
    const matchesPlate = clientPlate ? details.includes(clientPlate.toLowerCase()) || action.includes(clientPlate.toLowerCase()) : false;
    const matchesName = clientName ? details.includes(clientName) : false;
    const matchesPhone = clientPhone ? details.includes(clientPhone) : false;
    return matchesPlate || matchesName || matchesPhone;
  }).length + appointments.filter(appt => appt.immatriculation.toUpperCase().trim() === clientPlate || appt.clientName.toLowerCase() === clientName).length + 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-50/50 min-h-screen" id="client-space">
      
      {/* Top Banner with Registered Client greeting and disconnect button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 font-mono">
              Compte Client Connecté & Actif
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Bonjour, {activeClient.name} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pilotez les inspections de votre véhicule <strong className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{activeClient.plate}</strong> et faites vos réservations en toute simplicité.
          </p>
        </div>

        {/* User Quick Info Box with Logout Action */}
        <div className="flex items-center gap-3 bg-white border border-slate-250 px-4 py-3 rounded-2xl shadow-3xs w-full sm:w-auto self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2 text-xs">
            <UserCircle className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block leading-none mb-1">
                Plaque active :
              </span>
              <strong className="text-slate-700 font-mono text-[11px]">{activeClient.plate}</strong>
            </div>
          </div>
          
          <button
            onClick={onLogoutClient}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 hover:border-red-300 text-red-600 bg-red-50/50 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Tabs list with standard style */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-2" id="client-tabs-switcher">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'dashboard' 
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Tableau de Bord
        </button>

        <button
          onClick={() => setActiveTab('garage')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'garage' 
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Car className="h-4 w-4" />
          Mon Garage
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'calendar' 
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          Calendrier de Réservation
        </button>

        <button
          onClick={() => setActiveTab('fidelity')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'fidelity' 
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="h-4 w-4" />
          Espace Fidélité
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 relative ${
            activeTab === 'notifications' 
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Notifications &amp; Actes Réglementaires</span>
          {relativeLogsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white ring-2 ring-white animate-pulse">
              {relativeLogsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'profile' 
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="h-4 w-4" />
          Modifier Profil
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'support' 
              ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          Centre d'Aide
        </button>
      </div>

      {/* Dynamic Views Rendering with Tab state */}
      <div className="mt-4" id="client-views-container">
        {activeTab === 'dashboard' && (
          <ClientDashboard
            currentClient={activeClient}
            expirations={expirations}
            loyaltyAccounts={loyaltyAccounts}
            appointments={appointments}
            onTabChange={setActiveTab}
            onRequestReschedule={onRequestReschedule}
          />
        )}

        {activeTab === 'garage' && (
          <Garage
            currentClient={activeClient}
            expirations={expirations}
            onAddVehicle={onAddVehicle}
          />
        )}

        {activeTab === 'calendar' && (
          <BookingCalendar
            currentClient={activeClient}
            expirations={expirations}
            appointments={appointments}
            onAddAppointment={onAddAppointment}
          />
        )}

        {activeTab === 'fidelity' && (
          <Fidelity
            currentClient={activeClient}
            loyaltyAccounts={loyaltyAccounts}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsList
            currentClient={activeClient}
            auditLogs={auditLogs}
            appointments={appointments}
            expirations={expirations}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileEditForm
            currentClient={activeClient}
            onUpdateProfile={onUpdateClientProfile}
            registeredClients={registeredClients}
            expirations={expirations}
          />
        )}

        {activeTab === 'support' && (
          <HelpCenter
            currentClient={activeClient}
            supportTickets={supportTickets}
            onCreateSupportTicket={onCreateSupportTicket}
          />
        )}
      </div>
      
    </div>
  );
}
