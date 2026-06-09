import React from 'react';
import { motion } from 'motion/react';
import { Calendar, BellRing, Award, ShieldAlert, BadgeCheck } from 'lucide-react';

interface FeaturesProps {
  onOpenBooking: () => void;
  onOpenExpiry: () => void;
  onOpenLoyalty: () => void;
}

export default function Features({ onOpenBooking, onOpenExpiry, onOpenLoyalty }: FeaturesProps) {
  const list = [
    {
      title: 'Prise de RDV Intelligente',
      description: 'Réservez votre créneau de visite en ligne en moins d\'une minute avec validation automatique de téléphone pour éliminer toute erreur.',
      icon: Calendar,
      tag: 'Élimine l\'attente',
      color: 'bg-blue-50 text-blue-600',
      actionText: 'Prendre un rendez-vous',
      action: onOpenBooking
    },
    {
      title: 'Suivi d\'Échéance Automatique',
      description: 'Saisissez votre immatriculation et calculez l\'échéance réglementaire. Activez des notifications gratuites par SMS et email.',
      icon: BellRing,
      tag: 'Alerte anticipée',
      color: 'bg-indigo-50 text-indigo-600',
      actionText: 'Vérifier mon échéance',
      action: onOpenExpiry
    },
    {
      title: 'Programme Fidélité d\'Expert',
      description: 'Chaque contrôle géré cumule des points de réduction automatiques. Bénéficiez d\'accès prioritaires en couloir VIP pour vos flottes.',
      icon: Award,
      tag: 'Palier Privilège',
      color: 'bg-emerald-50 text-emerald-600',
      actionText: 'Consulter mes récompenses',
      action: onOpenLoyalty
    }
  ];

  return (
    <section className="relative py-24 bg-white border-t border-slate-100" id="services-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Optimisez vos visites techniques automobiles
          </h2>
          <p className="mt-4 text-base text-slate-500">
            Une suite fonctionnelle complète conçue pour répondre aux problématiques relevées sur le terrain, alignée sur les normes de qualité les plus strictes.
          </p>
        </div>

        {/* Bento/Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {list.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-8 hover:border-blue-100 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div>
                  {/* Icon wrap */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color} mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Badge */}
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-bold bg-slate-100 text-slate-600 uppercase mb-3">
                    {item.tag}
                  </span>

                  {/* Heading */}
                  <h3 className="font-display text-xl font-bold text-slate-800 mb-3">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </div>

                {/* CTA Action button */}
                <div className="mt-8">
                  <button
                    onClick={item.action}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200 cursor-pointer text-left"
                  >
                    <span>{item.actionText}</span>
                    <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Informational callout regarding data validation */}
        <div className="mt-16 bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                Validation en Temps Réel & Traçabilité OWASP
                <span className="px-2 py-0.5 text-[9px] font-mono bg-blue-100 text-blue-800 rounded font-bold uppercase">Qualité</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                La plateforme procède à un audit de cohérence en temps réel sur toutes les données saisies. L'absence de double saisie humaine réduit le taux de rebond de moitié tout en garantissant des logs conformes aux spécifications de gouvernance.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 bg-white px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-100 shadow-sm">
            <BadgeCheck className="h-4 w-4 text-emerald-600" />
            Vérification sémantique temps réel
          </div>
        </div>

      </div>
    </section>
  );
}
