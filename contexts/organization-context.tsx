'use client';

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import type { Organization } from '@/types';
import { getOrganizationById } from '@/lib/organization-service';

interface OrganizationContextValue {
  organization: Organization;
  isLoading: boolean;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

interface OrganizationProviderProps {
  organizationId: string;
  children: ReactNode;
}

export function OrganizationProvider({ organizationId, children }: OrganizationProviderProps) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const org = getOrganizationById(organizationId);
    setOrganization(org);
    setIsLoading(false);
  }, [organizationId]);

  // useMemoでコンテキスト値をメモ化
  const value = useMemo<OrganizationContextValue | null>(() => {
    if (!organization) {
      return null;
    }
    return {
      organization,
      isLoading,
    };
  }, [organization, isLoading]);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (!value) {
    throw new Error(`団体が見つかりません: ${organizationId}`);
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganizationはOrganizationProviderの中で使用する必要があります');
  }
  return context;
}
