'use client';

import { useState } from 'react';
import { Avatar, StatusBadge } from '@/components/common';
import { Button } from '@/components/common';
import { Admin, AdminStatus } from '@/types/(super-admin)/admin';

interface AdminRowProps {
  admin: Admin;
  tenantName: string;
  tenantColor: string;
  onToggleStatus: (id: string) => void;
  onEdit: (admin: Admin) => void;
  onDelete: (id: string) => void;
}

export function AdminRow({
  admin,
  tenantName,
  tenantColor,
  onToggleStatus,
  onEdit,
  onDelete,
}: AdminRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <tr className="border-b border-border hover:bg-page/50 transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar
            name={admin.name}
            initials={admin.avatarInitials}
            size="sm"
            className={tenantColor}
          />
          <div>
            <p className="font-medium text-text-primary">{admin.name}</p>
            <p className="text-xs text-text-secondary">{admin.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-sm text-text-secondary">{tenantName}</span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <StatusBadge status={admin.role} size="sm" />
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <StatusBadge status={admin.status} size="sm" />
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-sm text-text-secondary">{admin.lastLogin}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="relative flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(admin.id)}
          >
            {admin.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg hover:bg-page transition-colors"
          >
            ⋯
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-lg border border-border bg-surface shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    onEdit(admin);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-page transition-colors"
                >
                  Edit Role
                </button>
                <button
                  onClick={() => {
                    onDelete(admin.id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger-bg transition-colors"
                >
                  Remove Admin
                </button>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
