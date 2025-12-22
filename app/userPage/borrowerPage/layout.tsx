import { ReactNode } from "react";
import BorrowerAuthWrapper from "./borrowerAuthWrapper";

interface HeadLayoutProps {
  children: ReactNode;
}

export default function HeadLayout({ children }: HeadLayoutProps) {
  return <BorrowerAuthWrapper>{children}</BorrowerAuthWrapper>;
}
