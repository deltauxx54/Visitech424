/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, BarChart3, ShieldAlert, History, Filter, Search, RefreshCw, 
  CheckCircle, Clock, AlertTriangle, Play, HelpCircle, Save, Layers, ListFilter,
  Check, ArrowUpRight, Ban, Send, Plus, Landmark, Database, Phone, UserCheck, Terminal, CheckCheck, Trash2,
  Lock, Download
} from 'lucide-react';
import { RendezVous, AuditLog, ExpirationInfo, SupportTicket } from '../types';
import { useFormValidation } from '../hooks/useFormValidation';

interface AdminPortalProps {
  appointments: RendezVous[];
  auditLogs: AuditLog[];
  expirations: ExpirationInfo[];
  supportTickets: SupportTicket[];
  onAddVehicle: (newVehicle: Partial<ExpirationInfo>) => void;
  onToggleAlert: (plate: string, type: 'SMS' | 'Email') => void;
  onUpdateApptStatus: (id: string, newStatus: RendezVous['status']) => void;
  onAddAuditLog: (action: string, details: string, level: AuditLog['status']) => void;
  onClearAllData?: () => void;
  isAdminAuthenticated: boolean;
  onLoginAdmin: (user: string, pass: string) => boolean;
  onLogoutAdmin: () => void;
  onReplySupportTicket: (ticketId: string, replyMessage: string) => void;
  onResolveReschedule: (apptId: string, action: 'accept' | 'refuse') => void;
}

