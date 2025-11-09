import { OrganizationProvider } from '@/contexts/organization-context';
import type { ReactNode } from 'react';
import { use } from 'react';

interface OrganizationLayoutProps {
  children: ReactNode;
  params: Promise<{ org: string }>;
}

/**
 * 組織レイアウト
 *
 * URLパラメータから組織IDを取得し、OrganizationProviderで子コンポーネントをラップする。
 * これにより、配下のすべてのページでuseOrganization()を使用できる。
 */
export default function OrganizationLayout({ children, params }: OrganizationLayoutProps) {
  const { org } = use(params);

  return (
    <OrganizationProvider organizationId={org}>
      {children}
    </OrganizationProvider>
  );
}
