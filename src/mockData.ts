/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RendezVous, AuditLog, ExpirationInfo, LoyaltyAccount } from './types';

// Liste de plaques d'immatriculation d'exemple pour démo rapide (initialement vide ou minimale)
export const SAMPLE_PLATES: string[] = [];

export const INITIAL_RENDEZ_VOUS: RendezVous[] = [
  {
    id: 'RDV-166',
    clientName: 'Jean-Marc Ndzana',
    phone: '69898989',
    immatriculation: 'LT-109-AF',
    vehicleType: 'B',
    date: '2026-06-03',
    timeSlot: '08:00 - 09:00',
    status: 'Confirmé',
    pointsEarned: 20,
    createdAt: '2026-06-01T08:00:00Z'
  },
  {
    id: 'RDV-545',
    clientName: 'Jean-Marc Ndzana',
    phone: '69898989',
    immatriculation: 'LT-109-AF',
    vehicleType: 'B',
    date: '2026-06-08',
    timeSlot: '10:00 - 11:00',
    status: 'Confirmé',
    pointsEarned: 20,
    createdAt: '2026-06-05T09:15:00Z'
  },
  {
    id: 'RDV-711',
    clientName: 'Afrique Trans-Saga',
    phone: '233445566',
    immatriculation: 'OU-904-BK',
    vehicleType: 'B',
    date: '2026-06-05',
    timeSlot: '09:00 - 10:00',
    status: 'Confirmé',
    pointsEarned: 20,
    createdAt: '2026-06-01T14:30:00Z'
  },
  {
    id: 'RDV-250',
    clientName: 'Sylvestre Tchatchouang',
    phone: '657121471',
    immatriculation: 'LT-554-CH',
    vehicleType: 'B',
    date: '2026-06-09',
    timeSlot: '09:00 - 10:00',
    status: 'Confirmé',
    pointsEarned: 20,
    createdAt: '2026-06-06T10:00:00Z'
  },
  {
    id: 'RDV-925',
    clientName: 'Afrique Trans-Saga',
    phone: '233445566',
    immatriculation: 'OU-904-BK',
    vehicleType: 'D',
    date: '2026-06-25',
    timeSlot: '08:00 - 09:00',
    status: 'Confirmé',
    pointsEarned: 40,
    createdAt: '2026-06-04T11:20:00Z'
  },
  {
    id: 'RDV-001',
    clientName: 'Michel Tchoffo',
    phone: '699887766',
    immatriculation: 'LT-827-DK',
    vehicleType: 'B',
    date: '2026-06-08',
    timeSlot: '09:00 - 10:00',
    status: 'Confirmé',
    pointsEarned: 20,
    createdAt: '2026-06-05T08:00:00Z'
  },
  {
    id: 'RDV-002',
    clientName: 'Aline Mvogo',
    phone: '677112233',
    immatriculation: 'DL-302-CZ',
    vehicleType: 'B1',
    date: '2026-06-08',
    timeSlot: '11:00 - 12:00',
    status: 'Retour effectué',
    pointsEarned: 20,
    createdAt: '2026-06-05T14:15:00Z'
  },
  {
    id: 'RDV-003',
    clientName: 'Afrique Trans-Saga',
    phone: '233445566',
    immatriculation: 'OU-904-BK',
    vehicleType: 'D',
    date: '2026-06-09',
    timeSlot: '08:00 - 09:00',
    status: 'Confirmé',
    pointsEarned: 40,
    createdAt: '2026-06-06T09:30:00Z'
  },
  {
    id: 'RDV-004',
    clientName: 'Jean-Paul Abega',
    phone: '688443322',
    immatriculation: 'CE-724-EP',
    vehicleType: 'A',
    date: '2026-06-09',
    timeSlot: '14:30 - 15:30',
    status: 'Relancé',
    pointsEarned: 10,
    createdAt: '2026-06-04T16:00:00Z'
  },
  {
    id: 'RDV-005',
    clientName: 'Chantal Ngo',
    phone: '655909090',
    immatriculation: 'AD-635-FM',
    vehicleType: 'C',
    date: '2026-06-10',
    timeSlot: '10:30 - 11:30',
    status: 'Retour effectué',
    pointsEarned: 30,
    createdAt: '2026-06-06T15:45:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-001',
    action: 'Démarrage Système',
    details: 'Initialisation de la base de données sécurisée de VisiteTech CTR. Mode autonome actif.',
    userRole: 'Système',
    timestamp: new Date().toISOString(),
    status: 'success'
  }
];

