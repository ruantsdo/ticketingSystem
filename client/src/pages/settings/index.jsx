//Components
import VideoManagement from "./components/videos";
import { NavBar, Notification } from "../../components";
//NextUi
import { Tabs, Tab } from "@nextui-org/tabs";
//Icons
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";

function Settings() {
  return (
    <div
      className="flex flex-col w-screen min-h-screen bg-background dark:bg-darkBackground text-textColor
                       dark:text-darkTextColor items-center transition-all overflow-auto"
    >
      <Notification />
      <NavBar />
      <div className="w-full">
        <Tabs
          aria-label="Options"
          color="primary"
          variant="bordered"
          className="flex pb-5 pt-5"
        >
          <Tab
            key="videos"
            title={
              <div className="flex items-center space-x-2">
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
