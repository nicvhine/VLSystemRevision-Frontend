import ClientLayout from './clientLayout';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function LoanOfficerLayout({ children }: Props) {
  return <ClientLayout>{children}</ClientLayout>;
}
