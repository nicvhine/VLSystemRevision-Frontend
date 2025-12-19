import { ReactNode } from "react";
import HeadAuthWrapper from "./headAuthWrapper";

interface HeadLayoutProps {
  children: ReactNode;
}

export default function HeadLayout({ children }: HeadLayoutProps) {
  return <HeadAuthWrapper>{children}</HeadAuthWrapper>;
}
