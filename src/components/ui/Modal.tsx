'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-200"
        style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered Modal Container: Starts from scale(0.96) with opacity 0 (NEVER scale 0!) */}
      <div
        className={`relative bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl shadow-xl w-full ${maxWidth} overflow-hidden transform transition-all duration-200`}
        style={{
          transformOrigin: 'center', // Modals are exempt from trigger origin
          transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FAFAFC]">
          <div>
            <h3
              id="modal-title"
              className="text-[16px] font-semibold text-[#1E1E2A] leading-snug"
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-[12px] text-[#6B7280] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#6B7280] hover:text-[#1E1E2A] hover:bg-[#E5E7EB]/60 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
