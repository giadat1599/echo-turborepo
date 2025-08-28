import { OrganizationList } from '@clerk/nextjs';

export function OrgSelectionView() {
  return (
    <OrganizationList
      afterCreateOrganizationUrl="/"
      afterSelectOrganizationUrl="/"
      skipInvitationScreen
    />
  );
}
