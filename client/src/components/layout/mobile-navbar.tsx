import { Menu } from "lucide-react";

interface MobileNavbarProps {
  setMobileMenuOpen: (open: boolean) => void;
}

const MobileNavbar = ({ setMobileMenuOpen }: MobileNavbarProps) => {
  return (
    <div className="md:hidden fixed w-full z-10 bg-white border-b border-neutral-300">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="text-neutral-600 hover:text-neutral-900 focus:outline-none" 
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-lg font-semibold text-[#0078D4]">Muhaseb Sistemi</h1>
        </div>
        <div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
            AY
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavbar;
