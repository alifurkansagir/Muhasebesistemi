import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { MAIN_NAVIGATION_ITEMS, REPORT_NAVIGATION_ITEMS, SETTINGS_NAVIGATION_ITEMS } from "@/lib/constants";

const Sidebar = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const sidebarToggle = document.getElementById("sidebar-toggle");
      
      if (sidebar && sidebarToggle && window.innerWidth < 768) {
        const isClickInsideSidebar = sidebar.contains(event.target as Node);
        const isClickOnToggle = sidebarToggle.contains(event.target as Node);
        
        if (!isClickInsideSidebar && !isClickOnToggle && isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div 
      id="sidebar" 
      className={`bg-white shadow-lg w-64 fixed h-full z-10 transition-all duration-300 ease-in-out transform ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="p-4 border-b border-neutral-300">
        <div className="flex items-center">
          <i className="fas fa-calculator text-primary text-2xl mr-3"></i>
          <h1 className="text-xl font-semibold text-primary">Muhaseb Sistemi</h1>
        </div>
      </div>
      
      <div className="py-2 overflow-y-auto h-full scrollbar-hide">
        <nav>
          <div className="px-4 py-2 text-sm font-medium text-neutral-400 uppercase">Ana Menü</div>
          
          {MAIN_NAVIGATION_ITEMS.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 ${
                location === item.href 
                  ? "text-primary bg-primary bg-opacity-10 border-l-4 border-primary" 
                  : "text-neutral-600 hover:bg-neutral-100 border-l-4 border-transparent"
              }`}
            >
              <i className={`fas fa-${item.icon} w-6`}></i>
              <span>{item.label}</span>
            </Link>
          ))}

          <Link 
            href="/payment-schedules"
            className={`flex items-center px-4 py-3 ${
              location === "/payment-schedules" 
                ? "text-primary bg-primary bg-opacity-10 border-l-4 border-primary" 
                : "text-neutral-600 hover:bg-neutral-100 border-l-4 border-transparent"
            }`}
          >
            <i className="fas fa-calendar-alt w-6"></i>
            <span>Ödeme Planları</span>
          </Link>
          
          <div className="px-4 py-2 mt-4 text-sm font-medium text-neutral-400 uppercase">Raporlar</div>
          
          {REPORT_NAVIGATION_ITEMS.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 ${
                location === item.href 
                  ? "text-primary bg-primary bg-opacity-10 border-l-4 border-primary" 
                  : "text-neutral-600 hover:bg-neutral-100 border-l-4 border-transparent"
              }`}
            >
              <i className={`fas fa-${item.icon} w-6`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
          
          <div className="px-4 py-2 mt-4 text-sm font-medium text-neutral-400 uppercase">Ayarlar</div>
          
          {SETTINGS_NAVIGATION_ITEMS.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 ${
                location === item.href 
                  ? "text-primary bg-primary bg-opacity-10 border-l-4 border-primary" 
                  : "text-neutral-600 hover:bg-neutral-100 border-l-4 border-transparent"
              }`}
            >
              <i className={`fas fa-${item.icon} w-6`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
