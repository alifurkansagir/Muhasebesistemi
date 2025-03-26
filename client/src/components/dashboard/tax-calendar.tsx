import { Button } from "@/components/ui/button";
import { Link } from "wouter";

// Mock tax calendar data for display
const taxCalendarItems = [
  {
    id: 1,
    title: "KDV Beyannamesi",
    dueDate: "26 Mayıs",
    daysLeft: 16
  },
  {
    id: 2,
    title: "Muhtasar Beyanname",
    dueDate: "30 Mayıs",
    daysLeft: 20
  },
  {
    id: 3,
    title: "Gelir Vergisi",
    dueDate: "15 Haziran",
    daysLeft: 36
  }
];

const TaxCalendar = () => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-lg">Vergi Takvimi</h2>
        <Link href="/tax-reports">
          <Button variant="link" className="text-primary text-sm p-0 h-auto">
            Takvimi Gör
          </Button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {taxCalendarItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center border-b border-neutral-200 pb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-accent bg-opacity-10 flex items-center justify-center mr-3">
                <i className="fas fa-calendar-alt text-accent"></i>
              </div>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-neutral-500">Son Tarih: {item.dueDate}</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-accent bg-opacity-10 text-accent text-xs rounded">
              {item.daysLeft} gün kaldı
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaxCalendar;
