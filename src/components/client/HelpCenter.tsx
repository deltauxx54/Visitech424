/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  Send, 
  Clock, 
  CheckCircle2, 
  CornerDownRight,
  ShieldCheck,
  User,
  Tags
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportTicket } from '../../types';

interface HelpCenterProps {
  currentClient: { name: string; plate: string; phone: string };
  supportTickets: SupportTicket[];
  onCreateSupportTicket: (ticket: SupportTicket) => void;
}

export default function HelpCenter({
  currentClient,
  supportTickets = [],
  onCreateSupportTicket
}: HelpCenterProps) {
  
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Général');
  const [successMsg, setSuccessMsg] = useState(false);

  // Filter tickets related to current client
  const clientTickets = supportTickets.filter(
    t => t.clientName === currentClient.name || t.phone === currentClient.phone
  );

  const FAQS = [
    {
      q: "Comment fonctionne l'attribution des points de fidélité Rebours ?",
      a: "Dès que vous effectuez physiquement votre inspection technique obligatoire dans notre centre, notre agent valide la fiche de passage. C'est à cet instant précis que votre jauge de fidélité se remplit automatiquement, vous octroyant des points inaltérables selon votre catégorie de véhicule (ex: +20 pts pour la catégorie B1 Taxis)."
    },
    {
      q: "Puis-je reporter ou modifier la date de ma visite ?",
      a: "Oui, tout à fait ! Depuis votre Espace Client (sur l'onglet Tableau de bord), vous avez accès à vos rendez-vous futurs. Cliquez simplement sur le bouton 'Demander Modification' pour spécifier un nouveau jour/créneau horaire. L'équipe technique recevra l'alerte sur sa console et pourra valider ou refuser le décalage."
    },
    {
      q: "Comment puis-je me procurer un certificat si mon véhicule n'est pas répertorié ?",
      a: "Pour associer un nouveau véhicule ou une nouvelle plaque à votre compte, rendez-vous dans l'onglet 'Mon Garage' et renseignez le numéro d'immatriculation. Notre système interrogera instantanément le registre central pour synchroniser vos avertissements."
    },
    {
      q: "Combien de temps faut-il pour valider l'expiration après ma visite ?",
      a: "C'est instantané. Dès que l'équipe de contrôle technique passe le statut de votre rendez-vous à 'Retour effectué' (marquant le contrôle physique terminé), votre date d'échéance légale de contrôle technique se met immédiatement à jour avec une validité de 1 an (ou 6 mois pour les utilitaires et transports lourds de catégories C/D)."
    }
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const newTicket: SupportTicket = {
      id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
      clientName: currentClient.name,
      phone: currentClient.phone,
      immatriculation: currentClient.plate,
      subject: `[${ticketCategory}] ${subject}`,
      message: message,
      status: 'Ouvert',
      createdAt: new Date().toISOString()
    };

    onCreateSupportTicket(newTicket);
    setSubject('');
    setMessage('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="client-support-center">
      
      {/* Visual Welcome Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-display text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <HelpCircle className="h-5.5 w-5.5 text-blue-600 animate-pulse" />
            Centre d'Aide &amp; Support Technique
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Trouvez des réponses immédiates ou transmettez une demande officielle d'assistance à nos équipes d'inspecteurs agréés.
          </p>
        </div>
        <span className="text-[10px] bg-emerald-50 border border-emerald-150 text-emerald-800 font-mono px-3 py-1 rounded-full uppercase tracking-wider font-bold">
          Assistance Active 24J/7
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Area - Knowledge base & FAQ */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs">
            <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
              <ShieldCheck className="h-4.5 w-4.5 text-blue-600" />
              Foire Aux Questions Fréquentes (FAQ)
            </h3>

            <div className="space-y-3.5">
              {FAQS.map((faq, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div key={index} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/40">
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-700 text-xs sm:text-xs.1 hover:text-blue-600 transition-colors bg-white cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 pb-4 pt-1 text-xs text-slate-500 leading-relaxed font-medium bg-slate-50 border-t border-slate-100"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ticket Listing history */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs">
            <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
              <MessageSquare className="h-4.5 w-4.5 text-blue-600 animate-pulse" />
              Vos requêtes d'assistance ({clientTickets.length})
            </h3>

            {clientTickets.length > 0 ? (
              <div className="space-y-4">
                {clientTickets.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-850 font-mono bg-white border px-2 py-0.5 rounded shadow-3xs">{t.id}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Déposé le {new Date(t.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider border ${
                        t.status === 'Résolu' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-800 border-amber-250 animate-pulse'
                      }`}>
                        {t.status === 'Résolu' ? '✓ RÉSOLU' : '• OUVERT / EN COURS'}
                      </span>
                    </div>

                    <div className="text-xs">
                      <p className="font-bold text-slate-850">{t.subject}</p>
                      <p className="text-slate-600 mt-1 pl-2 border-l-2 border-slate-200">{t.message}</p>
                    </div>

                    {/* Admin Response Speach bubble if resolved */}
                    {t.adminReply && (
                      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1 ml-4 shadow-3xs">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-800">
                          <CornerDownRight className="h-3.5 w-3.5" />
                          <span>Réponse officielle du Chef de Centre</span>
                          <span className="text-slate-400 font-normal font-mono font-bold">({new Date(t.repliedAt || '').toLocaleDateString('fr-FR')})</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 italic pl-5 leading-normal">
                          "{t.adminReply}"
                        </p>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs font-medium bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                Aucun ticket d'assistance déposé pour le moment.
              </div>
            )}
          </div>

        </div>

        {/* Right Area - Submit ticket form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-150 p-6 shadow-3xs h-fit">
          <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-slate-100 pb-2.5">
            <PlusCircle className="h-4.5 w-4.5 text-blue-600" />
            Ouvrir une fiche d'assistance
          </h3>

          <form onSubmit={handleTicketSubmit} className="space-y-4">
            
            {/* Subject option category */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Tags className="h-3.5 w-3.5" />
                Catégorie de la question
              </label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value="Général">Renseignements Généraux</option>
                <option value="Fidélité">Avantages Fidélité &amp; Points Rebours</option>
                <option value="Réservation">Modification / Problème Réservation</option>
                <option value="Technique">Défaut technique / Contre-visite</option>
                <option value="Autre">Autre Demande Spécifique</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Sujet de votre demande *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Correction de plaque ou anomalie points"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-450 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Décrivez votre problème en détails *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Ex: Bonjour, je me permets de vous contacter car j'ai effectué mon inscription en ligne mais je n'arrive pas à lier le véhicule de ma société qui est sous le format de plaque..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3.5 py-3 text-xs text-slate-705 placeholder:text-slate-450 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                Votre ticket a été enregistré et notifié à l'équipe d'assistance !
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 cursor-pointer active:scale-98"
            >
              <Send className="h-3.5 w-3.5" />
              Soumettre notre équipe
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}
