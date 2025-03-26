import { useState } from "react";
import { useLocation } from "wouter";
import { CURRENCY_OPTIONS, MAIN_NAVIGATION_ITEMS, REPORT_NAVIGATION_ITEMS, SETTINGS_NAVIGATION_ITEMS } from "@/lib/constants";
import { Select } from "@/components/ui/select";

interface TopNavProps {
  toggleSidebar: () => void;
}

const TopNav = ({ toggleSidebar }: TopNavProps) => {
  const [location] = useLocation();
  const [selectedCurrency, setSelectedCurrency] = useState("TRY");
  
  // Find the current page title based on location
  const getCurrentPageTitle = () => {
    const allItems = [...MAIN_NAVIGATION_ITEMS, ...REPORT_NAVIGATION_ITEMS, ...SETTINGS_NAVIGATION_ITEMS];
    const currentItem = allItems.find(item => item.href === location);
    return currentItem ? currentItem.label : "Pano";
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex items-center">
          <button 
            id="sidebar-toggle" 
            className="text-neutral-600 mr-4 md:hidden"
            onClick={toggleSidebar}
          >
            <i className="fas fa-bars"></i>
          </button>
          <div className="text-lg font-medium">{getCurrentPageTitle()}</div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="text-neutral-600 hover:text-primary">
              <i className="fas fa-bell"></i>
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-danger"></span>
            </button>
          </div>
          
          <div className="relative">
            <select 
              className="appearance-none bg-transparent pr-8 py-1 text-sm font-medium focus:outline-none"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              {CURRENCY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <i className="fas fa-chevron-down absolute right-0 top-1/2 transform -translate-y-1/2 text-xs"></i>
          </div>
          
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mr-2">
              <span className="text-sm font-medium">AY</span>
            </div>
            <div className="text-sm font-medium">Ahmet Yılmaz</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
