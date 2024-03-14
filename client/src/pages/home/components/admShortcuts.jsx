//Components
import { RedirectButton } from "../../../components";

//Icons
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

function AdmShortcuts() {
  return (
    <div className="flex w-full justify-center gap-3">
      <RedirectButton address="/user/management">
        <ManageAccountsIcon fontSize="large" />
        <span className="text-md font-bold">Gerenciar Usuários</span>
      </RedirectButton>
      <RedirectButton address="/service/management">
        <AddHomeWorkIcon fontSize="large" />
        <span className="text-md font-bold">Gerenciar Serviços</span>
      </RedirectButton>
      <RedirectButton address="/location/management">
        <AddLocationIcon fontSize="large" />
        <span className="text-md font-bold">Gerenciar Locais</span>
      </RedirectButton>
      <RedirectButton address="/tokensList">
        <FormatListBulletedIcon fontSize="large" />
        <span className="text-md font-bold">Lista de senhas</span>
      </RedirectButton>
      <RedirectButton address="/reports">
        <AssessmentIcon fontSize="large" />
        <span className="text-md font-bold">Relatórios</span>
      </RedirectButton>
    </div>
  );
}

export default AdmShortcuts;
