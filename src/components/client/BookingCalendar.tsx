import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Car, 
  HelpCircle, 
  CheckCircle2, 
  Info,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RendezVous, ExpirationInfo } from '../../types';

interface BookingCalendarProps {
  currentClient: { name: string; plate: string; phone: string; };
  expirations: ExpirationInfo[];
  appointments: RendezVous[];
  onAddAppointment: (newAppt: RendezVous) => void;
}

export default function BookingCalendar({
  currentClient,
  expirations,
  appointments,
  onAddAppointment
}: BookingCalendarProps) {
  
  // Date selection state
  // Let's base our calendar around June 2026 (the operational calendar month of current mockData)
  const currentYear = 2026;
  const currentMonthIdx = 5; // June (0-indexed)
  const monthName = 'Juin 2026';
  
  const [selectedDay, setSelectedDay] = useState<number>(8); // Default 8 June
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  
  // Form state
  const [selectedPlate, setSelectedPlate] = useState(currentClient.plate || '');
  const [clientName, setClientName] = useState(currentClient.name || '');
  const [phone, setPhone] = useState(currentClient.phone || '');
  const [vehicleType, setVehicleType] = useState<'A' | 'B' | 'B1' | 'C' | 'D'>('B');
  const [notes, setNotes] = useState('');
  
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [successBooking, setSuccessBooking] = useState<RendezVous | null>(null);

  // Sync state if client switches profile
  useEffect(() => {
    setSelectedPlate(currentClient.plate || '');
    setClientName(currentClient.name || '');
    setPhone(currentClient.phone || '');
    
    const clientVehInfo = expirations.find(e => e.immatriculation === currentClient.plate);
    if (clientVehInfo) {
      setVehicleType(clientVehInfo.vehicleType);
    }
  }, [currentClient, expirations]);

  // Handle vehicle plate selector changes: automatically populate vehicle category
  useEffect(() => {
    const selectedVeh = expirations.find(v => v.immatriculation === selectedPlate);
    if (selectedVeh) {
      setVehicleType(selectedVeh.vehicleType);
    }
  }, [selectedPlate, expirations]);

  // List of days in June 2026: June has 30 days. June 1, 2026 is a Monday.
  const daysInJune = 30;
  const daysGrid: ({ day: number; isPadding: boolean; isWeekend: boolean })[] = [];
  
  // June 1 2026 is Monday. There is no grid padding needed for Sunday-start if we start on Monday.
  // Let's structure standard grid (starting Monday):
  for (let i = 1; i <= daysInJune; i++) {
    // Check if weekend (Saturday or Sunday)
    const dateObj = new Date(2026, 5, i);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    daysGrid.push({ day: i, isPadding: false, isWeekend });
  }

  // Pre-configured list of inspection hours
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

  // Dynamically calculate which slots are already booked on the selected date
  const isoSelectedDate = `2026-06-${selectedDay < 10 ? '0' + selectedDay : selectedDay}`;
  
  useEffect(() => {
    const matchedAppointments = appointments.filter(
      appt => appt.date === isoSelectedDate && appt.status !== 'Non joignable'
    );
    const booked = matchedAppointments.map(appt => appt.timeSlot);
    setBookedSlots(booked);
    
    // Auto-select first available slot if previous selected slot is no longer available/empty
    if (!booked.includes(selectedTimeSlot) && selectedTimeSlot !== '') {
      // Keep selected
    } else {
      const firstAvailable = TIME_SLOTS.find(ts => !booked.includes(ts));
      setSelectedTimeSlot(firstAvailable || '');
    }
  }, [selectedDay, appointments]);

  const handleBookingConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTimeSlot) return;

    // Calculate dynamic points matching technical guidelines
    let points = 15;
    if (vehicleType === 'A') points = 10;
    if (vehicleType === 'B1') points = 20;
    if (vehicleType === 'C') points = 25;
    if (vehicleType === 'D') points = 30;

    const newAppt: RendezVous = {
      id: `RDV-${Math.floor(100 + Math.random() * 900)}`,
      clientName: clientName,
      phone: phone,
      immatriculation: selectedPlate.toUpperCase().trim(),
      vehicleType: vehicleType,
      date: isoSelectedDate,
      timeSlot: selectedTimeSlot,
      status: 'En attente',
      notes: notes || 'Enregistré via le Calendrier Interactif.',
      pointsEarned: points,
      createdAt: new Date().toISOString()
    };

    onAddAppointment(newAppt);
    setSuccessBooking(newAppt);
    setNotes('');
  };

  return (
    <div className="space-y-6" id="booking-calendar-view">
      
      {/* Upper info section */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="font-display text-xl font-bold text-slate-900">Calendrier Graphique de Réservation</h2>
        <p className="text-xs text-slate-500 mt-1">
          Sélectionnez de manière fluide votre créneau d'inspection technique. Aucun frais d'enregistrement requis.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {successBooking ? (
          /* Confirmation card with clean layout */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-6 sm:p-8 text-center max-w-xl mx-auto space-y-4"
            key="success-card"
          >
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-6.5 w-6.5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">Demande Enregistrée avec Succès !</h3>
              <p className="text-xs text-slate-500 mt-1">
                Votre créneau officiel de contrôle a été bloqué. Un agent de contrôle vous attendra.
              </p>
            </div>

            <div className="bg-white border border-slate-100 p-4 rounded-xl text-left text-xs font-mono space-y-2 max-w-sm mx-auto shadow-xs text-slate-600">
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Référence Rdv:</span>
                <span className="font-bold text-slate-800">{successBooking.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Véhicule immatriculé:</span>
                <span className="font-bold text-slate-800">{successBooking.immatriculation}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Date retenue:</span>
                <span className="font-bold text-slate-800">{successBooking.date}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Heure de passage:</span>
                <span className="font-bold text-slate-800">{successBooking.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Crédit Fidélité prévu:</span>
                <span className="font-bold text-emerald-600 font-sans font-semibold">+{successBooking.pointsEarned} Points</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSuccessBooking(null)}
                className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer"
              >
                Prendre un autre rendez-vous
              </button>
            </div>
          </motion.div>
        ) : (
          /* Calendar Planner UI Grid */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            key="planner-form"
          >
            
            {/* Interactive Month & Hours Selector (Left) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-xs space-y-6">
              
              {/* Header with calendar controls */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-slate-800 text-sm tracking-wide uppercase flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                    Choisir la Date de Passage
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Cliquez sur un jour de semaine disponible</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {monthName}
                  </span>
                </div>
              </div>

              {/* Graphical Month Grid June 2026 (Starts on Monday) */}
              <div className="space-y-1">
                {/* Week days labels */}
                <div className="grid grid-cols-7 text-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <div>Lun</div>
                  <div>Mar</div>
                  <div>Mer</div>
                  <div>Jeu</div>
                  <div>Ven</div>
                  <div>Sam</div>
                  <div>Dim</div>
                </div>

                {/* Day Blocks */}
                <div className="grid grid-cols-7 gap-1.5 pt-1.5">
                  {daysGrid.map(({ day, isWeekend }) => {
                    const isSelected = selectedDay === day;
                    
                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={isWeekend}
                        onClick={() => setSelectedDay(day)}
                        className={`aspect-square sm:p-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
                          isWeekend 
                            ? 'bg-slate-50 border border-transparent text-slate-350 cursor-not-allowed font-normal' 
                            : isSelected 
                            ? 'bg-blue-600 text-white border border-blue-600 shadow-md shadow-blue-500/20 scale-102 font-extrabold' 
                            : 'bg-white border border-slate-150 hover:border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer'
                        }`}
                      >
                        <span className="block font-mono text-xs">{day}</span>
                        {isWeekend ? (
                          <span className="text-[7px] text-slate-300 mt-0.5 block uppercase">Fermé</span>
                        ) : (
                          <span className={`text-[7px] mt-0.5 block font-bold font-sans uppercase leading-none ${isSelected ? 'text-white/80' : 'text-emerald-600'}`}>
                            Dispo
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Selector Panel */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Créneaux disponibles le {selectedDay} {monthName}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((ts) => {
                    const isBooked = bookedSlots.includes(ts);
                    const isSelected = selectedTimeSlot === ts;

                    return (
                      <button
                        key={ts}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedTimeSlot(ts)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-semibold font-mono border text-center transition-all ${
                          isBooked
                            ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/15'
                            : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700 hover:bg-slate-50 cursor-pointer'
                        }`}
                      >
                        <div className="font-mono">{ts.split(' ')[0]}</div>
                        <div className={`text-[8px] mt-0.5 ${isBooked ? 'text-slate-400' : isSelected ? 'text-emerald-50' : 'text-blue-500'}`}>
                          {isBooked ? 'Occupé' : isSelected ? 'Sélectionné' : 'Disponible'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Confirmation & Vehicle Specifications (Right) */}
            <form onSubmit={handleBookingConfirm} className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <User className="h-4 w-4 text-blue-600" />
                  Spécifier le Véhicule
                </h3>

                {/* Form fields */}
                <div className="space-y-3.5">
                  
                  {/* Select vehicle from garage list */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Véhicule à inspecter *
                    </label>
                    <select
                      value={selectedPlate}
                      onChange={(e) => setSelectedPlate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-850 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                    >
                      <option value="">-- Choisir parmi votre Garage --</option>
                      {expirations.filter(e => e.clientName === currentClient.name || e.immatriculation === currentClient.plate).map(veh => (
                        <option key={veh.immatriculation} value={veh.immatriculation} className="font-mono font-bold">
                          {veh.immatriculation} (Cat. {veh.vehicleType})
                        </option>
                      ))}
                    </select>
                    {selectedPlate.length === 0 && (
                      <p className="text-[10px] text-amber-600 font-semibold mt-1">
                        Aucun véhicule sélectionné. Veuillez d'abord associer une plaque dans l'onglet "Mon Garage" ou sélectionner votre compte d'essai.
                      </p>
                    )}
                  </div>

                  {/* Owner details */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Propriétaire *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full bg-slate-55 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Téléphone *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Type Auto Visual Counter Check */}
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl shrink-0">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-705 mb-2">
                      <span className="text-slate-450 uppercase text-[10px] tracking-wider font-bold">Avantage Fidélité Estimé</span>
                      <span className="text-emerald-700 text-xs font-mono font-extrabold font-semibold">
                        {vehicleType === 'A' ? '+10 pts' : 
                         vehicleType === 'B1' ? '+20 pts' : 
                         vehicleType === 'C' ? '+25 pts' : 
                         vehicleType === 'D' ? '+30 pts' : 
                         '+15 pts'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal font-sans">
                      Dès que la visite est validée par l'un de nos agents techniques, ce montant de points bonus est crédité de manière inaltérable à votre compte de fidélité.
                    </p>
                  </div>

                  {/* Notes / Special queries */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Instructions complémentaires (Optionnel)
                    </label>
                    <textarea
                      placeholder="EX: Anomalie de frein à vérifier, contrôle d'émissions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400 font-medium"
                    />
                  </div>

                </div>
              </div>

              {/* Confirmation and Submit */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={!selectedTimeSlot || !selectedPlate}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/15"
                >
                  <ShieldCheck className="h-4.5 w-4.5" />
                  Confirmer le Rendez-vous gratuit
                </button>
                
                <div className="flex items-start gap-2 text-[10px] text-slate-500 leading-normal">
                  <Info className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Chaque rendez-vous planifié fait l'objet d'un scellement inaltérable d'audit à l'administration centrale.
                  </span>
                </div>
              </div>

            </form>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
