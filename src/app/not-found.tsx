'use client';

import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { ScamBrakeMark } from '@/components/brand/ScamBrakeMark';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#1E1E2A] flex flex-col items-center justify-center p-6 antialiased">
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded p-8 text-center space-y-6">
        <div className="flex justify-center">
          <ScamBrakeMark size={36} />
        </div>

        <div className="w-12 h-12 rounded-full bg-[#FAFAFC] border border-[#E5E7EB] flex items-center justify-center mx-auto text-[#6B7280]">
          <FileQuestion size={22} />
        </div>

        <div className="space-y-1.5">
          <div className="font-mono text-xs text-[#2D5BFF] font-semibold">404 NOT FOUND</div>
          <h1 className="text-xl font-semibold tracking-tight text-[#1E1E2A]">
            Page or Transaction Not Found
          </h1>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            The page, payment reference, or investigation record you requested cannot be located in the Scam Brake registry.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-2 bg-[#FAFAFC] border border-[#E5E7EB] hover:bg-[#FFFFFF] font-medium text-[#1E1E2A] rounded transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <Home size={13} />
            <span>Marketing Home</span>
          </Link>
          <Link
            href="/merchant"
            className="w-full sm:w-auto px-4 py-2 bg-[#2D5BFF] text-white hover:bg-[#2044C8] font-medium rounded transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <span>Merchant Ops</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
