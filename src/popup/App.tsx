import { AppProvider, useAppContext } from "./context/AppContext";
import { BottomNav } from "./components/BottomNav";
import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AnalyzePage } from "./pages/AnalyzePage";
import { ResultPage } from "./pages/ResultPage";
import { Page } from "@/types/enums";

function PageRenderer() {
  const { currentPage } = useAppContext();

  switch (currentPage) {
    case Page.Settings:
      return <SettingsPage />;
    case Page.Profile:
      return <ProfilePage />;
    case Page.Analyze:
      return <AnalyzePage />;
    case Page.Result:
      return <ResultPage />;
    default: {
      const exhaustive: never = currentPage;
      throw new Error(`Unknown page: ${exhaustive}`);
    }
  }
}

function AppShell() {
  const { currentPage, navigateTo } = useAppContext();

  return (
    <div className="flex flex-col bg-gray-900 text-white" style={{ minHeight: "580px", width: "420px" }}>
      <main className="flex-1 overflow-y-auto pb-14">
        <PageRenderer />
      </main>
      <BottomNav activePage={currentPage} onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
