'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Payment, RiskLevel, AuthorizationStatus } from '@/types';
import { RiskBadge, AuthStatusBadge, InterventionBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface PaymentTableProps {
  payments: Payment[];
  onSelectPayment: (payment: Payment) => void;
  selectedPaymentId?: string;
}

export const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  onSelectPayment,
  selectedPaymentId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AuthorizationStatus>('ALL');
  const [sortField, setSortField] = useState<'createdAt' | 'amount' | 'riskScore'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const handleSort = (field: 'createdAt' | 'amount' | 'riskScore') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        const matchesSearch =
          searchTerm === '' ||
          p.paymentReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.merchantName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRisk = riskFilter === 'ALL' || p.riskLevel === riskFilter;
        const matchesStatus = statusFilter === 'ALL' || p.authorizationStatus === statusFilter;

        return matchesSearch && matchesRisk && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'amount') {
          comp = a.amount - b.amount;
        } else if (sortField === 'riskScore') {
          comp = a.riskScore - b.riskScore;
        } else {
          comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [payments, searchTerm, riskFilter, statusFilter, sortField, sortDirection]);

  const paginatedPayments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, page]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));

  return (
    <div className="space-y-4">
      {/* Control Strip: Search & Filter Chips */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by reference, customer name, merchant, or item..."
            className="w-full h-9 pl-9 pr-3 text-[13px] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#2D5BFF] text-[#1E1E2A] placeholder-[#9CA3AF]"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span className="text-[#6B7280] font-medium mr-1">Risk:</span>
          {(['ALL', 'CRITICAL', 'HIGH', 'LOW'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setRiskFilter(lvl);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                riskFilter === lvl
                  ? 'bg-[#1E1E2A] text-white font-medium'
                  : 'bg-[#F8F9FB] border border-[#E5E7EB] text-[#4B5563] hover:bg-[#E5E7EB]'
              }`}
            >
              {lvl}
            </button>
          ))}

          <span className="text-[#6B7280] font-medium ml-2 mr-1">Status:</span>
          {(['ALL', 'HOLD_ACTIVE', 'CAPTURED', 'VOIDED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#1E1E2A] text-white font-medium'
                  : 'bg-[#F8F9FB] border border-[#E5E7EB] text-[#4B5563] hover:bg-[#E5E7EB]'
              }`}
            >
              {st === 'ALL' ? 'ALL' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Structured Financial Data Table */}
      <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="bg-[#FAFAFC] border-b border-[#E5E7EB] text-[#6B7280] font-medium">
                <th className="py-3 px-4 w-32">Payment Ref</th>
                <th className="py-3 px-4">Merchant & Product</th>
                <th className="py-3 px-4">Customer</th>
                <th
                  className="py-3 px-4 text-right cursor-pointer select-none hover:text-[#1E1E2A]"
                  onClick={() => handleSort('amount')}
                >
                  <div className="inline-flex items-center gap-1 justify-end">
                    <span>Authorized Amount</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer select-none hover:text-[#1E1E2A]"
                  onClick={() => handleSort('riskScore')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>Risk Level</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4">Authorization</th>
                <th className="py-3 px-4">Intervention</th>
                <th
                  className="py-3 px-4 cursor-pointer select-none hover:text-[#1E1E2A]"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>Timestamp</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-3 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#6B7280]">
                    No payments found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p) => {
                  const isSelected = p.id === selectedPaymentId;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => onSelectPayment(p)}
                      className={`hover:bg-[#F8F9FB] transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#2D5BFF]/5 font-medium' : ''
                      }`}
                    >
                      {/* 1. Payment Ref */}
                      <td className="py-3.5 px-4 font-mono font-medium text-[#2D5BFF]">
                        {p.paymentReference}
                      </td>

                      {/* 2. Merchant & Product */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#1E1E2A]">{p.productName}</div>
                        <div className="text-[11px] text-[#6B7280]">{p.merchantName}</div>
                      </td>

                      {/* 3. Customer */}
                      <td className="py-3.5 px-4">
                        <div className="text-[#1E1E2A]">{p.customer.name}</div>
                        <div className="text-[11px] text-[#6B7280] font-mono">
                          {p.customer.maskedPhone}
                        </div>
                      </td>

                      {/* 4. Authorized Amount (Right-aligned, tabular figures) */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#1E1E2A]">
                        ${p.amount.toFixed(2)}
                      </td>

                      {/* 5. Risk Level */}
                      <td className="py-3.5 px-4">
                        <RiskBadge level={p.riskLevel} score={p.riskScore} />
                      </td>

                      {/* 6. Auth Status */}
                      <td className="py-3.5 px-4">
                        <AuthStatusBadge status={p.authorizationStatus} />
                      </td>

                      {/* 7. Intervention Status */}
                      <td className="py-3.5 px-4">
                        <InterventionBadge status={p.interventionStatus} />
                      </td>

                      {/* 8. Timestamp */}
                      <td className="py-3.5 px-4 text-[12px] text-[#6B7280] whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        •{' '}
                        {new Date(p.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* 9. Action Button */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPayment(p);
                          }}
                          className="p-1 rounded text-[#6B7280] hover:text-[#2D5BFF] hover:bg-[#2D5BFF]/10 transition-colors cursor-pointer"
                          aria-label={`View details for ${p.paymentReference}`}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="px-4 py-3 bg-[#FAFAFC] border-t border-[#E5E7EB] flex items-center justify-between text-[12px] text-[#6B7280]">
          <div>
            Showing <span className="font-medium text-[#1E1E2A]">{paginatedPayments.length}</span> of{' '}
            <span className="font-medium text-[#1E1E2A]">{filteredPayments.length}</span> payments
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="font-mono px-2">
              {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
