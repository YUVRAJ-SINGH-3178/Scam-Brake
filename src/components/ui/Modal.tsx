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
        className="fixed inset-0 bg-[#171A1F]/40 backdrop-blur-[1px] transition-opacity duration-200"
        style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered Modal Container */}
      <div
        className={`relative bg-[#FFFFFF] border border-[#DFE2DF] rounded-[6px] shadow-lg w-full ${maxWidth} overflow-hidden transform transition-[transform,opacity] duration-200`}
        style={{
          transformOrigin: 'center',
          transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DFE2DF] flex items-center justify-between bg-[#F6F6F3]">
          <div>
            <h3
              id="modal-title"
              className="text-[15px] font-semibold text-[#171A1F] leading-snug"
            >
              {title}
            </h3>
            {subtitle && (
              <p className="text-[12px] text-[#525860] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[4px] text-[#697078] hover:text-[#171A1F] hover:bg-[#FFFFFF] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
