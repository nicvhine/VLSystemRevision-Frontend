import ManagerClientLayout from './managerClientLayout';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function ManagerLayout({ children }: Props) {
  return <ManagerClientLayout>{children}</ManagerClientLayout>;
}
