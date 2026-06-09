/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, CalendarRange, UserCog, Landmark, Award, Home, Car, LogOut, Lock, User, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  currentSection: 'home' | 'admin' | 'client';
  onChangeSection: (section: 'home' | 'admin' | 'client') => void;
  onOpenBooking: () => void;
  onOpenExpiry: () => void;
  onOpenLoyalty: () => void;
  loggedClient: { name: string; plate: string; phone: string } | null;
  onLogoutClient: () => void;
  isAdminAuthenticated: boolean;
  onLogoutAdmin: () => void;
}

export default function Navbar({
  currentSection,
  onChangeSection,
  onOpenBooking,
  onOpenExpiry,
  onOpenLoyalty,
  loggedClient,
  onLogoutClient,
  isAdminAuthenticated,
  onLogoutAdmin
}: NavbarProps) {

  return (
    <>
      {/* 🚀 ELÉGANT DESKTOP & TABLET TOP STICKY FLOATING GLASS NAVBAR */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4 hidden md:block" id="app-navbar-premium">
        <div className="mx-auto max-w-7xl bg-white/85 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-lg shadow-slate-200/40 px-6 h-16 flex items-center justify-between transition-all duration-300">
          
          {/* Logo Section with responsive animations */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none" 
            onClick={() => onChangeSection('home')}
          >
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
            >
              <ShieldCheck className="h-5.5 w-5.5" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-display text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                VISITE<span className="text-blue-600 group-hover:text-indigo-600 transition-colors">TECH</span>
              </span>
              <span className="font-mono text-[8.5px] tracking-widest text-[#2563eb] uppercase font-bold leading-none mt-0.5">
                Contrôle Technique
              </span>
            </div>
          </div>

          {/* Navigational Links with clean visual indicators */}
          <div className="flex items-center gap-1">
            {[
              { id: 'home', label: 'Accueil', action: () => onChangeSection('home') },
              { id: 'client', label: 'Espace Client', action: () => onChangeSection('client') },
            ].map((tab) => {
              const isActive = currentSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={tab.action}
                  className="relative px-3.5 py-2 text-xs font-bold transition-all cursor-pointer rounded-lg uppercase tracking-wider select-none text-slate-650 hover:text-slate-900"
                >
                  <span className="relative z-10">{tab.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-blue-50 border border-blue-100/70 rounded-lg -z-0"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}

            <div className="h-4 w-px bg-slate-200 mx-2" />

            {/* Quick Actions with beautiful micro-tooltips */}
            <button
              onClick={onOpenExpiry}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer rounded-lg hover:bg-slate-50"
            >
              <FileText className="h-3.5 w-3.5 text-slate-450" />
              <span>Suivi Échéance</span>
            </button>

            <button
              onClick={onOpenLoyalty}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer rounded-lg hover:bg-slate-50"
            >
              <Award className="h-3.5 w-3.5 text-slate-450" />
              <span>Fidélité</span>
            </button>
          </div>

          {/* Right Action container (User indicator + Admin route + primary CTA) */}
          <div className="flex items-center gap-3">
            
            {/* Authenticated Client Section */}
            {loggedClient ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 pl-3 pr-2 py-1.5 rounded-xl text-xs text-slate-700 font-medium">
                <User className="h-3.5 w-3.5 text-blue-500" />
                <span className="max-w-[100px] truncate block font-bold text-slate-850" title={loggedClient.name}>
                  {loggedClient.name}
                </span>
                <span className="font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 tracking-tight">
                  {loggedClient.plate}
                </span>
                <button 
                  onClick={onLogoutClient}
                  title="Déconnexion espace client"
                  className="p-1 rounded-md text-slate-400 hover:text-red-650 hover:bg-red-50/50 transition-all cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onChangeSection('client')}
                className="text-xs font-bold text-slate-500 hover:text-blue-600 border border-transparent hover:border-slate-200 bg-transparent hover:bg-white hover:shadow-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Connexion Client
              </button>
            )}

             {/* Admin Switch - Only visible if currently browsing the admin deck to allow returning/logging out */}
             {currentSection === 'admin' && (
               <div className="flex items-center gap-1.5">
                 <button
                   onClick={() => onChangeSection('client')}
                   className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer bg-slate-900 border-slate-950 text-white shadow-sm"
                 >
                   <UserCog className="h-4 w-4 shrink-0" />
                   Retour Client
                 </button>
                 
                 {isAdminAuthenticated && (
                   <button
                     onClick={onLogoutAdmin}
                     title="Se déconnecter de l'administration"
                     className="p-2 rounded-xl bg-red-50 text-red-650 border border-red-150 hover:border-red-200 hover:bg-red-100/50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                   >
                     <LogOut className="h-3.5 w-3.5" />
                     Quitter
                   </button>
                 )}
               </div>
             )}

            {/* Direct Booking primary CTA */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenBooking}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/15 hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer font-sans"
            >
              <CalendarRange className="h-4 w-4" />
              Prendre RDV
            </motion.button>

          </div>
        </div>
      </header>

      {/* 📱 MODERN FLOATING TOP HEADER FOR MOBILE DISPLAY */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-150 bg-white/90 backdrop-blur-md md:hidden flex h-14 items-center justify-between px-4 transition-all duration-200 select-none shadow-3xs" id="app-mobile-topbar-premium">
        <div className="flex items-center gap-2" onClick={() => onChangeSection('home')}>
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <span className="font-display text-sm font-black tracking-tight text-slate-900">
            VISITE<span className="text-blue-600">TECH</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {loggedClient ? (
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-105/50 pl-2 pr-1.5 py-1 rounded-xl text-[10px] text-blue-800 font-bold max-w-[150px]">
              <span className="truncate max-w-[70px] font-extrabold">{loggedClient.name}</span>
              <button 
                onClick={onLogoutClient}
                className="text-blue-400 hover:text-red-500 p-0.5 rounded hover:bg-white/50"
                title="Déconnexion"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
              Visiteur
            </span>
          )}
        </div>
      </nav>

      {/* 🟢 PREMIUM MOBILE BOTTOM NAVIGATION BAR (FLOATING DOCK AESTHETIC - AT LEAST 4 TABS) */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden" id="app-mobile-bottombar-container">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl shadow-slate-950/30 px-3 py-2.5 flex items-center justify-between relative overflow-hidden">
          
          {/* Subtle horizontal gradient ambient glow inside the mobile dock */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          {/* 1. Tab - ACCUEIL */}
          <button
            onClick={() => onChangeSection('home')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all duration-200 relative cursor-pointer ${
              currentSection === 'home' ? 'text-blue-400 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="h-4.5 w-4.5 mb-1 stroke-[2.2px]" />
            <span className="text-[9px] tracking-tight truncate">Accueil</span>
            {currentSection === 'home' && (
              <motion.div 
                layoutId="mobileActiveIndicatorSpot"
                className="absolute -bottom-1 h-1 w-5 bg-blue-400 rounded-full" 
              />
            )}
          </button>

          {/* 2. Tab - ESPACE CLIENT */}
          <button
            onClick={() => onChangeSection('client')}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-center transition-all duration-200 relative cursor-pointer ${
              currentSection === 'client' ? 'text-blue-400 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="h-4.5 w-4.5 mb-1 stroke-[2.2px]" />
            <span className="text-[9px] tracking-tight truncate">Mon Garage</span>
            {currentSection === 'client' && (
              <motion.div 
                layoutId="mobileActiveIndicatorSpot"
                className="absolute -bottom-1 h-1 w-5 bg-blue-400 rounded-full" 
              />
            )}
          </button>

          {/* 3. Central Floating Action Tab - RESÉLIA "PRENDRE RDV" */}
          <button
            onClick={onOpenBooking}
            className="flex flex-col items-center justify-center flex-1 py-1.5 text-center transition-all duration-150 relative cursor-pointer bg-blue-600 text-white rounded-xl mx-1 max-w-[64px] h-[42px] shadow-md shadow-blue-500/20 hover:bg-blue-500 active:scale-95"
          >
            <CalendarRange className="h-4.5 w-4.5 stroke-[2.5px]" />
            <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">RDV</span>
          </button>

          {/* 4. Tab - RAPPORTS ET FIDÉLITÉ COMPLIANCE MODALS (Quick Access to make it at least 4/5 options) */}
          <button
            onClick={onOpenLoyalty}
            className="flex flex-col items-center justify-center flex-1 py-1 text-center transition-all duration-200 relative cursor-pointer text-slate-400 hover:text-slate-200"
          >
            <Award className="h-4.5 w-4.5 mb-1 stroke-[2px]" />
            <span className="text-[9px] tracking-tight truncate">Mes Privilèges</span>
          </button>

        </div>
      </div>

      {/* Extra layout spacing helper on mobile screens to prevent visual content overlapping */}
      <div className="h-24 block md:hidden" />
    </>
  );
}
