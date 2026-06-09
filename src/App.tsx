/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Features from './components/Features';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import ExpiryTracker from './components/ExpiryTracker';
import LoyaltyTracker from './components/LoyaltyTracker';
import AdminPortal from './components/AdminPortal';

import { 
  RendezVous, AuditLog, ExpirationInfo, LoyaltyAccount, SupportTicket 
} from './types';

import { 
  INITIAL_RENDEZ_VOUS, 
  INITIAL_AUDIT_LOGS, 
  EXPIRATION_DATABASE, 
  LOYALTY_DATABASE 
} from './mockData';

import ClientSpace from './components/ClientSpace';
// @ts-ignore
import backgroundCar from './assets/images/background_car_1780823788526.png';

export default function App() {
  const [currentSection, setCurrentSection] = useState<'home' | 'admin' | 'client'>('home');
  const [activeModal, setActiveModal] = useState<'booking' | 'expiry' | 'loyalty' | null>(null);

  // Core records state (backed by localStorage for seamless sessions)
  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [expirations, setExpirations] = useState<ExpirationInfo[]>([]);
  const [loyaltyAccounts, setLoyaltyAccounts] = useState<LoyaltyAccount[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);

  // 🟢 CLIENT REGISTRATION & SESSION MANAGEMENT
  const [registeredClients, setRegisteredClients] = useState<{ name: string; plate: string; phone: string }[]>([]);
  const [loggedClient, setLoggedClient] = useState<{ name: string; plate: string; phone: string } | null>(null);
  const [showAuthRequiredAlert, setShowAuthRequiredAlert] = useState(false);
  const [authAlertReason, setAuthAlertReason] = useState<'booking' | 'expiry' | 'loyalty' | null>(null);

  // 🟢 ADMIN PORTAL AUTHENTICATION
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Authenticate Client User
  const handleLoginClient = (client: { name: string; plate: string; phone: string }) => {
    setLoggedClient(client);
    localStorage.setItem('visitetech_logged_client', JSON.stringify(client));
    setShowAuthRequiredAlert(false);

    // If they were trying to access expiry or loyalty, let's open the corresponding modal automatically immediately upon login!
    if (authAlertReason === 'expiry') {
      setActiveModal('expiry');
    } else if (authAlertReason === 'loyalty') {
      setActiveModal('loyalty');
    } else if (authAlertReason === 'booking') {
      setActiveModal('booking');
    }
    setAuthAlertReason(null);
  };

  // Sign out Client User
  const handleLogoutClient = () => {
    setLoggedClient(null);
    localStorage.removeItem('visitetech_logged_client');
  };

  // Register brand new Client User (Auto logs in and registers vehicle)
  const handleRegisterClient = (client: { name: string; plate: string; phone: string }) => {
    const updated = [client, ...registeredClients];
    setRegisteredClients(updated);
    localStorage.setItem('visitetech_registered_clients', JSON.stringify(updated));
    
    setLoggedClient(client);
    localStorage.setItem('visitetech_logged_client', JSON.stringify(client));
    setShowAuthRequiredAlert(false);

    // Auto-create initial vehicle file inside expiration monitoring
    const today = new Date();
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    const newExp: ExpirationInfo = {
      immatriculation: client.plate,
      clientName: client.name,
      phone: client.phone,
      vehicleType: 'B',
      lastInspectionDate: today.toISOString().split('T')[0],
      nextInspectionDate: nextYear.toISOString().split('T')[0],
      daysLeft: 365,
      status: 'normal',
      alertEmail: true,
      alertSMS: true
    };
    const updatedExps = [newExp, ...expirations];
    setExpirations(updatedExps);
    localStorage.setItem('visitetech_exps', JSON.stringify(updatedExps));

    // Auto-setup starting Loyalty Account
    const startingLoyalty: LoyaltyAccount = {
      immatriculation: client.plate,
      clientName: client.name,
      phone: client.phone,
      points: 0,
      level: 'Bronze',
      inspectionsCount: 0,
      history: []
    };
    const updatedLoyalties = [startingLoyalty, ...loyaltyAccounts];
    setLoyaltyAccounts(updatedLoyalties);
    localStorage.setItem('visitetech_loyl', JSON.stringify(updatedLoyalties));

    // System Log
    const log: AuditLog = {
      id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
      action: 'Inscription Client',
      details: `Création de compte client pour le propriétaire ${client.name} (Véhicule ${client.plate}).`,
      userRole: 'Système',
      timestamp: new Date().toISOString(),
      status: 'success'
    };
    setAuditLogs([log, ...auditLogs]);

    // If they were trying to access expiry or loyalty, let's open the corresponding modal automatically immediately upon registration!
    if (authAlertReason === 'expiry') {
      setActiveModal('expiry');
    } else if (authAlertReason === 'loyalty') {
      setActiveModal('loyalty');
    } else if (authAlertReason === 'booking') {
      setActiveModal('booking');
    }
    setAuthAlertReason(null);
  };

  // Update client details
  const handleUpdateClientProfile = (updatedClient: { name: string; plate: string; phone: string }) => {
    if (!loggedClient) return;
    const oldClient = loggedClient;

    // 1. Update registered clients list
    const updatedClientsList = registeredClients.map(c => 
      (c.plate === oldClient.plate && c.name === oldClient.name) ? updatedClient : c
    );
    setRegisteredClients(updatedClientsList);
    localStorage.setItem('visitetech_registered_clients', JSON.stringify(updatedClientsList));

    // 2. Update active session
    setLoggedClient(updatedClient);
    localStorage.setItem('visitetech_logged_client', JSON.stringify(updatedClient));

    // 3. Update expirations table (matching vehicles)
    const updatedExps = expirations.map(exp => {
      if (exp.immatriculation === oldClient.plate || exp.clientName === oldClient.name) {
        return {
          ...exp,
          immatriculation: updatedClient.plate,
          clientName: updatedClient.name,
          phone: updatedClient.phone
        };
      }
      return exp;
    });
    setExpirations(updatedExps);
    localStorage.setItem('visitetech_exps', JSON.stringify(updatedExps));

    // 4. Update loyalty accounts
    const updatedLoyalties = loyaltyAccounts.map(loy => {
      if (loy.immatriculation === oldClient.plate || loy.clientName === oldClient.name) {
        return {
          ...loy,
          immatriculation: updatedClient.plate,
          clientName: updatedClient.name,
          phone: updatedClient.phone
        };
      }
      return loy;
    });
    setLoyaltyAccounts(updatedLoyalties);
    localStorage.setItem('visitetech_loyl', JSON.stringify(updatedLoyalties));

    // 5. Update appointments
    const updatedAppointments = appointments.map(appt => {
      if (appt.immatriculation === oldClient.plate || appt.clientName === oldClient.name) {
        return {
          ...appt,
          immatriculation: updatedClient.plate,
          clientName: updatedClient.name
        };
      }
      return appt;
    });
    setAppointments(updatedAppointments);
    localStorage.setItem('visitetech_appts', JSON.stringify(updatedAppointments));

    // 6. Log audit action
    const log: AuditLog = {
      id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
      action: 'Modification Profil Client',
      details: `Profil client renommé : ${oldClient.name} (${oldClient.plate}) -> ${updatedClient.name} (${updatedClient.plate}).`,
      userRole: 'Système',
      timestamp: new Date().toISOString(),
      status: 'warning'
    };
    setAuditLogs([log, ...auditLogs]);
  };

  // Login Administrator credentials Verification
  const handleLoginAdmin = (user: string, pass: string): boolean => {
    if (user === 'admin' && pass === 'admin') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('visitetech_admin_auth', 'true');
      return true;
    }
    return false;
  };

  // Admin Sign Out
  const handleLogoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('visitetech_admin_auth');
  };

  // Intercept reservation requests (Required sign-up rule!)
  const handleBookingInitiation = () => {
    if (!loggedClient) {
      setAuthAlertReason('booking');
      setShowAuthRequiredAlert(true);
      setCurrentSection('client');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveModal('booking');
    }
  };

  // Intercept Expiry tracker requests if not logged in
  const handleExpiryInitiation = () => {
    if (!loggedClient) {
      setAuthAlertReason('expiry');
      setShowAuthRequiredAlert(true);
      setCurrentSection('client');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveModal('expiry');
    }
  };

  // Intercept Loyalty tracker requests if not logged in
  const handleLoyaltyInitiation = () => {
    if (!loggedClient) {
      setAuthAlertReason('loyalty');
      setShowAuthRequiredAlert(true);
      setCurrentSection('client');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveModal('loyalty');
    }
  };

  // Reset all data
  const handleClearAllData = () => {
    setAppointments([]);
    setExpirations([]);
    setLoyaltyAccounts([]);
    setSupportTickets([]);
    
    const freshLog: AuditLog = {
      id: `LOG-RESET`,
      action: 'Purge du Système',
      details: 'Nettoyage complet de la base de données. Tous les records de démo ont été purgés pour une nouvelle saisie.',
      userRole: 'Administrateur',
      timestamp: new Date().toISOString(),
      status: 'warning'
    };
    setAuditLogs([freshLog]);
    
    localStorage.setItem('visitetech_appts', JSON.stringify([]));
    localStorage.setItem('visitetech_exps', JSON.stringify([]));
    localStorage.setItem('visitetech_loyl', JSON.stringify([]));
    localStorage.setItem('visitetech_tickets', JSON.stringify([]));
    localStorage.setItem('visitetech_logs', JSON.stringify([freshLog]));
  };

  // Load from localStorage on mount
  useEffect(() => {
    const savedAppts = localStorage.getItem('visitetech_appts');
    const savedLogs = localStorage.getItem('visitetech_logs');
    const savedExps = localStorage.getItem('visitetech_exps');
    const savedLoyl = localStorage.getItem('visitetech_loyl');
    const savedTickets = localStorage.getItem('visitetech_tickets');

    if (savedAppts) setAppointments(JSON.parse(savedAppts));
    else setAppointments(INITIAL_RENDEZ_VOUS);

    if (savedLogs) setAuditLogs(JSON.parse(savedLogs));
    else setAuditLogs(INITIAL_AUDIT_LOGS);

    if (savedExps) setExpirations(JSON.parse(savedExps));
    else setExpirations(EXPIRATION_DATABASE);

    if (savedLoyl) setLoyaltyAccounts(JSON.parse(savedLoyl));
    else setLoyaltyAccounts(LOYALTY_DATABASE);

    if (savedTickets) {
      setSupportTickets(JSON.parse(savedTickets));
    } else {
      const defaultTickets: SupportTicket[] = [
        {
          id: "TCK-105",
          clientName: "Michel Tchoffo",
          phone: "699887766",
          immatriculation: "LT-827-DK",
          subject: "Précision sur la catégorie B",
          message: "Bonjour, je voudrais savoir si un véhicule poids léger de tourisme de type SUV rentre dans le tarif et les points de la catégorie B simple.",
          status: "Résolu" as const,
          createdAt: "2026-06-05T09:00:00Z",
          adminReply: "Bonjour Michel, oui, tout à fait. La catégorie B englobe l'ensemble des véhicules de tourisme classiques et de loisirs (M1) de moins de 3.5 tonnes, y compris les SUV.",
          repliedAt: "2026-06-05T11:30:00Z"
        },
        {
          id: "TCK-109",
          clientName: "Chantal Ngo",
          phone: "655909090",
          immatriculation: "AD-635-FM",
          subject: "Délai de traitement de la vignette",
          message: "Bonjour, j'ai passé ma visite ce matin mais je ne vois pas encore ma vignette validée en vert. Quel est le délai d'activation?",
          status: "Ouvert" as const,
          createdAt: "2026-06-07T08:15:00Z"
        }
      ];
      setSupportTickets(defaultTickets);
      localStorage.setItem('visitetech_tickets', JSON.stringify(defaultTickets));
    }

    // Initial Registered Clients setup
    const savedClients = localStorage.getItem('visitetech_registered_clients');
    if (savedClients) {
      setRegisteredClients(JSON.parse(savedClients));
    } else {
      const demoClients = [
        { name: 'Michel Tchoffo', plate: 'LT-827-DK', phone: '699887766' },
        { name: 'Afrique Trans-Saga', plate: 'OU-904-BK', phone: '233445566' },
        { name: 'Chantal Ngo', plate: 'AD-635-FM', phone: '655909090' }
      ];
      setRegisteredClients(demoClients);
      localStorage.setItem('visitetech_registered_clients', JSON.stringify(demoClients));
    }

    const savedLogged = localStorage.getItem('visitetech_logged_client');
    if (savedLogged) {
      setLoggedClient(JSON.parse(savedLogged));
    }

    const savedAdminAuth = localStorage.getItem('visitetech_admin_auth');
    if (savedAdminAuth === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  // Save changes helper
  const saveToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Submit modification request handler
  const handleRequestReschedule = (apptId: string, requestedDate: string, requestedTimeSlot: string, reason: string) => {
    const updated = appointments.map(appt => {
      if (appt.id === apptId) {
        return {
          ...appt,
          modificationRequest: {
            requestedDate,
            requestedTimeSlot,
            reason,
            status: 'en_attente' as const
          }
        };
      }
      return appt;
    });
    setAppointments(updated);
    saveToLocalStorage('visitetech_appts', updated);

    // Append audit log for the request
    const appt = appointments.find(a => a.id === apptId);
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
      action: 'Demande de modification RDV',
      details: `Le client ${appt ? appt.clientName : ''} a demandé le report du RDV ${apptId} au ${requestedDate} (${requestedTimeSlot}). Motif: ${reason}`,
      userRole: 'Système',
      timestamp: new Date().toISOString(),
      status: 'info'
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    saveToLocalStorage('visitetech_logs', updatedLogs);
  };

  // Accept / Refuse modification request
  const handleResolveReschedule = (apptId: string, action: 'accept' | 'refuse') => {
    const updated = appointments.map(appt => {
      if (appt.id === apptId) {
        if (action === 'accept' && appt.modificationRequest) {
          return {
            ...appt,
            date: appt.modificationRequest.requestedDate,
            timeSlot: appt.modificationRequest.requestedTimeSlot,
            status: 'Confirmé' as const, // Automatically confirm on reschedule accept
            modificationRequest: {
              ...appt.modificationRequest,
              status: 'accepté' as const
            }
          };
        } else if (action === 'refuse' && appt.modificationRequest) {
          return {
            ...appt,
            modificationRequest: {
              ...appt.modificationRequest,
              status: 'refusé' as const
            }
          };
        }
      }
      return appt;
    });
    setAppointments(updated);
    saveToLocalStorage('visitetech_appts', updated);

    const appt = appointments.find(a => a.id === apptId);
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
      action: action === 'accept' ? 'Modification RDV Acceptée' : 'Modification RDV Refusée',
      details: action === 'accept' 
        ? `L'administrateur a accepté le report du RDV ${apptId} au ${appt?.modificationRequest?.requestedDate} (${appt?.modificationRequest?.requestedTimeSlot}).`
        : `L'administrateur a refusé le report du RDV ${apptId}.`,
      userRole: 'Administrateur',
      timestamp: new Date().toISOString(),
      status: action === 'accept' ? 'success' : 'warning'
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    saveToLocalStorage('visitetech_logs', updatedLogs);
  };

  // Support tickets handlers
  const handleCreateSupportTicket = (newTicket: SupportTicket) => {
    const updated = [newTicket, ...supportTickets];
    setSupportTickets(updated);
    saveToLocalStorage('visitetech_tickets', updated);

    // Save and log
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
      action: 'Nouveau Ticket Support',
      details: `Création du ticket ${newTicket.id} par ${newTicket.clientName} : "${newTicket.subject}".`,
      userRole: 'Système',
      timestamp: new Date().toISOString(),
      status: 'info'
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    saveToLocalStorage('visitetech_logs', updatedLogs);
  };

  const handleReplySupportTicket = (ticketId: string, replyMessage: string) => {
    const updated = supportTickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          adminReply: replyMessage,
          repliedAt: new Date().toISOString(),
          status: 'Résolu' as const
        };
      }
      return t;
    });
    setSupportTickets(updated);
    saveToLocalStorage('visitetech_tickets', updated);

    const ticket = supportTickets.find(t => t.id === ticketId);
    // Add audit log
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
      action: 'Réponse Ticket Support',
      details: `L'administrateur a répondu et résolu le ticket ${ticketId} de ${ticket?.clientName}.`,
      userRole: 'Administrateur',
      timestamp: new Date().toISOString(),
      status: 'success'
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    saveToLocalStorage('visitetech_logs', updatedLogs);
  };

  // Add Appointment handler
  const handleAddAppointment = (newAppt: RendezVous) => {
    const updated = [newAppt, ...appointments];
    setAppointments(updated);
    saveToLocalStorage('visitetech_appts', updated);

    // Automatically append a system audit log for complete quality control (PDF Problem 3)
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
      action: 'Prise de Rendez-vous',
      details: `Création du rendez-vous ${newAppt.id} pour le client ${newAppt.clientName} (Véhicule ${newAppt.immatriculation}).`,
      userRole: 'Système',
      timestamp: new Date().toISOString(),
      status: 'success'
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    saveToLocalStorage('visitetech_logs', updatedLogs);

    // Insert or update this vehicle into the expiration database
    const existingExp = expirations.find(e => e.immatriculation === newAppt.immatriculation);
    if (!existingExp) {
      // Simulate typical expiration: 1 year from now
      const today = new Date();
      const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
      
      const newExp: ExpirationInfo = {
        immatriculation: newAppt.immatriculation,
        clientName: newAppt.clientName,
        phone: newAppt.phone,
        vehicleType: newAppt.vehicleType,
        lastInspectionDate: today.toISOString().split('T')[0],
        nextInspectionDate: nextYear.toISOString().split('T')[0],
        daysLeft: 365,
        status: 'normal',
        alertEmail: true,
        alertSMS: true
      };
      
      const updatedExps = [newExp, ...expirations];
      setExpirations(updatedExps);
      saveToLocalStorage('visitetech_exps', updatedExps);
    }
  };

  // Status updates in back office, triggering loyalty points credit
  const handleUpdateApptStatus = (id: string, newStatus: RendezVous['status']) => {
    const previousAppt = appointments.find(a => a.id === id);
    if (!previousAppt) return;

    // Update the record
    const updatedAppts = appointments.map(appt => {
      if (appt.id === id) {
        return { ...appt, status: newStatus };
      }
      return appt;
    });

    setAppointments(updatedAppts);
    saveToLocalStorage('visitetech_appts', updatedAppts);

    // Handle audit logging for the change
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
      action: 'Mise à jour Fiche',
      details: `Changement de statut pour le RDV-id ${id} de "${previousAppt.status}" à "${newStatus}".`,
      userRole: 'Agent',
      timestamp: new Date().toISOString(),
      status: 'info'
    };

    let updatedLogs = [newLog, ...auditLogs];

    // IF status changes to "Retour effectué": credit points & update expiration (PDF Problem 4)
    if (newStatus === 'Retour effectué' && previousAppt.status !== 'Retour effectué') {
      const plate = previousAppt.immatriculation;
      const points = previousAppt.pointsEarned;

      // Update Expiration Date to exactly 1 year from now (representing fresh inspection stamp)
      const freshPassDate = new Date();
      const freshExpiryDate = new Date();
      freshExpiryDate.setFullYear(freshPassDate.getFullYear() + (previousAppt.vehicleType === 'C' || previousAppt.vehicleType === 'D' ? 0 : 1));
      if (previousAppt.vehicleType === 'C' || previousAppt.vehicleType === 'D') {
        freshExpiryDate.setMonth(freshPassDate.getMonth() + 6); // 6 Month validity for commercial transportation
      } else {
        freshExpiryDate.setMonth(freshPassDate.getMonth() + 12); // Standard year
      }

      const updatedExpirations = expirations.map(exp => {
        if (exp.immatriculation === plate) {
          return {
            ...exp,
            lastInspectionDate: freshPassDate.toISOString().split('T')[0],
            nextInspectionDate: freshExpiryDate.toISOString().split('T')[0],
            daysLeft: previousAppt.vehicleType === 'C' || previousAppt.vehicleType === 'D' ? 180 : 365,
            status: 'normal' as const
          };
        }
        return exp;
      });
      setExpirations(updatedExpirations);
      saveToLocalStorage('visitetech_exps', updatedExpirations);

      // Add points to Loyalty Account
      const loyaltyIndex = loyaltyAccounts.findIndex(acc => acc.immatriculation === plate);
      
      let updatedLoyalties = [...loyaltyAccounts];

      if (loyaltyIndex !== -1) {
        const acc = loyaltyAccounts[loyaltyIndex];
        const newPointsValue = acc.points + points;
        
        // Calculate dynamic level tiers
        let newLevel: 'Bronze' | 'Silver' | 'Gold' = 'Bronze';
        if (newPointsValue > 90) newLevel = 'Gold';
        else if (newPointsValue > 30) newLevel = 'Silver';

        const updatedHistory = [
          {
            id: `LH-${Math.floor(100 + Math.random() * 900)}`,
            date: freshPassDate.toISOString().split('T')[0],
            type: `Inspection Catégorie ${previousAppt.vehicleType} validée`,
            points: points
          },
          ...acc.history
        ];

        updatedLoyalties[loyaltyIndex] = {
          ...acc,
          points: newPointsValue,
          level: newLevel,
          inspectionsCount: acc.inspectionsCount + 1,
          history: updatedHistory
        };
      } else {
        // Create new account
        let newLevel: 'Bronze' | 'Silver' | 'Gold' = 'Bronze';
        if (points > 90) newLevel = 'Gold';
        else if (points > 30) newLevel = 'Silver';

        const newAcc: LoyaltyAccount = {
          immatriculation: plate,
          phone: previousAppt.phone,
          clientName: previousAppt.clientName,
          points: points,
          level: newLevel,
          inspectionsCount: 1,
          history: [
            {
              id: `LH-${Math.floor(100 + Math.random() * 900)}`,
              date: freshPassDate.toISOString().split('T')[0],
              type: `Inspection initiale Catégorie ${previousAppt.vehicleType}`,
              points: points
            }
          ]
        };
        updatedLoyalties = [newAcc, ...updatedLoyalties];
      }

      setLoyaltyAccounts(updatedLoyalties);
      saveToLocalStorage('visitetech_loyl', updatedLoyalties);

      // Push distinct points audit log
      const pointsLog: AuditLog = {
        id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
        action: 'Allocation Points Fidélité',
        details: `Compte Fidélité ${plate} crédité de +${points} Points (Nouveau solde vérifié).`,
        userRole: 'Système',
        timestamp: new Date().toISOString(),
        status: 'success'
      };
      updatedLogs = [pointsLog, ...updatedLogs];
    }

    setAuditLogs(updatedLogs);
    saveToLocalStorage('visitetech_logs', updatedLogs);
  };

  // Toggle notification alerts status for vehicles
  const handleToggleAlert = (plate: string, type: 'SMS' | 'Email') => {
    const updated = expirations.map(exp => {
      if (exp.immatriculation === plate) {
        const updatedExp = { ...exp };
        if (type === 'SMS') updatedExp.alertSMS = !exp.alertSMS;
        if (type === 'Email') updatedExp.alertEmail = !exp.alertEmail;
        
        // Log changes
        const triggerState = type === 'SMS' ? updatedExp.alertSMS : updatedExp.alertEmail;
        const newLog: AuditLog = {
          id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
          action: 'Ajustement Capteurs',
          details: `Abonnement notifications ${type} ${triggerState ? 'activé' : 'désactivé'} pour ${plate}.`,
          userRole: 'Système',
          timestamp: new Date().toISOString(),
          status: 'info'
        };
        const updatedLogsList = [newLog, ...auditLogs];
        setAuditLogs(updatedLogsList);
        saveToLocalStorage('visitetech_logs', updatedLogsList);

        return updatedExp;
      }
      return exp;
    });

    setExpirations(updated);
    saveToLocalStorage('visitetech_exps', updated);
  };

  // Adding Custom Auditing action
  const handleAddAuditLog = (action: string, details: string, status: AuditLog['status']) => {
    const log: AuditLog = {
      id: `LOG-${Math.floor(300 + Math.random() * 700)}`,
      action,
      details,
      userRole: 'Administrateur',
      timestamp: new Date().toISOString(),
      status
    };
    const updated = [log, ...auditLogs];
    setAuditLogs(updated);
    saveToLocalStorage('visitetech_logs', updated);
  };

  // Add vehicle to expirations database (from Garage)
  const handleAddVehicle = (newVeh: Partial<ExpirationInfo>) => {
    const fullVeh: ExpirationInfo = {
      immatriculation: newVeh.immatriculation!,
      clientName: newVeh.clientName!,
      phone: newVeh.phone!,
      vehicleType: newVeh.vehicleType || 'B',
      lastInspectionDate: newVeh.lastInspectionDate || new Date().toISOString().split('T')[0],
      nextInspectionDate: newVeh.nextInspectionDate || new Date().toISOString().split('T')[0],
      daysLeft: newVeh.daysLeft || 365,
      status: newVeh.status || 'normal',
      alertEmail: true,
      alertSMS: true
    };
    
    const updated = [fullVeh, ...expirations];
    setExpirations(updated);
    saveToLocalStorage('visitetech_exps', updated);

    // Auto-create a complimentary loyalty account if it doesn't exist
    const loyaltyIndex = loyaltyAccounts.findIndex(l => l.immatriculation === fullVeh.immatriculation);
    if (loyaltyIndex === -1) {
      const newLoyalty: LoyaltyAccount = {
        immatriculation: fullVeh.immatriculation,
        clientName: fullVeh.clientName,
        phone: fullVeh.phone,
        points: 0,
        level: 'Bronze',
        inspectionsCount: 0,
        history: []
      };
      const updatedLoyalty = [newLoyalty, ...loyaltyAccounts];
      setLoyaltyAccounts(updatedLoyalty);
      saveToLocalStorage('visitetech_loyl', updatedLoyalty);
    }

    // Capture system audit log for complete transparency
    const newLog: AuditLog = {
      id: `LOG-${Math.floor(200 + Math.random() * 800)}`,
      action: 'Création Fiche Véhicule',
      details: `Enregistrement du véhicule ${fullVeh.immatriculation} (Catégorie ${fullVeh.vehicleType}) pour le client ${fullVeh.clientName}.`,
      userRole: 'Système',
      timestamp: new Date().toISOString(),
      status: 'success'
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    saveToLocalStorage('visitetech_logs', updatedLogs);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/70 font-sans text-slate-800 antialiased relative overflow-hidden" id="visitetech-app">
      {/* Subtle background luxury automotive visual indicator */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.24] bg-cover bg-center bg-no-repeat z-0 mix-blend-normal filter saturate-[1.1] contrast-[1.02]"
        style={{ backgroundImage: `url(${backgroundCar})` }}
      />
      
      {/* Navbar navigation controls represent complete SPA logic */}
      <Navbar
        currentSection={currentSection}
        onChangeSection={setCurrentSection}
        onOpenBooking={handleBookingInitiation}
        onOpenExpiry={handleExpiryInitiation}
        onOpenLoyalty={handleLoyaltyInitiation}
        loggedClient={loggedClient}
        onLogoutClient={handleLogoutClient}
        isAdminAuthenticated={isAdminAuthenticated}
        onLogoutAdmin={handleLogoutAdmin}
      />

      <main className="flex-grow relative z-10 animate-fade-in">
        {/* Dynamic Warning Alert banner for unregistered reservation attempt */}
        {showAuthRequiredAlert && !loggedClient && currentSection === 'client' && (
          <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-850 text-xs font-semibold shadow-xs">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-550 text-white font-bold leading-none">!</span>
              <div>
                <strong className="block text-slate-900 font-bold mb-0.5">Inscription ou connexion requise</strong>
                <span>
                  {authAlertReason === 'expiry' ? (
                    "Afin d'accéder au suivi d'échéance de vos véhicules, vous devez d'abord vous connecter ou créer un compte client. C'est rapide, gratuit et sécurisé !"
                  ) : authAlertReason === 'loyalty' ? (
                    "Afin de consulter vos points et avantages de fidélité, vous devez d'abord vous connecter ou créer un compte client. C'est rapide, gratuit et sécurisé !"
                  ) : (
                    "Afin de réserver un créneau de contrôle technique, vous devez d'abord vous connecter ou créer un compte client. C'est rapide, gratuit et sécurisé !"
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {currentSection === 'home' ? (
          <div>
            {/* Primary presentation banner */}
            <HeroSection
              onOpenBooking={handleBookingInitiation}
              onOpenExpiry={handleExpiryInitiation}
              onOpenLoyalty={handleLoyaltyInitiation}
            />

            {/* Cruip template modular bento grids */}
            <Features
              onOpenBooking={handleBookingInitiation}
              onOpenExpiry={handleExpiryInitiation}
              onOpenLoyalty={handleLoyaltyInitiation}
            />
          </div>
        ) : currentSection === 'client' ? (
          <ClientSpace
            expirations={expirations}
            loyaltyAccounts={loyaltyAccounts}
            appointments={appointments}
            auditLogs={auditLogs}
            supportTickets={supportTickets}
            onAddAppointment={handleAddAppointment}
            onAddVehicle={handleAddVehicle}
            loggedClient={loggedClient}
            onLoginClient={handleLoginClient}
            onRegisterClient={handleRegisterClient}
            registeredClients={registeredClients}
            onLogoutClient={handleLogoutClient}
            onUpdateClientProfile={handleUpdateClientProfile}
            onCreateSupportTicket={handleCreateSupportTicket}
            onRequestReschedule={handleRequestReschedule}
            onLoginAdmin={handleLoginAdmin}
            onChangeSection={setCurrentSection}
          />
        ) : (
          /* Live statistics, interactive status changers and audits */
          <AdminPortal
            appointments={appointments}
            auditLogs={auditLogs}
            expirations={expirations}
            supportTickets={supportTickets}
            onAddVehicle={handleAddVehicle}
            onToggleAlert={handleToggleAlert}
            onUpdateApptStatus={handleUpdateApptStatus}
            onAddAuditLog={handleAddAuditLog}
            onClearAllData={handleClearAllData}
            isAdminAuthenticated={isAdminAuthenticated}
            onLoginAdmin={handleLoginAdmin}
            onLogoutAdmin={handleLogoutAdmin}
            onReplySupportTicket={handleReplySupportTicket}
            onResolveReschedule={handleResolveReschedule}
          />
        )}
      </main>

      <Footer
        currentSection={currentSection}
        onChangeSection={setCurrentSection}
      />

      {/* OVERLAY CLIENT PORTALS */}
      <BookingModal
        isOpen={activeModal === 'booking'}
        onClose={() => setActiveModal(null)}
        onAddAppointment={handleAddAppointment}
        loggedClient={loggedClient}
      />

      <ExpiryTracker
        isOpen={activeModal === 'expiry'}
        onClose={() => setActiveModal(null)}
        expirations={expirations}
        onToggleAlert={handleToggleAlert}
      />

      <LoyaltyTracker
        isOpen={activeModal === 'loyalty'}
        onClose={() => setActiveModal(null)}
        loyaltyAccounts={loyaltyAccounts}
      />
    </div>
  );
}
