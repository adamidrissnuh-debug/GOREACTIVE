import React from 'react';
import { motion } from 'motion/react';
import { Trash2 } from 'lucide-react';

interface ClearHistoryModalProps {
  isOpen: boolean;
  appLanguage: string;
  onClear: () => void;
  onClose: () => void;
}

export const ClearHistoryModal: React.FC<ClearHistoryModalProps> = ({ 
  isOpen,
  appLanguage, 
  onClear, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
  >
    <motion.div 
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl"
    >
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
        <Trash2 size={32} />
      </div>
      
      <h2 className="text-xl font-black text-[var(--text-primary)] italic uppercase mb-2">
        {appLanguage === 'en' ? 'Clear History?' : 'Effacer l\'historique ?'}
      </h2>
      <p className="text-xs text-[var(--text-secondary)] font-bold mb-8 leading-relaxed px-4">
        {appLanguage === 'en' 
          ? 'This action is irreversible. All your past training data will be permanently deleted.' 
          : 'Cette action est irréversible. Toutes tes données d\'entraînement passées seront définitivement supprimées.'}
      </p>
      
      <div className="flex flex-col gap-3">
        <button 
          onClick={onClear}
          className="w-full py-4 bg-red-500 text-white font-black uppercase italic rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95 transition-all"
        >
          {appLanguage === 'en' ? 'Yes, Delete' : 'Oui, Supprimer'}
        </button>
        <button 
          onClick={onClose}
          className="w-full py-4 bg-[var(--text-primary)]/5 text-[var(--text-secondary)] font-black uppercase italic rounded-2xl hover:bg-[var(--text-primary)]/10 active:scale-95 transition-all"
        >
          {appLanguage === 'en' ? 'Cancel' : 'Annuler'}
        </button>
      </div>
    </motion.div>
  </motion.div>
  );
};
