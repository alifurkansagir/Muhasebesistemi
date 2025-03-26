import { useState } from "react";
import Sidebar from "./sidebar";
import TopNav from "./top-nav";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-200">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        {/* Top Navigation */}
        <TopNav toggleSidebar={toggleSidebar} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-neutral-200 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
