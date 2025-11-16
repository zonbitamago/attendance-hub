'use client';

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import { notFound } from 'next/navigation';
import type { Organization } from '@/types';
import { getOrganizationById } from '@/lib/organization-service';
import { setOrganizationContext } from '@/lib/supabase-storage';

interface OrganizationContextValue {
  organization: Organization;
  isLoading: boolean;
  error: Error | null;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

interface OrganizationProviderProps {
  organizationId: string;
  children: ReactNode;
}

export function OrganizationProvider({ organizationId, children }: OrganizationProviderProps) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOrganization = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // RLS: Supabaseに組織コンテキストを設定
        await setOrganizationContext(organizationId);

        const org = await getOrganizationById(organizationId);

        if (isMounted) {
          setOrganization(org);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setIsLoading(false);
        }
      }
    };

    fetchOrganization();

    return () => {
      isMounted = false;
    };
  }, [organizationId]);

  // useMemoでコンテキスト値をメモ化
  const value = useMemo<OrganizationContextValue | null>(() => {
    if (!organization) {
      return null;
    }
    return {
      organization,
      isLoading,
      error,
    };
  }, [organization, isLoading, error]);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return (
      <div>
        <p>エラーが発生しました: {error.message}</p>
      </div>
    );
  }

  if (!value) {
    // 団体が見つからない場合は404ページを表示
    notFound();
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
