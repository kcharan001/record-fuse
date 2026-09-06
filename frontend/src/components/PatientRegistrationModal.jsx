import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import PatientRegistrationForm from './PatientRegistrationForm';

export default function PatientRegistrationModal({ onPatientSaved }) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePatientSaved = () => {
    if (onPatientSaved) {
      onPatientSaved();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-sm"
        title="Add New Patient / Encounter"
      >
        <UserPlus className="w-4 h-4" />
        <span>Add Patient</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto my-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors z-10"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            <PatientRegistrationForm
              onPatientSaved={handlePatientSaved}
            />
          </div>
        </div>
      )}
    </>
  );
}
