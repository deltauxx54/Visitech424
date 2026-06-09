/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RendezVous {
  id: string;
  clientName: string;
  phone: string;
  immatriculation: string;
  vehicleType: 'A' | 'B' | 'B1' | 'C' | 'D'; // correspond aux catégories du document
  date: string;
  timeSlot: string;
  status: 'Relancé' | 'Confirmé' | 'Non joignable' | 'Retour effectué' | 'En attente';
  notes?: string;
  pointsEarned: number;
  createdAt: string;
  modificationRequest?: {
    requestedDate: string;
    requestedTimeSlot: string;
    reason?: string;
    status: 'en_attente' | 'accepté' | 'refusé';
  };
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  userRole: 'Agent' | 'Administrateur' | 'Système';
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

export interface ExpirationInfo {
  immatriculation: string;
  clientName: string;
  phone: string;
  vehicleType: 'A' | 'B' | 'B1' | 'C' | 'D';
  lastInspectionDate: string;
  nextInspectionDate: string;
  daysLeft: number;
  status: 'danger' | 'warning' | 'normal';
  alertEmail: boolean;
  alertSMS: boolean;
}

export interface LoyaltyAccount {
  immatriculation: string;
  phone: string;
  clientName: string;
  points: number;
  level: 'Bronze' | 'Silver' | 'Gold';
  inspectionsCount: number;
  history: {
    id: string;
    date: string;
    type: string;
    points: number;
  }[];
}

export interface SupportTicket {
  id: string;
  clientName: string;
  phone: string;
  immatriculation?: string;
  subject: string;
  message: string;
  status: 'Ouvert' | 'Résolu';
  createdAt: string;
  adminReply?: string;
  repliedAt?: string;
}

