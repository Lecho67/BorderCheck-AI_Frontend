import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: string;
}

export function PageContainer({ children, maxWidth = "max-w-2xl" }: PageContainerProps) {
  return <main className={`${maxWidth} mx-auto px-6 py-10`}>{children}</main>;
}
