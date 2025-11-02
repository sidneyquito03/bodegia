import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-60">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
