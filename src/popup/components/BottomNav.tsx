import { Page } from "@/types/enums";

interface NavItem {
  page: Page;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { page: Page.Settings, label: "Settings", icon: "⚙" },
  { page: Page.Profile, label: "Profile", icon: "👤" },
  { page: Page.Analyze, label: "Analyze", icon: "🔍" },
  { page: Page.Result, label: "Result", icon: "📄" },
];

interface BottomNavProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export function BottomNav({ activePage, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex border-t border-gray-700 bg-gray-900">
      {NAV_ITEMS.map(({ page, label, icon }) => {
        const isActive = activePage === page;
        return (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors
              ${isActive ? "text-blue-400 border-t-2 border-blue-400 -mt-px" : "text-gray-500 hover:text-gray-300"}
            `}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="text-base leading-none">{icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
