//Components
import { RedirectButton } from "../../";
//Icons
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";

function AdmShortcuts() {
  return (
    <div className="flex w-full justify-center gap-3">
      <RedirectButton
        isIconOnly={true}
        address="/home"
        label="Ir a página home"
      >
        <HomeIcon fontSize="large" />
      </RedirectButton>
      <RedirectButton
        isIconOnly={true}
        address="/user/management"
        label="Ir a página de usuários"
      >
        <ManageAccountsIcon fontSize="large" />
      </RedirectButton>
      <RedirectButton
        isIconOnly={true}
        address="/service/management"
        label="Ir a página de serviços"
      >
        <AddHomeWorkIcon fontSize="large" />
      </RedirectButton>
      <RedirectButton
        isIconOnly={true}
        address="/location/management"
        label="Ir a página de locais"
      >
        <AddLocationIcon fontSize="large" />
      </RedirectButton>
      <RedirectButton
        isIconOnly={true}
        address="/tokensList"
        label="Ir a página fichas disponíveis"
      >
        <FormatListBulletedIcon fontSize="large" />
      </RedirectButton>
      <RedirectButton
        isIconOnly={true}
        address="/reports"
        label="Ir a página de relatórios"
      >
        <AssessmentIcon fontSize="large" />
      </RedirectButton>
      <RedirectButton
        isIconOnly={true}
        address="/settings"
        label="Ir a página de configurações"
      >
        <SettingsIcon fontSize="large" />
      </RedirectButton>
    </div>
  );
}

export default AdmShortcuts;
