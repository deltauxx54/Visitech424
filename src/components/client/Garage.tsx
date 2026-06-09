import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Car, 
  Check, 
  AlertTriangle, 
  Trash2, 
  Info, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ExpirationInfo } from '../../types';
import { useFormValidation } from '../../hooks/useFormValidation';

interface GarageProps {
  currentClient: { name: string; plate: string; phone: string; };
  expirations: ExpirationInfo[];
  onAddVehicle: (newVehicle: Partial<ExpirationInfo>) => void;
}

export default function Garage({
  currentClient,
  expirations,
  onAddVehicle
}: GarageProps) {
  
  // State for user's vehicles
  const [vehicles, setVehicles] = useState<ExpirationInfo[]>([]);
  
  // Custom Validation Hook - Prompt 4 Specification
  const { 
    values: formValues, 
    errors: formErrors, 
    handleChange: formHandleChange, 
    isFormValid: formIsFormValid, 
    resetForm: formResetForm,
    validateAll: formValidateAll
  } = useFormValidation(
    {
      plate: '',
      brand: ''
    },
    {
      plate: { required: true, immatriculation: true },
      brand: { required: false }
    }
  );

  const [category, setCategory] = useState<'A' | 'B' | 'B1' | 'C' | 'D'>('B');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'dev-info' | null; text: string }>({ type: null, text: '' });

  // Reload client vehicles
  useEffect(() => {
    const clientVehicles = expirations.filter(
      exp => exp.clientName === currentClient.name || exp.immatriculation === currentClient.plate
    );
    setVehicles(clientVehicles);
  }, [expirations, currentClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = formValidateAll();
    if (!isValid) return;
    
    // Simulate adding vehicle
    const cleanPlate = formValues.plate.toUpperCase().trim();
    
    // Check duplicate
    if (expirations.some(v => v.immatriculation === cleanPlate)) {
      setStatusMsg({ type: 'dev-info', text: 'Ce véhicule existe déjà dans le registre d\'inspection.' });
      return;
    }

    // Default inspection dates
    const today = new Date();
    const nextInspection = new Date();
    const isCommercial = category === 'C' || category === 'D' || category === 'B1';
    
    // Commercial is every 6 months, standard is every 12 months
    nextInspection.setMonth(today.getMonth() + (isCommercial ? 6 : 12));

    const newVehicle: Partial<ExpirationInfo> = {
      immatriculation: cleanPlate,
      clientName: currentClient.name,
      phone: currentClient.phone,
      vehicleType: category,
      lastInspectionDate: today.toISOString().split('T')[0],
      nextInspectionDate: nextInspection.toISOString().split('T')[0],
      daysLeft: isCommercial ? 180 : 365,
      status: 'normal'
    };

    onAddVehicle(newVehicle);
    
    // Reset form
    formResetForm();
    setStatusMsg({ 
      type: 'success', 
      text: `Magnifique ! Le véhicule ${cleanPlate} a bien été enregistré. Validation réglementaire activée.` 
    });

    setTimeout(() => {
      setStatusMsg({ type: null, text: '' });
    }, 5000);
  };

  return (
    <div className="space-y-6" id="garage-view">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">Mon Garage Personnel</h2>
          <p className="text-xs text-slate-500 mt-1">
            Gérez votre flotte de véhicules et enregistrez de nouvelles plaques pour le suivi automatisé.
          </p>
        </div>
      </div>

      {/* Grid: Form to add vehicle (left/top) & Vehicle list (right/bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form Add vehicle */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
          <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 mb-4">
            <Plus className="h-4 w-4 text-blue-600" />
            Enregistrer un nouveau véhicule
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input Marque / Modèle */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                Marque & Modèle (Optionnel)
              </label>
              <input
                type="text"
                placeholder="EX: Toyota Rav4, Mercedes Actros..."
                value={formValues.brand}
                onChange={(e) => formHandleChange('brand', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder:text-slate-400 transition-all font-medium"
              />
            </div>

            {/* Input Registration Plate with Regex Validation */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                Numéro d'immatriculation *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="EX: LT-482-AA"
                  value={formValues.plate}
                  onChange={(e) => formHandleChange('plate', e.target.value.toUpperCase())}
                  className={`w-full bg-slate-50 border rounded-xl pl-4 pr-10 py-3 text-sm font-mono font-bold uppercase transition-all tracking-wider focus:outline-none focus:ring-1 ${
                    formValues.plate.length === 0 
                      ? 'border-slate-200 focus:ring-blue-600' 
                      : !formErrors.plate 
                      ? 'border-emerald-500 ring-1 ring-emerald-100 bg-emerald-50/10 focus:ring-emerald-500 text-emerald-990' 
                      : 'border-red-400 focus:ring-red-400 text-red-800'
                  }`}
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {formValues.plate.length > 0 && !formErrors.plate && <Check className="h-4 w-4 text-emerald-600 stroke-[2.5]" />}
                  {formValues.plate.length > 0 && formErrors.plate && <AlertTriangle className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              
              {/* Intelligent regex feedback UI */}
              <div className="mt-2 text-[10px] leading-relaxed">
                {formValues.plate.length === 0 ? (
                  <p className="text-slate-500 flex items-center gap-1">
                    <Info className="h-3 w-3 text-blue-600" />
                    Format requis type CEMAC (ex: <strong className="font-mono text-slate-700 bg-slate-100 px-1 py-0.2 rounded font-bold">LT-482-AA</strong>)
                  </p>
                ) : !formErrors.plate ? (
                  <p className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    Plaque conforme décelée ! Format valide d'immatriculation.
                  </p>
                ) : (
                  <p className="text-red-650 font-bold flex items-center gap-1 bg-red-50/50 p-1.5 rounded border border-red-100">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    {formErrors.plate}
                  </p>
                )}
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                Catégorie Technique du Véhicule *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium cursor-pointer"
              >
                <option value="A">Catégorie A (Motos / Deux roues)</option>
                <option value="B">Catégorie B (Voitures de tourisme / SUV léger)</option>
                <option value="B1">Catégorie B1 (Taxis / Transports Urbains)</option>
                <option value="C">Catégorie C (Véhicules Utilitaires / Marchandises)</option>
                <option value="D">Catégorie D (Poids Lourds / Bus de transport)</option>
              </select>
              
              {/* Category info label */}
              <div className="mt-2 bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex items-start gap-2">
                <Layers className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-normal font-sans">
                  {category === 'A' && 'Deux roues léger. Validité : 12 mois. Donne droit à +10 points de fidélité par visite.'}
                  {category === 'B' && 'Véhicule de tourisme courant. Validité : 12 mois. Donne droit à +15 points de fidélité par visite.'}
                  {category === 'B1' && 'Transport collectif périodique urbain. Validité : 6 mois réglementairement. Donne droit à +20 points de fidélité par visite.'}
                  {category === 'C' && 'Utilitaire professionnel de transport de marchandises. Validité : 6 mois d\'inspection obligatoire. Donne droit à +25 points.'}
                  {category === 'D' && 'Poids lourds de transport ou bus d\'entreprise. Validité : 6 mois. Exige des tests de freinage spécifiques. +30 points.'}
                </p>
              </div>
            </div>

            {/* Notification messages */}
            {statusMsg.text && (
              <div className={`p-3.5 rounded-xl text-xs border ${
                statusMsg.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                  : 'bg-amber-50 border-amber-100 text-amber-800'
              }`}>
                {statusMsg.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!formIsFormValid}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold text-sm transition-all hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
            >
              <Car className="h-4 w-4" />
              Ajouter au Garage
            </button>

          </form>
        </div>

        {/* Existing Vehicles List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
            <h3 className="font-display font-bold text-slate-805 text-sm uppercase tracking-wider flex items-center gap-2 mb-4">
              <Car className="h-4.5 w-4.5 text-blue-600" />
              Véhicules enregistrés ({vehicles.length})
            </h3>

            {vehicles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vehicles.map((veh) => {
                  return (
                    <div 
                      key={veh.immatriculation} 
                      className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl hover:border-slate-205 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Plate banner */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-xs font-bold bg-white text-slate-800 border border-slate-200 px-2.5 py-1 rounded shadow-3xs">
                            {veh.immatriculation}
                          </span>
                          <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            veh.daysLeft <= 10 
                              ? 'bg-red-50 text-red-700 border border-red-100' 
                              : veh.daysLeft <= 30 
                              ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            Cat. {veh.vehicleType}
                          </span>
                        </div>

                        {/* Timing details */}
                        <div className="space-y-1 text-xs text-slate-600 mb-4">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Dernier passage:</span>
                            <span className="font-mono">{veh.lastInspectionDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Échéance visite:</span>
                            <span className="font-mono font-bold text-slate-700">{veh.nextInspectionDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Expiry alerts indicators */}
                      <div className={`p-2 rounded-lg border flex items-center gap-2 text-[10px] sm:text-xs ${
                        veh.daysLeft <= 10
                          ? 'bg-red-50/60 border-red-100 text-red-900'
                          : veh.daysLeft <= 30
                          ? 'bg-amber-50/60 border-amber-100 text-amber-900'
                          : 'bg-emerald-50/60 border-emerald-100 text-emerald-900'
                      }`}>
                        {veh.daysLeft <= 10 ? (
                          <ShieldAlert className="h-4 w-4 text-red-650 shrink-0" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                        )}
                        <span className="font-semibold select-none leading-none">
                          {veh.daysLeft < 0 
                            ? 'Alerte Expiré' 
                            : veh.daysLeft <= 30 
                            ? `Alerte sous ${veh.daysLeft} jours !` 
                            : 'Statut de visite intègre'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
                <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Car className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700">Aucun véhicule enregistré</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                    Veuillez soumettre le formulaire d'ajout pour lancer le suivi calendaire de votre premier véhicule.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 p-3.5 rounded-xl bg-blue-50/50 border border-blue-50 text-slate-600 text-[11px] leading-relaxed flex items-start gap-2.5">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Remarque de conformité :</strong> Tout nouveau véhicule enregistré bénéficie automatiquement d'un premier examen enregistré dans notre système. Les relances par SMS et courriel s'activent 30 jours avant la date d'échéance.
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