export const EXPIRATION_DATABASE: ExpirationInfo[] = [
  {
    immatriculation: 'LT-109-AF',
    clientName: 'Jean-Marc Ndzana',
    phone: '69898989',
    vehicleType: 'B',
    lastInspectionDate: '2025-06-03',
    nextInspectionDate: '2026-06-03',
    daysLeft: -4,
    status: 'danger',
    alertSMS: true,
    alertEmail: true
  },
  {
    immatriculation: 'OU-904-BK',
    clientName: 'Afrique Trans-Saga',
    phone: '233445566',
    vehicleType: 'D',
    lastInspectionDate: '2025-12-05',
    nextInspectionDate: '2026-06-05',
    daysLeft: -2,
    status: 'danger',
    alertSMS: true,
    alertEmail: true
  },
  {
    immatriculation: 'LT-554-CH',
    clientName: 'Sylvestre Tchatchouang',
    phone: '657121471',
    vehicleType: 'B',
    lastInspectionDate: '2025-06-09',
    nextInspectionDate: '2026-06-09',
    daysLeft: 2,
    status: 'danger',
    alertSMS: true,
    alertEmail: true
  },
  {
    immatriculation: 'LT-827-DK',
    clientName: 'Michel Tchoffo',
    phone: '699887766',
    vehicleType: 'B',
    lastInspectionDate: '2025-06-08',
    nextInspectionDate: '2026-06-08',
    daysLeft: 1,
    status: 'danger',
    alertSMS: true,
    alertEmail: true
  },
  {
    immatriculation: 'DL-302-CZ',
    clientName: 'Aline Mvogo',
    phone: '677112233',
    vehicleType: 'B1',
    lastInspectionDate: '2026-06-08',
    nextInspectionDate: '2027-06-08',
    daysLeft: 366,
    status: 'normal',
    alertSMS: true,
    alertEmail: true
  },
  {
    immatriculation: 'CE-724-EP',
    clientName: 'Jean-Paul Abega',
    phone: '688443322',
    vehicleType: 'A',
    lastInspectionDate: '2025-06-09',
    nextInspectionDate: '2026-06-09',
    daysLeft: 2,
    status: 'danger',
    alertSMS: true,
    alertEmail: true
  },
  {
    immatriculation: 'AD-635-FM',
    clientName: 'Chantal Ngo',
    phone: '655909090',
    vehicleType: 'C',
    lastInspectionDate: '2026-06-07',
    nextInspectionDate: '2026-12-07',
    daysLeft: 183,
    status: 'normal',
    alertSMS: true,
    alertEmail: true
  }
];

export const LOYALTY_DATABASE: LoyaltyAccount[] = [];

// Statistiques réelles du document pour le rapport d'activité de Mai 2026
export const RAPPORT_MAI_STATS = {
  attendus: 1753,
  rep_appels: 1008,
  non_joints: 361,
  taux_realisation: 62.59,
  renouveles_centre: 631,
  renouveles_ailleurs: 319,
  pas_encore_renouveles: 803,
  details_categories: [
    { cat: 'A', label: 'Motos', attendus: 59, fait: 28, ailleurs: 3, non: 28 },
    { cat: 'B', label: 'Véhicules Légers', attendus: 644, fait: 161, ailleurs: 70, non: 413 },
    { cat: 'B1', label: 'Taxis / Auxiliaires', attendus: 231, fait: 85, ailleurs: 28, non: 118 },
    { cat: 'C', label: 'Transports Publics', attendus: 85, fait: 22, ailleurs: 9, non: 54 },
    { cat: 'D', label: 'Poids Lourds', attendus: 734, fait: 335, ailleurs: 209, non: 190 }
  ]
};

// Formule de validation des plaques (format de type LT-482-AA ou 1234 XY 01)
export function validateImmatriculation(plate: string): boolean {
  const clean = plate.trim().toUpperCase();
  // Format moderne: LT-482-AA ou AB-123-CD
  const modernPattern = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
  // Format traditionnel d'Afrique centrale ou alternatif: 1234-XY-01 ou 1234 XY 01 ou LT123AB etc
  const altPattern = /^[A-Z0-9\s-]{4,10}$/;
  return modernPattern.test(clean) || (altPattern.test(clean) && clean.length >= 5);
}

// Validation téléphone camerounais / international basique
export function validatePhone(phone: string): boolean {
  const clean = phone.trim().replace(/\s+/g, '');
  // Format long ou court: e.g. 699887766 ou +237699887766
  return /^((\+237|237)?)?[623][0-9]{8}$/.test(clean) || clean.length >= 8;
}
