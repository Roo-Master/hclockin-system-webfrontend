'use client';

import { useState } from 'react';

interface Plan {
  id: string;
  name: string;
  code: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  isActive: boolean;
  description?: string;
}

interface PlanSelectorProps {
  plans: Plan[];
  currentPlanId?: string;
  onSelectPlan?: (planId: string) => void;
  isLoading?: boolean;
}

export function PlanSelector({ 
  plans, 
  currentPlanId, 
  onSelectPlan,
  isLoading = false 
}: PlanSelectorProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(currentPlanId);

  const handleSelect = (planId: string) => {
    setSelectedPlanId(planId);
    onSelectPlan?.(planId);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map((plan) => {
        const isSelected = selectedPlanId === plan.id;
        const isCurrent = currentPlanId === plan.id;

        return (
          <div
            key={plan.id}
            className={`bg-white rounded-xl border p-6 shadow-sm transition-all cursor-pointer ${
              isSelected 
                ? 'border-[#2563EB] ring-2 ring-[#DBEAFE]' 
                : 'border-[#E5E7EB] hover:border-[#2563EB]/50'
            }`}
            onClick={() => handleSelect(plan.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#111827]">{plan.name}</h3>
              {isCurrent && (
                <span className="px-2 py-0.5 bg-[#DBEAFE] text-[#2563EB] rounded text-xs font-medium">
                  Current
                </span>
              )}
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-[#111827]">
                ${plan.priceMonthly}
              </span>
              <span className="text-[#6B7280] text-sm">/month</span>
            </div>
            <p className="text-sm text-[#6B7280] mb-4">
              ${plan.priceYearly}/year (save 20%)
            </p>
            <ul className="space-y-2 text-sm">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-[#6B7280]">
                  <span className="text-[#16A34A]">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={`mt-6 w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                isSelected && !isCurrent
                  ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                  : isCurrent
                  ? 'bg-[#F5F6FA] text-[#6B7280] cursor-default'
                  : 'bg-white border border-[#E5E7EB] text-[#111827] hover:bg-[#F5F6FA]'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isCurrent) handleSelect(plan.id);
              }}
            >
              {isCurrent ? 'Current Plan' : isSelected ? 'Select This Plan' : 'Compare'}
            </button>
          </div>
        );
      })}
    </div>
  );
}