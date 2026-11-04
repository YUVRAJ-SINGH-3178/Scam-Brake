'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'w-full md:w-[480px]',
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
      className="fixed inset-0 z-50 overflow-hidden"
      aria-labelledby="drawer-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with 250ms ease-out */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250"
        style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`${width} bg-[#FFFFFF] border-l border-[#E5E7EB] shadow-2xl flex flex-col h-full transform transition-transform duration-300`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', // --ease-drawer
          }}
        >
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FAFAFC]">
            <div>
              <h2
                id="drawer-title"
                className="text-[16px] font-semibold text-[#1E1E2A] leading-snug"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-[12px] text-[#6B7280] mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#6B7280] hover:text-[#1E1E2A] hover:bg-[#E5E7EB]/60 transition-colors cursor-pointer"
              aria-label="Close detail drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
