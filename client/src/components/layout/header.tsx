import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onClickNew?: () => void;
  newButtonText?: string;
  showNewButton?: boolean;
  showSearch?: boolean;
}

const Header = ({ 
  title, 
  subtitle, 
  onClickNew, 
  newButtonText = "Yeni İşlem", 
  showNewButton = true,
  showSearch = true
}: HeaderProps) => {
  return (
    <header className="hidden md:flex h-16 border-b border-neutral-300 bg-white">
      <div className="flex-1 px-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-700">{title}</h2>
          {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
        </div>
        <div className="flex items-center">
          {showNewButton && (
            <Button 
              onClick={onClickNew} 
              variant="outline" 
              className="mr-4 border-[#0078D4] text-[#0078D4] hover:bg-[#0078D4] hover:text-white"
            >
              <span className="flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                {newButtonText}
              </span>
            </Button>
          )}
          {showSearch && (
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Ara..." 
                className="pl-9"
              />
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