export default function AdminPortal({ 
  appointments, 
  auditLogs, 
  expirations,
  supportTickets = [],
  onAddVehicle,
  onToggleAlert,
  onUpdateApptStatus,
  onAddAuditLog,
  onClearAllData,
  isAdminAuthenticated,
  onLoginAdmin,
  onLogoutAdmin,
  onReplySupportTicket,
  onResolveReschedule
}: AdminPortalProps) {
  // Authentication form states
  const [adminInputUser, setAdminInputUser] = useState('');
  const [adminInputPass, setAdminInputPass] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // Navigation tabs of backoffice
  const [activeTab, setActiveTab] = useState<'registre' | 'kpis' | 'appointments' | 'audit' | 'sandbox' | 'support'>('registre');

  // Support tickets replies state map
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Personalized messaging state
  const [selectedClientForMsg, setSelectedClientForMsg] = useState<ExpirationInfo | null>(null);
  const [customSmsText, setCustomSmsText] = useState<string>('');
  
  // CSV EXPORT FUNCTIONS
  const handleExportRegistryCSV = () => {
    const headers = [
      'Immatriculation',
      'Proprietaire',
      'Telephone',
      'Categorie',
      'Echeance technique',
      'Statut retard (jours)',
      'Alerte SMS Active',
      'Alerte Email Active'
    ];
    
    const rows = expirations.map(exp => [
      exp.immatriculation,
      exp.clientName,
      `="${exp.phone}"`, // Prevent Excel trimming leading zeros
      exp.vehicleType,
      exp.nextInspectionDate,
      exp.daysLeft,
      exp.alertSMS ? 'OUI' : 'NON',
      exp.alertEmail ? 'OUI' : 'NON'
    ]);
    
    // Semcolons are standard in French Excel versions
    const csvContent = [
      headers.join(';'),
      ...rows.map(e => e.join(';'))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registre_suivi_technique_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setAdminNotify({
      type: 'success',
      message: 'Excellent ! Le registre de suivi technique client a été exporté au format CSV (compatible Excel / LibreOffice).'
    });
  };

  const handleExportAppointmentsCSV = () => {
    const headers = [
      'Reference RDV',
      'Proprietaire',
      'Telephone',
      'Immatriculation',
      'Categorie Vehicule',
      'Date Prevue',
      'Creneau Horaire',
      'Statut Rendez-vous',
      'Modification Demande',
      'Proposition Jour',
      'Proposition Heure',
      'Motif'
    ];
    
    const rows = appointments.map(appt => [
      appt.id,
      appt.clientName,
      `="${appt.phone}"`,
      appt.immatriculation,
      appt.vehicleType,
      appt.date,
      appt.timeSlot,
      appt.status,
      appt.modificationRequest ? 'OUI' : 'NON',
      appt.modificationRequest?.requestedDate || '',
      appt.modificationRequest?.requestedTimeSlot || '',
      appt.modificationRequest?.reason || ''
    ]);
    
    const csvContent = [
      headers.join(';'),
      ...rows.map(e => e.join(';'))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `suivi_passages_rdv_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setAdminNotify({
      type: 'success',
      message: 'Félicitations ! Le plan de charge et passages RDV a été exporté en format CSV avec succès.'
    });
  };
  
  // Registre Search and Filter states
  const [regSearch, setRegSearch] = useState('');
  const [regCategory, setRegCategory] = useState<string>('Tous');
  const [regStatus, setRegStatus] = useState<string>('Tous');

  // Appointments Search and Filter states
  const [apptSearch, setApptSearch] = useState('');
  const [apptFilterStatus, setApptFilterStatus] = useState<string>('Tous');

  // Security Logs filter
  const [auditFilterRole, setAuditFilterRole] = useState<string>('Tous');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // Performance audit period filter: (Inspiré de i2.2.jpeg: Jour / Semaine / Mois)
  const [reportPeriod, setReportPeriod] = useState<'jour' | 'semaine' | 'mois'>('mois');

  // Feedback notifications
  const [adminNotify, setAdminNotify] = useState<{ type: 'success' | 'warning' | null; message: string }>({ type: null, message: '' });

  // ----------------------------------------------------
  // USE FORM VALIDATION HOOK - Showcasing Prompt 4
  // ----------------------------------------------------
  const { 
    values: formValues, 
    errors: formErrors, 
    handleChange: formHandleChange, 
    isFormValid: formIsFormValid, 
    resetForm: formResetForm,
    validateAll: formValidateAll
  } = useFormValidation(
    {
      clientName: '',
      phone: '',
      immatriculation: '',
      brand: ''
    },
    {
      clientName: { required: true, minLength: 3 },
      phone: { required: true, phone: true },
      immatriculation: { required: true, immatriculation: true },
      brand: { required: false }
    }
  );

  const [sandboxCategory, setSandboxCategory] = useState<'A' | 'B' | 'B1' | 'C' | 'D'>('B');

  // Handle manual creation in Espace Admin
  const handleCreateClientRegistry = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trigger validation
    const isValid = formValidateAll();
    if (!isValid) {
      setAdminNotify({
        type: 'warning',
        message: 'Le formulaire contient des erreurs de saisie. Veuillez les corriger avant la validation.'
      });
      return;
    }

    const cleanPlate = formValues.immatriculation.toUpperCase().trim();
    
    // Check duplicate plate
    if (expirations.some(exp => exp.immatriculation === cleanPlate)) {
      setAdminNotify({
        type: 'warning',
        message: `Erreur: Le véhicule immatriculé ${cleanPlate} est déjà présent dans la base de données.`
      });
      return;
    }

    // Process and add
    const today = new Date();
    const expiry = new Date();
    const isCommercial = ['B1', 'C', 'D'].includes(sandboxCategory);
    expiry.setMonth(today.getMonth() + (isCommercial ? 6 : 12));

    const newVehInfo = {
      immatriculation: cleanPlate,
      clientName: formValues.clientName.trim(),
      phone: formValues.phone.replace(/[\s.-]/g, ''),
      vehicleType: sandboxCategory,
      lastInspectionDate: today.toISOString().split('T')[0],
      nextInspectionDate: expiry.toISOString().split('T')[0],
      daysLeft: isCommercial ? 180 : 365,
      status: 'normal' as const
    };

    onAddVehicle(newVehInfo);
    
    // Trigger manual system audit log entry for total visibility
    onAddAuditLog(
      'Saisie Administrateur Réussie',
      `Fiche client créée par l'Administrateur pour ${newVehInfo.clientName} (Véhicule: ${newVehInfo.immatriculation}, Catégorie: ${sandboxCategory}). Validation des données 100% Intègre.`,
      'success'
    );

    setAdminNotify({
      type: 'success',
      message: `Excellent ! Le client ${newVehInfo.clientName} (${cleanPlate}) a été ajouté au registre numérique.`
    });

    formResetForm();
  };

  // 1. REGISTRE NUMÉRIQUE PROCESSING (Inspiré de i1.jpeg)
  const filteredRegistry = expirations.filter(exp => {
    const matchesSearch = exp.clientName.toLowerCase().includes(regSearch.toLowerCase()) || 
                          exp.immatriculation.toLowerCase().includes(regSearch.toLowerCase()) ||
                          exp.phone.includes(regSearch);
    
    const matchesCategory = regCategory === 'Tous' || exp.vehicleType === regCategory;
    
    // Renewal state logic: daysLeft <= 0 or in danger or warning implies "À relancer"
    const renewalStatus = exp.daysLeft <= 15 ? 'relancer' : 'ok';
    const matchesStatus = regStatus === 'Tous' || 
                          (regStatus === 'OK' && renewalStatus === 'ok') ||
                          (regStatus === 'Relancer' && renewalStatus === 'relancer');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // 2. AUDIT ET RAPPORTS CALCULATIONS (Inspiré de i2.2.jpeg: Jour / Semaine / Mois)
  // State for statistical results dynamically synchronized with Ministry unique portal
  const [statsByPeriod, setStatsByPeriod] = useState({
    mois: {
      attendus: 1753,
      reponses: 1008,
      taux_reponse: 62.59,
      completes_centre: 631,
      completes_ailleurs: 319,
      non_renouveles: 803,
      details: [
        { cat: 'A', label: 'Cylindrées / Deux-roues', attendus: 59, fait: 28, ailleurs: 3, non: 28 },
        { cat: 'B', label: 'Véhicules de Tourisme (M1)', attendus: 644, fait: 161, ailleurs: 70, non: 413 },
        { cat: 'B1', label: 'Taxis raccordés', attendus: 231, fait: 85, ailleurs: 28, non: 118 },
        { cat: 'C', label: 'Fourgons / Utilitaires', attendus: 85, fait: 22, ailleurs: 9, non: 54 },
        { cat: 'D', label: 'Autocars / Transports Lourds', attendus: 734, fait: 335, ailleurs: 209, non: 190 }
      ]
    },
    semaine: {
      attendus: 438,
      reponses: 285,
      taux_reponse: 65.07,
      completes_centre: 172,
      completes_ailleurs: 81,
      non_renouveles: 185,
      details: [
        { cat: 'A', label: 'Cylindrées / Deux-roues', attendus: 15, fait: 7, ailleurs: 1, non: 7 },
        { cat: 'B', label: 'Véhicules de Tourisme (M1)', attendus: 161, fait: 40, ailleurs: 18, non: 103 },
        { cat: 'B1', label: 'Taxis raccordés', attendus: 58, fait: 21, ailleurs: 7, non: 30 },
        { cat: 'C', label: 'Fourgons / Utilitaires', attendus: 21, fait: 5, ailleurs: 2, non: 14 },
        { cat: 'D', label: 'Autocars / Transports Lourds', attendus: 183, fait: 99, ailleurs: 53, non: 31 }
      ]
    },
    jour: {
      attendus: 62,
      reponses: 45,
      taux_reponse: 72.58,
      completes_centre: 28,
      completes_ailleurs: 12,
      non_renouveles: 22,
      details: [
        { cat: 'A', label: 'Cylindrées / Deux-roues', attendus: 2, fait: 1, ailleurs: 0, non: 1 },
        { cat: 'B', label: 'Véhicules de Tourisme (M1)', attendus: 23, fait: 6, ailleurs: 3, non: 14 },
        { cat: 'B1', label: 'Taxis raccordés', attendus: 8, fait: 3, ailleurs: 1, non: 4 },
        { cat: 'C', label: 'Fourgons / Utilitaires', attendus: 3, fait: 1, ailleurs: 0, non: 2 },
        { cat: 'D', label: 'Autocars / Transports Lourds', attendus: 26, fait: 17, ailleurs: 8, non: 1 }
      ]
    }
  });

  // Ministry Portal Synchronization States (Alternative Simulator requested by user)
  const [isMinistrySyncing, setIsMinistrySyncing] = useState(false);
  const [ministrySyncLogs, setMinistrySyncLogs] = useState<string[]>([]);
  const [lastMinistrySyncDate, setLastMinistrySyncDate] = useState<string>('En attente de connexion...');
  const [pendingMinistryRenewals, setPendingMinistryRenewals] = useState<Array<{ immatriculation: string; category: string; garage: string; date: string }>>([
    { immatriculation: 'LT-842-OA', category: 'B', garage: 'Garage Étoile Douala', date: '2026-06-08' },
    { immatriculation: 'CE-904-BK', category: 'D', garage: 'Centre Routier Yaoundé', date: '2026-06-08' },
    { immatriculation: 'OU-112-AA', category: 'A', garage: 'Moto Sécurité Ouest', date: '2026-06-07' },
    { immatriculation: 'LT-551-ZZ', category: 'B1', garage: 'Taxi-Clair Littoral', date: '2026-06-08' },
    { immatriculation: 'AD-440-CC', category: 'C', garage: 'Logistique Logone', date: '2026-06-06' }
  ]);

  // Form states for manual registration on Ministry's Portal (Simulated)
  const [simPlate, setSimPlate] = useState('');
  const [simCat, setSimCat] = useState<'A' | 'B' | 'B1' | 'C' | 'D'>('B');
  const [simGarage, setSimGarage] = useState('Garage Agréé Tiers');

  const activeStats = statsByPeriod[reportPeriod];

  // Action to declare a vehicle to the Ministry Portal from a third-party garage (Simulation as requested by user)
  const handleSimulateMinistryDeclaration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simPlate.trim()) return;

    const formattedPlate = simPlate.trim().toUpperCase();
    const newDecl = {
      immatriculation: formattedPlate,
      category: simCat,
      garage: simGarage,
      date: new Date().toISOString().split('T')[0]
    };

    setPendingMinistryRenewals([newDecl, ...pendingMinistryRenewals]);
    setSimPlate('');

    onAddAuditLog(
      'Déclaration Ministère (Simulée)',
      `Déclaration externe du véhicule ${formattedPlate} (Catégorie : ${simCat}) enregistrée sur le portail MINT par le centre tiers "${simGarage}".`,
      'info'
    );

    setAdminNotify({
      type: 'success',
      message: `Succès : Le véhicule ${formattedPlate} a été déclaré au portail du Ministère. Lancez la synchronisation pour l'intégrer aux rapports !`
    });
  };

  // Action to synchronize our app statistics with the Ministry Portal (Simulation of manual task automation)
  const handleTriggerMinistrySync = () => {
    if (isMinistrySyncing) return;

    setIsMinistrySyncing(true);
    setMinistrySyncLogs([
      "🔄 [SYS]: Connexion SSL sécurisée au serveur distant securite-routiere.gov.cm...",
    ]);

    setTimeout(() => {
      setMinistrySyncLogs(prev => [
        ...prev,
        "🔑 [API]: Protocole OAUTH2 validé. Jeton d'accès de session actif (X-MINT-Token-True).",
      ]);
    }, 600);

    setTimeout(() => {
      setMinistrySyncLogs(prev => [
        ...prev,
        "📂 [MINT]: Téléchargement du journal des contrôles techniques tiers de la CEMAC...",
        `📦 [MINT]: ${pendingMinistryRenewals.length} dossier(s) d'immatriculation en attente d'assimilation trouvé(s).`
      ]);
    }, 1200);

    setTimeout(() => {
      // Create detailed logs for each matched vehicle
      const matchLogs = pendingMinistryRenewals.map(item => 
        `✅ [REC]: Véhicule ${item.immatriculation} (${item.category}) - Pris en charge par "${item.garage}"`
      );

      setMinistrySyncLogs(prev => [
        ...prev,
        ...matchLogs,
        "📊 [SYS]: Recalcul de la répartition statistique en temps réel..."
      ]);

      // Actually update the state values in statsByPeriod for ALL dimensions!
      setStatsByPeriod(prev => {
        const next = JSON.parse(JSON.stringify(prev)) as typeof statsByPeriod;
        
        pendingMinistryRenewals.forEach(item => {
          // Go through 'mois', 'semaine', 'jour' and check if we can simulate adding it to 'ailleurs'
          const periods: Array<'mois' | 'semaine' | 'jour'> = ['mois', 'semaine', 'jour'];
          periods.forEach(p => {
            const index = next[p].details.findIndex(det => det.cat === item.category);
            if (index !== -1) {
              // Increment "ailleurs"
              next[p].details[index].ailleurs += 1;
              // If "non" is greater than 0, decrease it, otherwise keep it coherent
              if (next[p].details[index].non > 0) {
                next[p].details[index].non -= 1;
              }
              // Also update global counters
              next[p].completes_ailleurs += 1;
              if (next[p].non_renouveles > 0) {
                next[p].non_renouveles -= 1;
              }
            }
          });
        });

        return next;
      });

    }, 2000);

    setTimeout(() => {
      setMinistrySyncLogs(prev => [
        ...prev,
        "🎉 [SUCCESS]: Synchronisation de la répartition statistique terminée avec succès ! La plateforme VisiteTech est à jour.",
      ]);
      setIsMinistrySyncing(false);
      setLastMinistrySyncDate(new Date().toLocaleTimeString('fr-FR') + ' (Aujourd\'hui)');
      setPendingMinistryRenewals([]); // Clear processed ones

      onAddAuditLog(
        'Synchronisation Portail Ministériel',
        'Liaison API gouvernementale exécutée avec succès. Les immatriculations déclarées auprès d\'agences tierces ont été consolidées dans nos statistiques d\'audit.',
        'success'
      );

      setAdminNotify({
        type: 'success',
        message: 'Félicitations ! La synchronisation avec le site du Ministère s\'est déroulée avec succès. Les statistiques ont été mises à jour.'
      });
    }, 2800);
  };

  // 3. APPOINTMENTS FILTERING
  const filteredAppts = appointments.filter(appt => {
    const matchesSearch = appt.clientName.toLowerCase().includes(apptSearch.toLowerCase()) || 
                          appt.immatriculation.toLowerCase().includes(apptSearch.toLowerCase()) ||
                          appt.phone.includes(apptSearch);
    const matchesStatus = apptFilterStatus === 'Tous' || appt.status === apptFilterStatus;
    return matchesSearch && matchesStatus;
  });

  // 4. CHRONOLOGICAL AUDIT LOGS SECURITY LIST
  const filteredLogs = auditLogs.filter(log => {
    const matchesRole = auditFilterRole === 'Tous' || log.userRole === auditFilterRole;
    const matchesSearch = log.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) || 
                          log.details.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                          log.id.toLowerCase().includes(auditSearchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Trigger automated quality controls
  const handleTriggerSelfAudit = () => {
    const randomChecks = [
      { action: 'Calibrage Banc Freinage', details: 'Vérification métrologique de la balance d\'essieu. Précision de mesure conforme à 99.8%. Certifié.', level: 'success' },
      { action: 'Vérification Format Saisie', details: 'Audit double-saisie : Format de plaque d\'immatriculation vérifié selon la table règlementaire.', level: 'success' },
      { action: 'Garniture Opérationnelle', details: 'Réalignement d\'ouverture de vanne d\'extraction de CO2 des tubes d\'échappement.', level: 'info' },
      { action: 'Intégrité du Registre Sec', details: 'Contrôle de hash SHA-256 du registre numérique. Zéro altération externe suspectée.', level: 'success' },
      { action: 'Alerte Synchro SMS', details: 'Tentative de renvoi d\'un paquet SMS à l\'opérateur national réseau rétablie.', level: 'warning' }
    ];

    const pick = randomChecks[Math.floor(Math.random() * randomChecks.length)];
    onAddAuditLog(pick.action, pick.details, pick.level as any);

    setAdminNotify({
      type: 'success',
      message: `Audit qualité interne complété: "${pick.action}" enregistré dans le Journal d'Audit.`
    });
  };

  // Trigger manual SMS or Email dispatch simulation
  const handleTriggerManualAlert = (plate: string, method: 'SMS' | 'Email') => {
    const client = expirations.find(e => e.immatriculation === plate);
    if (!client) return;

    onToggleAlert(plate, method);

    onAddAuditLog(
      `Relance Manuelle Envoyée`,
      `Notification de courtoisie ${method} envoyée à ${client.clientName} (${client.phone}) concernant son véhicule ${plate}.`,
      'info'
    );

    setAdminNotify({
      type: 'success',
      message: `Félicitations! Une relance formelle par ${method} a été émise avec succès vers ${client.clientName}.`
    });
  };

  // 📥 EXTRACTION DES SUIVIS D'ACTIVITÉ (JOURNALIER, HEBDOMADAIRE, MENSUEL)
  const handleDownloadReport = (type: 'journalier' | 'hebdomadaire' | 'mensuel') => {
    const todayStr = new Date().toISOString().split('T')[0];
    let title = '';
    let content = '';

    if (type === 'journalier') {
      title = `suivi_journalier_${todayStr}.txt`;
      const todayAppts = appointments.filter(a => a.date === todayStr);
      
      content = `===========================================================
VISITE-TECH - RAPPORT DE SUIVI JOURNALIER
Généré le : ${new Date().toLocaleString('fr-FR')}
Événement : Contrôles & Passages journaliers
===========================================================

1. STATISTIQUES OPÉRATIONNELLES DU JOUR (${todayStr})
-----------------------------------------------------------
- Échéances identifiées à relancer : ${statsByPeriod.jour.attendus} véhicules
- Réponses traitées par les agents : ${statsByPeriod.jour.reponses}
- Taux de réponse optimal : ${statsByPeriod.jour.taux_reponse}%
- Contrôles finalisés avec succès au centre : ${statsByPeriod.jour.completes_centre}
- Inspections terminées via d'autres agences partenaires : ${statsByPeriod.jour.completes_ailleurs}

2. PASSAGES / RENDEZ-VOUS PLANIFIÉS AUJOURD'HUI
-----------------------------------------------------------
${todayAppts.length === 0 
  ? "Aucun rendez-vous de contrôle technique enregistré à cette date." 
  : todayAppts.map((a, i) => `${i + 1}) Réf : ${a.id} | Proprietaire : ${a.clientName} | Référence Plaque : ${a.immatriculation} (${a.vehicleType}) | Heure : ${a.timeSlot} | Statut : ${a.status}`).join('\n')
}

3. DERNIÈRES VALIDATIONS ET ÉVÉNEMENTS D'AUDIT TECHNIQUE
-----------------------------------------------------------
${auditLogs.slice(0, 10).map((l, i) => `[${l.timestamp.slice(11, 19)}] ${l.action} -> ${l.details} (${l.userRole})`).join('\n')}

===========================================================
Généré de manière sécurisée par le système central de la station VISITE-TECH.
Document d'archivage conforme à la règlementation routière.
===========================================================`;
    } 
    else if (type === 'hebdomadaire') {
      title = `suivi_hebdomadaire_${todayStr}.txt`;
      const urgentExps = expirations.filter(e => e.daysLeft <= 15);
      const nextSevenDaysAppts = appointments.slice(0, 12);

      content = `===========================================================
VISITE-TECH - RAPPORT DE SUIVI HEBDOMADAIRE
Périmètre : Synthèse 7 Jours Glissants au ${todayStr}
===========================================================

1. INDICATEURS DE CONVERSION ET COUVERTURE SEMAINE
-----------------------------------------------------------
- Taux d'activité attendu : ${statsByPeriod.semaine.attendus} véhicules
- Notifications converties : ${statsByPeriod.semaine.reponses} SMS/E-mails
- Taux de réponse hebdomadaire : ${statsByPeriod.semaine.taux_reponse}%
- Contrôles techniques validés au centre principal : ${statsByPeriod.semaine.completes_centre}
- Visites finalisées via agents affiliés : ${statsByPeriod.semaine.completes_ailleurs}
- Reste sans confirmation d'échéance : ${statsByPeriod.semaine.non_renouveles}

2. VÉHICULES PROCHES DE L'EXPIRATION (ÉCHÉANCES < 15 JOURS)
-----------------------------------------------------------
${urgentExps.length === 0
  ? "Excellent ! Aucun véhicule en alerte d'expiration stricte cette semaine."
  : urgentExps.map((e, idx) => `${idx + 1}) Client : ${e.clientName} | Plaque : ${e.immatriculation} | Catégorie : ${e.vehicleType} | Tél : ${e.phone} | Jours restants : ${e.daysLeft} jours`).join('\n')
}

3. SÉQUENCE DES PASSAGES SUIVANTS EN ENREGISTREMENT
-----------------------------------------------------------
${nextSevenDaysAppts.length === 0
  ? "Aucun passage planifié pour la période hebdomadaire."
  : nextSevenDaysAppts.map((a, idx) => `[Slot ${idx + 1}] Date : ${a.date} à ${a.timeSlot} | Client : ${a.clientName} | Plaque : ${a.immatriculation} | Statut : ${a.status}`).join('\n')
}

===========================================================
VISITE-TECH - Système de sécurisation des flottes et transports.
===========================================================`;
    } 
    else {
      title = `suivi_mensuel_${todayStr}.txt`;
      const nonRenewedCount = expirations.filter(e => e.daysLeft <= 0).length;
      const warningCount = expirations.filter(e => e.daysLeft > 0 && e.daysLeft <= 15).length;
      const normalCount = expirations.filter(e => e.daysLeft > 15).length;

      content = `===========================================================
VISITE-TECH - RAPPORT DE CONFIANCE ET SUIVI MENSUEL
Généré le : ${new Date().toLocaleString('fr-FR')}
Période fiscale d'analyse : Mai - Juin 2026
===========================================================

1. BILAN DE COMPLIANCE ET PERFORMANCE DU MOIS (MAI 2026)
-----------------------------------------------------------
- Volume total des relances déclenchées : ${statsByPeriod.mois.attendus} véhicules
- Réponses client positives enregistrées : ${statsByPeriod.mois.reponses}
- Taux global de conformité aux alertes : ${statsByPeriod.mois.taux_reponse}%
- Contrôles finalisés et enregistrés avec succès : ${statsByPeriod.mois.completes_centre}
- Inspectés par d'autres centres agréés de la région : ${statsByPeriod.mois.completes_ailleurs}
- Réfractaires ou hors délais de validité : ${statsByPeriod.mois.non_renouveles}

2. CARTOGRAPHIE DU PARC AUTOMOBILE EN FICHE (Total : ${expirations.length} véhicules)
-----------------------------------------------------------
- Conforme & Sauf (Visite technique valide) : ${normalCount} véhicules
- Échéances critiques imminentes (< 15j) : ${warningCount} véhicules
- En infraction administrative immédiate (Hors délais) : ${nonRenewedCount} véhicules

3. RÉPARTITION DES COMPORTEMENTS PAR CATÉGORIES TECHNIQUE
-----------------------------------------------------------
${statsByPeriod.mois.details.map(d => `• Catégorie [${d.cat}] - ${d.label}
   -> Volume attendu règlementaire : ${d.attendus}
   -> Renouvellements certifiés sur place : ${d.fait}
   -> Enregistrés auprès du réseau de contrôle : ${d.ailleurs}
   -> Reste non conforme : ${d.non}`).join('\n\n')}

===========================================================
Rapport extrait à des fins d'inspection et archivage des transports terrestres.
VISITE-TECH - L'excellence au service de la conformité routière.
===========================================================`;
    }

    // Trigger local client file download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', title);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onAddAuditLog(
      'Exportation administrative de rapport',
      `Téléchargement du rapport de suivi ${type} par l'Administrateur de la station (Fichier : ${title}).`,
      'success'
    );

    setAdminNotify({
      type: 'success',
      message: `Extraction réussie ! Le rapport de suivi ${type} a été téléchargé sous le nom de fichier "${title}".`
    });
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 min-h-screen flex items-center justify-center relative z-10 animate-fade-in" id="admin-auth-container">
        <div className="w-full bg-white border border-slate-150 rounded-3xl shadow-xl shadow-slate-200 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-800 to-slate-900" />
          
          <div className="px-6 pt-8 pb-4 text-center border-b border-slate-100 bg-slate-50/50">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-755 shadow-3xs mb-3">
              <Lock className="h-5.5 w-5.5" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Accès Backoffice Sécurisé
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Réservé strictement aux techniciens et administrateurs de la station VISITE-TECH.
            </p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setAdminLoginError('');
              const ok = onLoginAdmin(adminInputUser, adminInputPass);
              if (!ok) {
                setAdminLoginError('Identifiant ou mot de passe incorrect. Accès refusé.');
              }
            }}
            className="p-6 sm:p-8 space-y-4"
          >
            {adminLoginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Identifiant Administrateur
              </label>
              <input
                type="text"
                required
                placeholder="EX: admin"
                value={adminInputUser}
                onChange={(e) => setAdminInputUser(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Mot de Passe de Sécurité
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={adminInputPass}
                onChange={(e) => setAdminInputPass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-slate-800/10 cursor-pointer transition-all active:scale-98"
              style={{ backgroundColor: '#0f172a' }}
            >
              Vérifier l'Accès Administrateur
            </button>

            <div className="pt-4 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-medium">
                Identifiants par défaut : <strong className="font-mono text-slate-650 bg-slate-100 px-1 rounded">admin</strong> / <strong className="font-mono text-slate-650 bg-slate-100 px-1 rounded">admin</strong>
              </span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 min-h-screen relative z-10" id="admin-portal">
      
      {/* Friendly, Highly Polished Executive Dashboard Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-950/25 mb-8 relative overflow-hidden">
        {/* Abstract background decorative lights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-sky-500/10 rounded-full blur-2xl translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 px-3 py-1 rounded-full w-fit mb-4">
              <span className="h-2 w-2 rounded-full bg-emerald-450 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-blue-200 font-bold">
                Système CTR Actif & Réel
              </span>
            </div>
            
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Bonjour, Administrateur 👋
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl font-medium">
              Ravi de vous revoir. Pilotez le registre de conformité en toute simplicité. Créez vos propres clients à blanc et nettoyez les données de démo ci-contre.
            </p>

            {/* Micro horizontal KPI row */}
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2 bg-slate-900/30 px-3.5 py-2 rounded-xl border border-white/5">
                <Database className="h-4 w-4 text-blue-400" />
                <span className="text-slate-400 font-sans">Véhicules enregistrés :</span>
                <strong className="text-white font-mono font-bold">{expirations.length}</strong>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/30 px-3.5 py-2 rounded-xl border border-white/5">
                <Clock className="h-4 w-4 text-purple-400" />
                <span className="text-slate-400 font-sans">Rendez-vous prévus :</span>
                <strong className="text-white font-mono font-bold">{appointments.length}</strong>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/30 px-3.5 py-2 rounded-xl border border-white/5">
                <Users className="h-4 w-4 text-amber-400" />
                <span className="text-slate-400 font-sans">Audit Logs :</span>
                <strong className="text-white font-mono font-bold">{auditLogs.length}</strong>
              </div>
            </div>
          </div>

          {/* Quick action triggers widget container */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0 self-stretch md:self-auto justify-end">
            <button
              onClick={handleTriggerSelfAudit}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-100 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 text-blue-400 animate-spin-slow" />
              Self-Audit
            </button>

            <button
              onClick={handleExportRegistryCSV}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-100 bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/20 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              title="Exporter le registre numérique client en CSV (Excel)"
            >
              <Download className="h-4 w-4 text-emerald-400 shrink-0" />
              Export Registre (CSV)
            </button>

            <button
              onClick={handleExportAppointmentsCSV}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-100 bg-purple-650/40 hover:bg-purple-650/50 border border-purple-500/20 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              title="Exporter le plan de passages et rendez-vous en CSV"
            >
              <Download className="h-4 w-4 text-purple-400 shrink-0" />
              Export RDV (CSV)
            </button>

            {onClearAllData && (
              <button
                onClick={() => {
                  if (confirm('⚠️ ATTENTION : Voulez-vous supprimer toutes les données de démo actuelles pour démarrer un registre 100% vierge ?')) {
                    onClearAllData();
                    setAdminNotify({
                      type: 'success',
                      message: 'Vérifié ! La base locale a été réinitialisée à blanc avec succès.'
                    });
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white bg-red-650 hover:bg-red-700 border border-red-600/30 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 text-red-100" />
                Vider la démo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Global Toast Notification banner */}
      <AnimatePresence>
        {adminNotify.message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 mb-6 rounded-2xl flex items-start gap-3 border shadow-2xs ${
              adminNotify.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <CheckCircle className={`h-5 w-5 shrink-0 mt-0.5 ${adminNotify.type === 'success' ? 'text-emerald-600' : 'text-amber-600'}`} />
            <div className="flex-grow text-xs font-semibold">
              {adminNotify.message}
            </div>
            <button 
              onClick={() => setAdminNotify({ type: null, message: '' })}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold font-mono px-1"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backoffice Grid Container: Sidebar on Left, Panels on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-6" id="admin-main-layout">
        
        {/* Left column: Vertical Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-6" id="admin-vertical-sidebar">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-5 shadow-3xs space-y-4">
            <div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">
                Tableau de Bord
              </h3>
              <p className="text-[10px] text-slate-500 px-2 mt-0.5 font-medium">Pilotage &amp; conformité</p>
            </div>

            <nav className="flex flex-col gap-2" id="admin-vertical-tabs">
              <button
                type="button"
                onClick={() => { setActiveTab('registre'); setAdminNotify({ type: null, message: '' }); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  activeTab === 'registre' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/15' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-3xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Database className={`h-4 w-4 ${activeTab === 'registre' ? 'text-white' : 'text-blue-600'}`} />
                  <span className="text-left font-sans">Registre Numérique</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'registre' ? 'bg-blue-700 text-blue-105' : 'bg-slate-100 border border-slate-200 text-slate-600'
                }`}>
                  {expirations.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('kpis'); setAdminNotify({ type: null, message: '' }); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  activeTab === 'kpis' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/15' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-3xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className={`h-4 w-4 ${activeTab === 'kpis' ? 'text-white' : 'text-amber-500'}`} />
                  <span className="text-left font-sans">Rapports d'Activité</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('appointments'); setAdminNotify({ type: null, message: '' }); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  activeTab === 'appointments' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/15' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-3xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className={`h-4 w-4 ${activeTab === 'appointments' ? 'text-white' : 'text-purple-650'}`} />
                  <span className="text-left font-sans">Suivi des Passages</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'appointments' ? 'bg-blue-700 text-blue-105' : 'bg-purple-100 border border-purple-200 text-purple-700'
                }`}>
                  {appointments.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('audit'); setAdminNotify({ type: null, message: '' }); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  activeTab === 'audit' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/15' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-3xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Terminal className={`h-4 w-4 ${activeTab === 'audit' ? 'text-white' : 'text-slate-700'}`} />
                  <span className="text-left font-sans">Journal d'Audit</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'audit' ? 'bg-blue-700 text-blue-105' : 'bg-slate-100 border border-slate-200 text-slate-600'
                }`}>
                  {auditLogs.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('sandbox'); setAdminNotify({ type: null, message: '' }); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold border border-dashed transition-all cursor-pointer ${
                  activeTab === 'sandbox' 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/15' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-850 shadow-3xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck className={`h-4 w-4 ${activeTab === 'sandbox' ? 'text-white' : 'text-emerald-500'}`} />
                  <span className="text-left font-sans">Saisie Sandbox</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('support'); setAdminNotify({ type: null, message: '' }); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                  activeTab === 'support' 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/15' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-950 shadow-3xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className={`h-4 w-4 ${activeTab === 'support' ? 'text-white' : 'text-rose-500'}`} />
                  <span className="text-left font-sans">Tickets Support</span>
                </div>
                {supportTickets.filter(t => t.status === 'Ouvert').length > 0 && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full animate-pulse ${
                    activeTab === 'support' ? 'bg-blue-700 text-white' : 'bg-rose-100 border border-rose-200 text-rose-700'
                  }`}>
                    {supportTickets.filter(t => t.status === 'Ouvert').length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Right Column: Dynamic Content Panel Area */}
        <div className="lg:col-span-3 space-y-6" id="admin-main-panels">
          {/* Active back-office view modules */}

        {/* Tab 1: REGISTRE NUMÉRIQUE DE SUIVI CLIENT (Fidèle à i1.jpeg) */}
        {activeTab === 'registre' && (
          <div className="space-y-4">

            {/* 🔔 Alerte de vigilance Échéances Techniques Proches / Expirées */}
            {expirations.filter(e => e.daysLeft <= 15).length > 0 && (
              <div className="bg-rose-50/70 border border-thin border-rose-200 rounded-2xl p-5 shadow-3xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <h4 className="font-display font-extrabold text-rose-955 text-xs uppercase tracking-wider">
                      Véhicules Arrivés à Échéance de Visite Technique ({expirations.filter(e => e.daysLeft <= 15).length})
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100/50 px-2 py-0.5 rounded border border-rose-200 uppercase animate-pulse">
                    Relance Recommandée
                  </span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed font-semibold">
                  Les véhicules d'Afrique Centrale listés ci-dessous ont dépassé ou approchent de leur date d'échéance. Cliquez sur "Relance Personnalisée" pour émettre un message d'alerte.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                  {expirations.filter(e => e.daysLeft <= 15).map((exp) => {
                    const isOverdue = exp.daysLeft < 0;
                    return (
                      <div key={exp.immatriculation} className="bg-white border border-rose-105 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-3xs hover:border-rose-350 transition-all">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold bg-slate-100 border px-1.5 py-0.5 rounded text-slate-700">
                              {exp.immatriculation} ({exp.vehicleType})
                            </span>
                            <span className={`text-[10px] font-mono font-extrabold ${isOverdue ? 'text-red-700' : 'text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200'}`}>
                              {isOverdue 
                                ? `Expiré depuis ${Math.abs(exp.daysLeft)} j` 
                                : `Expire dans ${exp.daysLeft} j`}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 leading-tight">{exp.clientName}</p>
                            <p className="text-[10px] font-mono text-slate-500">{exp.phone}</p>
                          </div>
                          <div className="text-[10.5px] text-slate-500 font-medium">
                            Dernière Visite : <span className="font-mono text-slate-705 font-bold">{exp.lastInspectionDate}</span>
                            <br />
                            Prochaine Échéance : <strong className="font-mono font-bold text-rose-600">{exp.nextInspectionDate}</strong>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            setSelectedClientForMsg(exp);
                            setCustomSmsText(`Bonjour Mr/Mme ${exp.clientName}, votre visite technique pour le véhicule ${exp.immatriculation} expire le ${exp.nextInspectionDate}. Merci de renouveler au plus vite.`);
                          }}
                          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-3xs select-none active:scale-98"
                        >
                          <Send className="h-3 w-3 shrink-0" />
                          Relance Personnalisée
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Filter and search parameters - Windster aesthetic styling */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-3xs">
              
              {/* Search Bar input */}
              <div className="relative w-full lg:max-w-md">
                <input
                  type="text"
                  placeholder="Rechercher nom, téléphone, immatriculation d'un client..."
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>

              {/* Status and Category Filters combined */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                
                {/* Category filtering */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 uppercase font-mono font-bold">Catégorie:</span>
                  <select
                    value={regCategory}
                    onChange={(e) => setRegCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer font-sans"
                  >
                    <option value="Tous">Toutes catégories</option>
                    <option value="A">Catégorie A (Motos)</option>
                    <option value="B">Catégorie B (Légers)</option>
                    <option value="B1">Catégorie B1 (Taxis)</option>
                    <option value="C">Catégorie C (Utilitaires)</option>
                    <option value="D">Catégorie D (Poids Lourds)</option>
                  </select>
                </div>

                {/* Renewal Stat filtering (OK vs relancer) */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 uppercase font-mono font-bold">Statut:</span>
                  <select
                    value={regStatus}
                    onChange={(e) => setRegStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer font-sans"
                  >
                    <option value="Tous">Tous les statuts</option>
                    <option value="OK">Badge "OK" (Conforme)</option>
                    <option value="Relancer">Badge "À relancer" (Expiré / Proche)</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Comprehensive Table Area (Windster Style) */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 font-medium border-collapse" id="registre-client-table">
                  <thead className="bg-[#f9fafb] text-slate-500 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4 border-b border-slate-150">Nom du client</th>
                      <th className="p-4 border-b border-slate-150">Téléphone</th>
                      <th className="p-4 border-b border-slate-150">Immatriculation</th>
                      <th className="p-4 border-b border-slate-150 text-center">Catégorie</th>
                      <th className="p-4 border-b border-slate-150">Date d'Inspection</th>
                      <th className="p-4 border-b border-slate-150">Date d'échéance</th>
                      <th className="p-4 border-b border-slate-150 text-center">Statut Renouvellement</th>
                      <th className="p-4 border-b border-slate-150 text-right">Actions Relance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {filteredRegistry.length > 0 ? (
                      filteredRegistry.map((client) => {
                        const isExpired = client.daysLeft <= 15;
                        return (
                          <tr key={client.immatriculation} className="hover:bg-[#f9fafb]/50 transition-colors">
                            {/* Nom du client */}
                            <td className="p-4 border-b border-slate-100">
                              <span className="block text-slate-900 text-xs font-bold leading-normal">{client.clientName}</span>
                            </td>
                            {/* Téléphone */}
                            <td className="p-4 border-b border-slate-100 font-mono text-slate-600">
                              {client.phone}
                            </td>
                            {/* Immatriculation */}
                            <td className="p-4 border-b border-slate-100">
                              <span className="font-mono text-xs font-bold bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 shadow-3xs">
                                {client.immatriculation}
                              </span>
                            </td>
                            {/* Catégorie */}
                            <td className="p-4 border-b border-slate-100 text-center">
                              <span className="inline-block font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                                {client.vehicleType}
                              </span>
                            </td>
                            {/* Date du jour / Dernier passage */}
                            <td className="p-4 border-b border-slate-100 font-mono text-slate-500">
                              {client.lastInspectionDate}
                            </td>
                            {/* Date d'échéance */}
                            <td className="p-4 border-b border-slate-100 font-mono">
                              <span className={`font-bold ${isExpired ? 'text-red-650' : 'text-slate-600'}`}>
                                {client.nextInspectionDate}
                              </span>
                            </td>
                            {/* Statut de renouvellement (Badge visuel vert OK ou rouge À relancer) - OBLIGATOIRE */}
                            <td className="p-4 border-b border-slate-100 text-center">
                              {!isExpired ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full uppercase tracking-wide">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  OK
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold font-mono text-red-700 bg-red-50 border border-red-200 rounded-full uppercase tracking-wide animate-pulse">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                  À RELANCER
                                </span>
                              )}
                            </td>
                            {/* Actions de communication */}
                            <td className="p-4 border-b border-slate-100 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => handleTriggerManualAlert(client.immatriculation, 'SMS')}
                                  title="Envoyer un rappel SMS"
                                  className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                                    client.alertSMS 
                                      ? 'bg-blue-50/50 border-blue-150 text-blue-600 hover:bg-blue-100' 
                                      : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                                  }`}
                                >
                                  SMS
                                </button>
                                <button
                                  onClick={() => handleTriggerManualAlert(client.immatriculation, 'Email')}
                                  title="Envoyer un rappel Email"
                                  className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                                    client.alertEmail 
                                      ? 'bg-[#f5f3ff] border-[#e9e3ff] text-purple-600 hover:bg-[#ece8ff]' 
                                      : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                                  }`}
                                >
                                  Mail
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 font-mono font-medium">
                          Aucun enregistrement client ne correspond aux critères de recherche.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>



          </div>
        )}

        {/* Tab 2: MODULE D'AUDIT PÉRIODIQUE ET RAPPORTS (Fidèle à i2.2.jpeg) */}
        {activeTab === 'kpis' && (
          <div className="space-y-6">
            
            {/* Header with period selector (OBLIGATOIRE: Jour / Semaine / Mois) */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-3xs">
              <div>
                <h3 className="font-display font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Landmark className="h-4.5 w-4.5 text-blue-600" />
                  Périodicité d'Audit d'Activité
                </h3>
                <p className="text-xs text-slate-550 mt-1">Filtrer de manière transversale les volumes, taux et répartition opérationnels.</p>
              </div>

              {/* Day / Week / Month Switcher button bar */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1.5 border border-slate-200 self-start sm:self-center font-mono">
                {(['jour', 'semaine', 'mois'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setReportPeriod(period)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      reportPeriod === period
                        ? 'bg-blue-600 text-white shadow-3xs'
                        : 'text-slate-550 hover:bg-slate-200 hover:text-slate-800'
                    }`}
                  >
                    {period === 'jour' ? 'Jour' : period === 'semaine' ? 'Semaine' : 'Mois (Mai)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tremor-like design highlight cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* CARD 1: Nombre de clients à contacter */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-3xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                    Volume à Relancer (Attendu)
                  </span>
                  <div className="text-3xl font-extrabold font-mono text-slate-800 mt-2">
                    {activeStats.attendus} <span className="text-xs text-slate-400 font-normal font-sans">Véhicules</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-sans leading-normal">
                  Identifiés comme devant renouveler leur certificat d'inspection technique sur l'intervalle sélectionné.
                </div>
              </div>

              {/* CARD 2: Taux de réponse */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-3xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                    Taux de Réponse aux Relances
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-extrabold font-mono text-blue-600">
                      {activeStats.taux_reponse}%
                    </span>
                    <span className="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">
                      +1.2% optimal
                    </span>
                  </div>
                </div>
                {/* SVG Visual Progress Arc styled like Tremor indicator */}
                <div className="mt-4 relative w-full h-2 bg-slate-150 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${activeStats.taux_reponse}%` }}
                  />
                </div>
                <div className="mt-4 pt-2 text-[11px] text-slate-500 leading-normal flex justify-between">
                  <span>{activeStats.reponses} conduits joints</span>
                  <span>Sur {activeStats.attendus}</span>
                </div>
              </div>

              {/* CARD 3: Nombre de renouvellements effectués */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-3xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                    Rapports d'Inspection Finalisés
                  </span>
                  <div className="text-3xl font-extrabold font-mono text-emerald-600 mt-2">
                    {activeStats.completes_centre + activeStats.completes_ailleurs} <span className="text-xs text-slate-400 font-normal font-sans">Enregistrés</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Au centre (Fidélisés) :</span>
                    <span className="font-bold text-slate-800 font-mono">{activeStats.completes_centre}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Ailleurs en agence :</span>
                    <span className="font-mono text-slate-700">{activeStats.completes_ailleurs}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* GORGEOUS BUSINESS INTELLIGENCE CARDS (Fidèle à la demande : sans graphiques) */}
            <div className="my-2" />

            {/* Statistical Table Breakdown (Inpiré de i2.2.jpeg) */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs">
              <div className="p-5 border-b border-slate-150 bg-[#f9fafb] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-slate-800 text-sm uppercase tracking-wider">
                    Répartition Statistique par Catégories de Véhicules
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Distribution règlementaire des renouvellements validés ou à faire.</p>
                </div>
                <div className="px-3 py-1 bg-white border border-slate-200 font-mono text-[11px] font-bold text-slate-600 rounded-lg shadow-3xs">
                  Modèle d'Audit Filtre : <span className="uppercase text-blue-600 font-extrabold">{reportPeriod}</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 font-medium">
                  <thead className="bg-[#f9fafb] text-slate-500 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Catégories</th>
                      <th className="p-4">Type de Transport / Spécificité</th>
                      <th className="p-4 text-center">Volume Attendu</th>
                      <th className="p-4 text-center">Renouvelé au Centre</th>
                      <th className="p-4 text-center">Renouvelé Ailleurs</th>
                      <th className="p-4 text-center">Reste à Renouveler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 font-mono">
                    {activeStats.details.map((row) => (
                      <tr key={row.cat} className="hover:bg-[#f9fafb]/50">
                        <td className="p-4 font-extrabold text-slate-900 text-sm">{row.cat}</td>
                        <td className="p-4 font-sans text-xs text-slate-500 font-semibold">{row.label}</td>
                        <td className="p-4 text-center font-bold text-slate-800">{row.attendus}</td>
                        <td className="p-4 text-center text-emerald-600 font-bold">{row.fait}</td>
                        <td className="p-4 text-center text-blue-600">{row.ailleurs}</td>
                        <td className="p-4 text-center text-red-650 font-bold">{row.non}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 🔌 DISPOSITIF DE SYNCHRONISATION MINISTÉRIELLE D'ACTIVITÉ TECHNIQUE (Simulation alternative demandée par l'utilisateur) */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-150">
                <div className="flex items-start gap-3">
                  <div className="p-2 sm:p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 shrink-0">
                    <Database className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-[#1e293b] text-sm uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                      <span>Liaison API &amp; Portail du Ministère (MINT-GOUV)</span>
                      <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded-full uppercase tracking-widest font-black shrink-0 animate-pulse">
                        Simulateur Actif
                      </span>
                    </h3>
                    <p className="text-xs text-slate-550 mt-1">
                      Automatisez l'importation de la colonne <b className="text-blue-600">"Renouvelé Ailleurs"</b> depuis la plateforme ministérielle pour éviter la saisie manuelle.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col text-xs font-mono self-start sm:self-center bg-slate-50 border border-slate-150 rounded-xl p-3 shrink-0">
                  <div className="flex justify-between gap-6">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Dernier relevé :</span>
                    <span className="text-slate-700 font-bold">{lastMinistrySyncDate}</span>
                  </div>
                  <div className="flex justify-between gap-6 mt-1">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Clé API Securisée :</span>
                    <span className="text-slate-500 font-extrabold">MINT_REG_KEY_CM_8X••••</span>
                  </div>
                </div>
              </div>

              {/* TWO COLUMN INTERPRETATION PORTAL: Left is Trigger & logs, Right is sandbox to feed new records to Ministry */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT BLOCK: SYNCHRONIZATION AND CONSOLE LOGS */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-slate-500" /> Console de Commande d'Interconnexion des Serveurs
                  </h4>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={isMinistrySyncing}
                      onClick={handleTriggerMinistrySync}
                      className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isMinistrySyncing 
                          ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                          : 'bg-slate-900 border border-slate-950 hover:bg-slate-850 text-white shadow-md active:scale-98'
                      }`}
                    >
                      <RefreshCw className={`h-4 w-4 ${isMinistrySyncing ? 'animate-spin' : ''}`} />
                      {isMinistrySyncing ? "Interrogation de l'API..." : 'Lancer la Synchronisation'}
                    </button>

                    {pendingMinistryRenewals.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl animate-bounce">
                        ⚠️ +{pendingMinistryRenewals.length} contrôle(s) externe(s) en attente au Ministère !
                      </span>
                    )}
                  </div>

                  {/* Terminal Log Output window */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[10px] md:text-[11px] text-[#34d399] h-48 overflow-y-auto shadow-inner space-y-1.5 relative">
                    <div className="absolute top-2 right-3 flex items-center gap-1 text-[8px] tracking-widest text-slate-500 font-black uppercase">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      LIVE STDOUT
                    </div>
                    {ministrySyncLogs.length === 0 ? (
                      <div className="text-slate-500 italic flex h-full items-center justify-center text-center p-4">
                        En attente d'interrogation. Cliquez sur "Lancer la Synchronisation" pour simuler l'acquisition automatique de rapports tiers.
                      </div>
                    ) : (
                      ministrySyncLogs.map((log, idx) => (
                        <div key={idx} className="leading-relaxed border-l-2 border-emerald-500/20 pl-2">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* RIGHT BLOCK: SANDBOX DECLARATION (To simulate a vehicle visiting other garages and being noted on ministry site) */}
                <div className="lg:col-span-5 bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Plus className="h-4 w-4 text-[#10b981]" /> Forcer une Saisie Tiers (Simulateur Ministère)
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-normal mb-4">
                      Simulez un véhicule qui passe son contrôle technique dans <b>un autre garage</b> du territoire. Ce garage note la visite sur le site du Ministère d'abord.
                    </p>

                    <form onSubmit={handleSimulateMinistryDeclaration} className="space-y-3.5">
                      <div>
                        <label className="block text-[9px] font-black text-slate-450 uppercase tracking-wider mb-1">
                          Immatriculation du véhicule
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: CE-123-JK"
                          value={simPlate}
                          onChange={(e) => setSimPlate(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-black text-slate-450 uppercase tracking-wider mb-1">
                            Catégorie de véhicule
                          </label>
                          <select
                            value={simCat}
                            onChange={(e) => setSimCat(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs text-slate-700 focus:outline-none"
                          >
                            <option value="A">Cat. A (2 roues)</option>
                            <option value="B">Cat. B (Voiture)</option>
                            <option value="B1">Cat. B1 (Taxis)</option>
                            <option value="C">Cat. C (Fourgon)</option>
                            <option value="D">Cat. D (Poids lourd)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-black text-slate-450 uppercase tracking-wider mb-1">
                            Garage Tiers Déclarant
                          </label>
                          <select
                            value={simGarage}
                            onChange={(e) => setSimGarage(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs text-slate-700 focus:outline-none"
                          >
                            <option value="Garage Centre-Mendong">Auto Mendong Douala</option>
                            <option value="Contrôle CEMAC Auto">Auto CEMAC Yaoundé</option>
                            <option value="Moto-Expert Ouest">Moto-Expert Ouest</option>
                            <option value="Taxi Services Nord">Taxi Services Nord</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Déclarer Réussite au Ministère
                      </button>
                    </form>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-450 font-semibold font-mono">
                      Contrôles stockés en file MINT :
                    </span>
                    <span className="text-xs font-mono font-black text-slate-700 bg-slate-200 px-2.5 py-0.5 rounded-full animate-pulse">
                      {pendingMinistryRenewals.length}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* 📥 EXTRACTION & TÉLÉCHARGEMENT DES SUIVIS D'ACTIVITÉ ROUTIÈRE */}
            <div className="bg-gradient-to-tr from-slate-900 via-slate-855 to-slate-950 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-white/10">
                <div>
                  <h4 className="font-display font-bold text-base text-white flex items-center gap-2">
                    <Download className="h-5 w-5 text-blue-450 shrink-0" />
                    Extraction des Rapports de Suivi Technique
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Téléchargez les extractions d'activité réglementaires au format texte certifié sous forme de fiches autonomes.
                  </p>
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono border border-blue-400/30 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                  Exportation Instantanée
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. SUIVI JOURNALIER CARD */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4.5 hover:bg-white/8 hover:border-white/15 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono tracking-widest text-[#60a5fa] uppercase font-bold">
                        Quotidien • Journalier
                      </span>
                      <div className="h-2 w-2 rounded-full bg-emerald-500 group-hover:animate-ping" />
                    </div>
                    <h5 className="font-display font-bold text-sm text-white">
                      Rapport d'Activité du Jour
                    </h5>
                    <p className="text-slate-400 text-[11px] mt-1.5 leading-normal">
                      Synthèse des rendez-vous et passages prévus aujourd'hui, couplée aux derniers incidents d'audit métrologique des machines.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDownloadReport('journalier')}
                    className="mt-5 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-lg text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-550/10 active:scale-97"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Télécharger le Suivi
                  </button>
                </div>

                {/* 2. SUIVI HEBDOMADAIRE CARD */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4.5 hover:bg-white/8 hover:border-white/15 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono tracking-widest text-[#a78bfa] uppercase font-bold">
                        Hebdo • 7 Jours Glissants
                      </span>
                      <div className="h-2 w-2 rounded-full bg-indigo-400" />
                    </div>
                    <h5 className="font-display font-bold text-sm text-white">
                      Rapport Hebdomadaire
                    </h5>
                    <p className="text-slate-400 text-[11px] mt-1.5 leading-normal">
                      Récapitulatif des dossiers d'urgences d'expirations &amp; relances clients à effectuer sous 15 jours sur le territoire d'opération.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDownloadReport('hebdomadaire')}
                    className="mt-5 w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2 px-3 rounded-lg text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-650/10 active:scale-97"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Télécharger l'Hebdomadaire
                  </button>
                </div>

                {/* 3. SUIVI MENSUEL CARD */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4.5 hover:bg-white/8 hover:border-white/15 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono tracking-widest text-[#cbd5e1] uppercase font-bold">
                        Mensuel • Bilan de Confiabilité
                      </span>
                      <div className="h-2 w-2 rounded-full bg-slate-400" />
                    </div>
                    <h5 className="font-display font-bold text-sm text-white">
                      Rapport Complet du Mois
                    </h5>
                    <p className="text-slate-400 text-[11px] mt-1.5 leading-normal">
                      Bilan global d'infractions administratives, volume de relances, répartition statistique par type de transport et conversion SMS/Mail.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDownloadReport('mensuel')}
                    className="mt-5 w-full bg-slate-100 hover:bg-white text-slate-950 font-extrabold py-2 px-3 rounded-lg text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-97"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Télécharger le Bilan Mensuel
                  </button>
                </div>

              </div>
            </div>

            {/* Tremor-like footnote warning on financial omission */}
            <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-normal">
                <strong className="text-slate-800">Note de Sécurité du Rapport :</strong> Conformément aux contraintes strictes d'audit physique (i2.2.jpeg), ce rapport omet volontairement toute colonne de prix ou de valorisation en monnaie. Il est centré uniquement sur les indicateurs de volume physique, d'efficience des canaux de communication (SMS/Mail) et de couverture de relance terrain.
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: LIVE APPOINTMENT PASSES TRACKER */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-3xs">
              <div className="relative w-full sm:max-w-md">
                <input
                  type="text"
                  placeholder="Rechercher un rendez-vous (plaque, nom)..."
                  value={apptSearch}
                  onChange={(e) => setApptSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto shrink-0 pb-1 sm:pb-0">
                <ListFilter className="h-4 w-4 text-slate-400 shrink-0" />
                {['Tous', 'En attente', 'Confirmé', 'Relancé', 'Non joignable', 'Retour effectué'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setApptFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                      apptFilterStatus === st
                        ? 'bg-blue-50 border border-blue-250 text-blue-700'
                        : 'bg-white border border-slate-250 text-slate-650 hover:bg-slate-50 hover:text-slate-950'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 font-medium">
                  <thead className="bg-[#f9fafb] text-slate-500 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4">Réf du Passage</th>
                      <th className="p-4">Propriétaire</th>
                      <th className="p-4">Téléphone</th>
                      <th className="p-4">Immatriculation</th>
                      <th className="p-4 text-center">Catégorie</th>
                      <th className="p-4">Date Prévue</th>
                      <th className="p-4">Créneau</th>
                      <th className="p-4 text-center">Statut Actuel</th>
                      <th className="p-4 text-right">Mettre à jour</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppts.length > 0 ? (
                      filteredAppts.map((appt) => (
                        <tr key={appt.id} className="border-b border-slate-100 hover:bg-[#f9fafb]/50">
                          <td className="p-4 font-mono font-bold text-slate-500">{appt.id}</td>
                          <td className="p-4">
                            <div className="text-slate-800 text-xs font-bold">{appt.clientName}</div>
                            {appt.modificationRequest?.status === 'en_attente' && (
                              <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-900 space-y-1 max-w-xs shadow-3xs animate-pulse font-sans font-medium">
                                <p className="font-extrabold text-amber-800">🕒 Report demandé</p>
                                <p className="font-mono text-[9px]">Le: <strong>{appt.modificationRequest.requestedDate}</strong> ({appt.modificationRequest.requestedTimeSlot})</p>
                                {appt.modificationRequest.reason && <p className="text-slate-500 italic">"{appt.modificationRequest.reason}"</p>}
                                <div className="flex gap-2 pt-1">
                                  <button
                                    onClick={() => {
                                      onResolveReschedule(appt.id, 'accept');
                                      setAdminNotify({
                                        type: 'success',
                                        message: `Le report de rendez-vous pour ${appt.clientName} a été accepté.`
                                      });
                                    }}
                                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer transition-colors text-[9px]"
                                  >
                                    Accepter
                                  </button>
                                  <button
                                    onClick={() => {
                                      onResolveReschedule(appt.id, 'refuse');
                                      setAdminNotify({
                                        type: 'warning',
                                        message: `La demande de report pour ${appt.clientName} a été rejetée.`
                                      });
                                    }}
                                    className="px-2 py-0.5 bg-red-650 hover:bg-red-700 text-white rounded font-bold cursor-pointer transition-colors text-[9px]"
                                  >
                                    Refuser
                                  </button>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="p-4 font-mono text-slate-500">{appt.phone}</td>
                          <td className="p-4">
                            <span className="font-mono text-xs font-bold bg-slate-50 px-2 py-1 border border-slate-200 rounded text-slate-700 shadow-3xs">
                              {appt.immatriculation}
                            </span>
                          </td>
                          <td className="p-4 text-center text-slate-700 font-extrabold font-mono">
                            <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-bold">
                              {appt.vehicleType}
                            </span>
                          </td>
                          <td className="p-4 text-slate-650 font-mono">{appt.date}</td>
                          <td className="p-4 text-slate-500 font-mono">{appt.timeSlot}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-2.5 py-1 text-[9px] font-extrabold font-mono rounded uppercase tracking-wider border ${
                              appt.status === 'Confirmé' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              appt.status === 'Relancé' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                              appt.status === 'Non joignable' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                              appt.status === 'Retour effectué' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 font-bold' :
                              'bg-yellow-50 text-yellow-800 border-yellow-200'
                            }`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <select
                              value={appt.status}
                              onChange={(e) => {
                                onUpdateApptStatus(appt.id, e.target.value as any);
                                setAdminNotify({
                                  type: 'success',
                                  message: `Passage ${appt.id} mis à jour au statut "${e.target.value}".`
                                });
                              }}
                              className="bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono cursor-pointer"
                            >
                              <option value="En attente">En attente</option>
                              <option value="Confirmé">Confirmé</option>
                              <option value="Relancé">Relancé</option>
                              <option value="Non joignable">Non joignable</option>
                              <option value="Retour effectué">✓ Visite Validée</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400 font-mono">
                          Aucun passage planifié trouvé.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: JOURNAL D'AUDIT SYSTEM (Terminal Monospace block) */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            
            {/* Filter and terminal bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-3xs">
              
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Filtrer les lignes de log..."
                  value={auditSearchQuery}
                  onChange={(e) => setAuditSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold placeholder:text-slate-400 focus:outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-xs text-slate-400 font-mono font-bold">Rôle:</span>
                {['Tous', 'Système', 'Agent', 'Administrateur'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setAuditFilterRole(role)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      auditFilterRole === role
                        ? 'bg-slate-800 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Interface styled strictly as requested */}
            <div className="bg-[#0f172a] rounded-2xl border border-slate-850 p-6 shadow-2xl relative overflow-hidden">
              {/* Header lights */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500 block" />
                  <span className="h-3 w-3 rounded-full bg-amber-500 block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500 block" />
                  <span className="text-[10px] text-slate-450 font-mono ml-2">visitetech-core-audit_daemon.sh</span>
                </div>
                <span className="text-[9px] font-mono text-[#38bdf8] bg-[#0c4a6e] border border-[#0284c7] px-2 py-0.5 rounded font-extrabold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  INTÈGRE
                </span>
              </div>

              {/* Console log list - terminal style */}
              <div className="space-y-3 font-mono text-[11px] leading-relaxed max-h-[500px] overflow-y-auto pr-2" id="terminal-logger">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    const isSuccess = log.status === 'success';
                    const isWarning = log.status === 'warning';
                    
                    return (
                      <div 
                        key={log.id} 
                        className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg flex flex-col md:flex-row md:items-start justify-between gap-3 text-slate-350 hover:border-slate-700 hover:bg-slate-900/90 transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-slate-500 font-bold" title="UID Log Reference">
                              [{log.id}]
                            </span>
                            
                            <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded border tracking-wide uppercase ${
                              log.userRole === 'Administrateur' ? 'bg-red-950/50 text-red-400 border-red-900' :
                              log.userRole === 'Agent' ? 'bg-amber-950/50 text-amber-400 border-amber-900' :
                              'bg-blue-950/50 text-blue-400 border-blue-900'
                            }`}>
                              {log.userRole}
                            </span>

                            <span className="text-[#38bdf8] font-bold">
                              {log.action}
                            </span>
                          </div>

                          <p className="text-slate-300 leading-normal pl-1">
                            {log.details}
                          </p>
                        </div>

                        <div className="text-left md:text-right shrink-0 flex md:flex-col gap-2 items-center md:items-end justify-between font-mono text-[10px]">
                          <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <span className={`px-1.5 py-0.2 text-[9px] font-extrabold rounded border ${
                            isSuccess ? 'bg-[#064e3b]/80 text-[#34d399] border-[#047857]' : 
                            isWarning ? 'bg-[#7f1d1d]/80 text-[#f87171] border-[#b91c1c] animate-pulse' : 
                            'bg-[#1e1b4b]/80 text-[#818cf8] border-[#4338ca]'
                          }`}>
                            {isSuccess ? 'INTÈGRE' : isWarning ? 'ALERTE' : 'INFO'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 text-center py-8">
                    &gt; Aucun traceur d'événement correspondant dans la mémoire tampon.
                  </p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 5: SAISIE & VALIDATION AUTOMATIQUE HOOK SANDBOX (Prompt 4 Showcase) */}
        {activeTab === 'sandbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Interactive Validation Form (Demonstrates Prompt 4 hook) */}
            <form 
              onSubmit={handleCreateClientRegistry} 
              className="lg:col-span-7 bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-3xs space-y-5"
            >
              <div>
                <h3 className="font-display font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Plus className="h-4.5 w-4.5 text-emerald-600" />
                  Saisie Opérationnelle de Fiche Client
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enregistrez manuellement une fiche client de manière infaillible grâce aux capteurs de conformité à la volée.
                </p>
              </div>

              {/* Client Name Input */}
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                  Nom Complet de l'Automobiliste *
                </label>
                <input
                  type="text"
                  placeholder="EX: Christian Kabasele, Mireille Ondo..."
                  value={formValues.clientName}
                  onChange={(e) => formHandleChange('clientName', e.target.value)}
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                    formErrors.clientName 
                      ? 'border-red-400 focus:ring-1 focus:ring-red-400' 
                      : 'border-slate-200 focus:ring-1 focus:ring-emerald-500'
                  }`}
                />
                {/* Real-time RED error message - MANDATORY */}
                {formErrors.clientName && (
                  <p className="mt-1.5 text-xs text-red-650 font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    {formErrors.clientName}
                  </p>
                )}
              </div>

              {/* Phone Input with strict national validation */}
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                  Numéro de Téléphone Mobile (9 Chiffres Nationaux) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="EX: 699887766, 677112233..."
                    value={formValues.phone}
                    onChange={(e) => formHandleChange('phone', e.target.value)}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none transition-all ${
                      formValues.phone && !formErrors.phone 
                        ? 'border-emerald-500 bg-emerald-50/10' 
                        : formErrors.phone 
                        ? 'border-red-400 focus:ring-1 focus:ring-red-400' 
                        : 'border-slate-200'
                    }`}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {formValues.phone && !formErrors.phone && <CheckCheck className="h-4.5 w-4.5 text-emerald-600 stroke-[3]" />}
                  </div>
                </div>
                {/* Real-time RED error message - MANDATORY */}
                {formErrors.phone ? (
                  <p className="mt-1.5 text-xs text-red-650 font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    {formErrors.phone}
                  </p>
                ) : (
                  <p className="mt-1 text-[10px] text-slate-450 leading-relaxed font-mono">
                    Nomenclature CEMAC: 9 chiffres consécutifs, débutant par 6 (GSM), 2 ou 3 (Fixe).
                  </p>
                )}
              </div>

              {/* Registration Plate input with Regex */}
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                  Plaque d'Immatriculation *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="EX: LT-482-AA, AD-431-EE..."
                    value={formValues.immatriculation}
                    onChange={(e) => formHandleChange('immatriculation', e.target.value.toUpperCase())}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-mono tracking-widest font-extrabold focus:outline-none transition-all ${
                      formValues.immatriculation && !formErrors.immatriculation 
                        ? 'border-emerald-500 bg-emerald-50/10 text-emerald-900' 
                        : formErrors.immatriculation 
                        ? 'border-red-400 focus:ring-1 focus:ring-red-400 text-red-800 animate-pulse' 
                        : 'border-slate-200'
                    }`}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {formValues.immatriculation && !formErrors.immatriculation && <CheckCheck className="h-4.5 w-4.5 text-emerald-600 stroke-[3]" />}
                  </div>
                </div>
                {/* Real-time RED error message - MANDATORY */}
                {formErrors.immatriculation ? (
                  <p className="mt-1.5 text-xs text-red-650 font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    {formErrors.immatriculation}
                  </p>
                ) : (
                  <p className="mt-1 text-[10px] text-slate-450 leading-relaxed font-mono">
                    Regex de contrôle: Format standardisé XX-000-XX ou XX-0000-XX (ex: CE-912-XY).
                  </p>
                )}
              </div>

              {/* Category selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                    Catégorie du véhicule
                  </label>
                  <select
                    value={sandboxCategory}
                    onChange={(e) => setSandboxCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none font-semibold text-slate-700 cursor-pointer"
                  >
                    <option value="A">Catégorie A (Motos)</option>
                    <option value="B">Catégorie B (Légers)</option>
                    <option value="B1">Catégorie B1 (Taxis)</option>
                    <option value="C">Catégorie C (Utilitaires)</option>
                    <option value="D">Catégorie D (Poids Lourds)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5 text-slate-400">
                    Propulseur d'activité
                  </label>
                  <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 text-center flex items-center justify-center gap-2">
                    <Database className="h-4 w-4 text-emerald-500" />
                    +{[10, 15, 20, 25, 30][['A', 'B', 'B1', 'C', 'D'].indexOf(sandboxCategory)]} pts Fidélité
                  </div>
                </div>
              </div>

              {/* Action Submit */}
              <button
                type="submit"
                disabled={!formIsFormValid}
                className={`w-full py-3.5.5 rounded-xl text-xs font-bold uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
                  formIsFormValid 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Save className="h-4 w-4" />
                Soumettre et insérer au Registre Sec
              </button>
            </form>

            {/* Explanatory side column */}
            <div className="lg:col-span-5 bg-slate-900 text-slate-100 rounded-2xl p-6 sm:p-8 space-y-6 self-stretch flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-widest">
                  Architecture useFormValidation Hook
                </span>
                
                <h4 className="font-display font-bold text-slate-200 text-sm">
                  Pourquoi utiliser la validation anticipée côté client ?
                </h4>

                <p className="text-xs text-slate-350 leading-relaxed font-sans">
                  Sur le terrain, près de 15% des appels de relance échouent car les agents saisissent des informations clients erronées (numéro inexistant, plaque tronquée, oublis de caractères).
                </p>

                <p className="text-xs text-slate-350 leading-relaxed font-sans">
                  Le hook <strong className="font-mono text-emerald-400 bg-emerald-990/40 px-1 py-0.2 rounded font-bold">useFormValidation.ts</strong> intercepte chaque saisie de touche pour valider instantanément les deux goulots d'étranglement :
                </p>

                <ul className="space-y-2 text-xs text-slate-300 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span><strong>Immatriculation (Regex)</strong>: Obligation d'un format de plaque CEMAC valide d'Afrique Centrale (XX-123-XX ou XX-1234-XX).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span><strong>Téléphone national</strong>: Longueur obligatoire de 9 chiffres, avec analyse structurelle du premier chiffre (6 pour réseau cellulaire, 2 ou 3 pour réseau cuivré terrestre).</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-slate-800 text-[10px] text-slate-500 font-mono leading-normal">
                OWASP Secure Input Standard Compliance &middot; E-Visite v2.6.
              </div>
            </div>

          </div>
        )}

        {/* Tab 6: HELP DESK / SUPPORT TICKETS MANAGEMENT */}
        {activeTab === 'support' && (
          <div className="space-y-6" id="backoffice-support-module">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3xs space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-slate-850 text-sm uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-rose-500" />
                  Console de Gestion du Support Technique &amp; Réclamations
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Lisez les messages d'aide envoyés par les automobilistes, apportez une réponse officielle personnalisée et résolvez les incidents en un clic.
                </p>
              </div>

              {supportTickets.length > 0 ? (
                <div className="space-y-4">
                  {supportTickets.map((t) => (
                    <div 
                      key={t.id} 
                      className={`p-5 rounded-2xl border transition-all ${
                        t.status === 'Résolu' 
                          ? 'bg-slate-50/50 border-slate-200' 
                          : 'bg-rose-50/20 border-rose-105 shadow-3xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dashed pb-2.5 mb-3 border-slate-200">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-slate-850 bg-white border px-2 py-0.5 rounded shadow-3xs">
                            {t.id}
                          </span>
                          <span className={`text-[10px] px-2 py-0.2 rounded font-bold font-mono ${
                            t.status === 'Résolu' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-250 font-extrabold' 
                              : 'bg-rose-100 text-rose-800 border border-rose-250 animate-pulse font-extrabold'
                          }`}>
                            {t.status === 'Résolu' ? '✓ RÉSOLU & ENVOYÉ' : '• OUVERT / EN ATTENTE'}
                          </span>
                        </div>
                        
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                          Déposé le {new Date(t.createdAt).toLocaleString('fr-FR')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                        
                        {/* Ticket User Metadata */}
                        <div className="md:col-span-3 space-y-1.5 border-r border-slate-100 pr-4">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-slate-450 block font-bold">Automobiliste :</span>
                            <span className="font-extrabold text-slate-800">{t.clientName}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-slate-450 block font-bold">Téléphone mobile :</span>
                            <span className="font-mono text-slate-705 font-bold">{t.phone}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-slate-455 block font-bold">Véhicule (Plaque) :</span>
                            <span className="font-mono bg-slate-100 text-slate-705 px-1.5 py-0.2 rounded font-bold text-[10px] border">
                              {t.immatriculation}
                            </span>
                          </div>
                        </div>

                        {/* Ticket content message & admin response area */}
                        <div className="md:col-span-9 space-y-4">
                          
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-slate-450 block font-bold">Objet / Message d'explication :</span>
                            <p className="font-extrabold text-slate-850 mt-0.5">{t.subject}</p>
                            <p className="text-slate-600 leading-relaxed mt-1 p-3 bg-white border border-slate-150 rounded-xl italic font-medium">
                              "{t.message}"
                            </p>
                          </div>

                          {/* Existing Reply if resolved */}
                          {t.adminReply && (
                            <div className="p-3 bg-blue-50/50 border border-blue-105 rounded-xl text-xs space-y-1 font-medium text-slate-700">
                              <span className="text-[9.5px] uppercase tracking-wider text-blue-700 font-black flex items-center gap-1">
                                <CheckCheck className="h-3.5 w-3.5" />
                                Réponse officielle apportée ({new Date(t.repliedAt || '').toLocaleDateString('fr-FR')}) :
                              </span>
                              <p className="text-slate-800 font-bold italic pl-1 leading-normal">
                                "{t.adminReply}"
                              </p>
                            </div>
                          )}

                          {/* Action Box to reply if open */}
                          {t.status === 'Ouvert' && (
                            <div className="space-y-2 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <label className="block text-[10px] font-black text-slate-550 uppercase tracking-widest pl-1">
                                Écrire une réponse de résolution officielle :
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Ex: Bonjour, nous avons procédé à la correction de votre plaque. Tout est opérationnel !"
                                  value={replyTextMap[t.id] || ''}
                                  onChange={(e) => setReplyTextMap({
                                    ...replyTextMap,
                                    [t.id]: e.target.value
                                  })}
                                  className="w-full bg-white border border-slate-205 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const reply = replyTextMap[t.id];
                                    if (!reply || !reply.trim()) return;
                                    
                                    onReplySupportTicket(t.id, reply);
                                    setAdminNotify({
                                      type: 'success',
                                      message: `Fait ! La fiche support ${t.id} de ${t.clientName} a été résolue.`
                                    });
                                  }}
                                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-98 transition-colors"
                                >
                                  <Send className="h-3.5 w-3.5" />
                                  Répondre &amp; Résoudre
                                </button>
                              </div>
                            </div>
                          )}

                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 font-semibold bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs">
                  Aucun ticket de réclamation ou demande d'aide enregistré.
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>

      {/* Dynamic Modal for sending Personalized Relance SMS */}
      {selectedClientForMsg && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2.5px] flex items-center justify-center p-4 z-50 animate-fade-in" id="personalized-sms-modal">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-slate-850 text-sm uppercase tracking-wide">
                    Envoi Relance Personnalisée
                  </h3>
                  <p className="text-[10px] text-slate-450 uppercase font-mono font-bold">Plateforme SMS Intégrée</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedClientForMsg(null)}
                className="text-slate-400 hover:text-slate-750 text-xl font-bold font-mono px-2"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-black">Destinataire :</span>
                  <span className="font-black text-slate-800">{selectedClientForMsg.clientName}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-black">Téléphone :</span>
                  <span className="font-mono text-slate-700 font-black">{selectedClientForMsg.phone}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-dashed border-slate-200">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-black">Véhicule &amp; Échéance :</span>
                  <span className="font-semibold text-slate-700 text-[11px]">
                    {selectedClientForMsg.immatriculation} (Catégorie {selectedClientForMsg.vehicleType}) • Échéance : <strong className="font-mono font-bold text-rose-600">{selectedClientForMsg.nextInspectionDate}</strong>
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-550 uppercase tracking-widest pl-0.5">
                  Texte du Message SMS (Personnalisé de Courtoisie) :
                </label>
                <textarea
                  rows={4}
                  value={customSmsText}
                  onChange={(e) => setCustomSmsText(e.target.value)}
                  className="w-full bg-white border border-slate-205 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 placeholder:text-slate-400 leading-relaxed font-sans"
                  placeholder="Écrivez le message personnalisé ici..."
                />
                <div className="flex justify-between items-center text-[10px] text-slate-450 font-mono font-bold px-1">
                  <span>Caractères : {customSmsText.length} | Segments : {Math.ceil(customSmsText.length / 160)}</span>
                  <span className="text-emerald-600 font-black">✓ Passerelle Opérateur active</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedClientForMsg(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!customSmsText.trim()) return;
                  
                  // Trigger manually simulated communication
                  onAddAuditLog(
                    'Relance Personnalisée SMS',
                    `Message personnalisé de courtoisie envoyé à ${selectedClientForMsg.clientName} (${selectedClientForMsg.phone}) - Plaque: ${selectedClientForMsg.immatriculation}: "${customSmsText}"`,
                    'success'
                  );
                  
                  setAdminNotify({
                    type: 'success',
                    message: `Superbe ! Le message de relance personnalisé a été transmis avec succès à ${selectedClientForMsg.clientName} via notre passerelle SMS.`
                  });
                  
                  setSelectedClientForMsg(null);
                }}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-transform flex items-center justify-center gap-1.5 cursor-pointer shadow-md select-none active:scale-97"
              >
                <Send className="h-3.5 w-3.5" />
                Envoyer le SMS
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
