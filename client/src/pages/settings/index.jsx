//Components
import VideoManagement from "./components/videos";
import AuthSettings from "./components/auth";
import TokenCallSettings from "./components/tokenCall";
import Maintenance from "./components/maintenance";
import { NavBar, Notification } from "../../components";
//NextUi
import { Tabs, Tab } from "@nextui-org/tabs";
//Icons
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import SecurityIcon from "@mui/icons-material/Security";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import SettingsIcon from "@mui/icons-material/Settings";

function Settings() {
  return (
    <div className="flex flex-col w-screen min-h-screen bg-background dark:bg-darkBackground items-center transition-all overflow-auto">
      <Notification />
      <NavBar />
      <div className="flex flex-col w-full">
        <Tabs
          aria-label="Options"
          color="primary"
          variant="solid"
          className="flex mt-5 self-center border-1 rounded-xl border-darkBackground dark:border-background shadow-lg"
        >
          <Tab
            key="auth"
            title={
              <div className="flex items-center space-x-2 text-textColor dark:text-darkTextColor">
                <SecurityIcon />
                <span>Autenticação</span>
              </div>
            }
          >
            <AuthSettings />
          </Tab>
          <Tab
            key="tokenCall"
            title={
              <div className="flex items-center space-x-2 text-textColor dark:text-darkTextColor">
                <AccessibilityIcon />
                <span>Tela de chamado</span>
              </div>
            }
          >
            <TokenCallSettings />
          </Tab>
          <Tab
            key="settings"
            title={
              <div className="flex items-center space-x-2 text-textColor dark:text-darkTextColor">
                <SettingsIcon />
                <span>Manutenção</span>
              </div>
            }
          >
            <Maintenance />
          </Tab>
          <Tab
            key="videos"
            title={
              <div className="flex items-center space-x-2 text-textColor dark:text-darkTextColor">
                <OndemandVideoIcon />
                <span>Videos</span>
              </div>
            }
          >
            <VideoManagement />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

export default Settings;
