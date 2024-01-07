//Components
import { ShortcutButton } from "./";

//Icons
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

function AdmShortcuts({ children }) {
  return (
    <>
      <ShortcutButton address="/user/management">
        <ManageAccountsIcon fontSize="large" />
        <span className="text-md font-bold">Gerenciar Usuários</span>
      </ShortcutButton>
      <ShortcutButton address="/service/management">
        <AddHomeWorkIcon fontSize="large" />
        <span className="text-md font-bold">Gerenciar Serviços</span>
      </ShortcutButton>
      <ShortcutButton address="/location/management">
        <AddLocationIcon fontSize="large" />
        <span className="text-md font-bold">Gerenciar Locais</span>
      </ShortcutButton>
      <ShortcutButton address="/tokensList">
        <FormatListBulletedIcon fontSize="large" />
        <span className="text-md font-bold">Lista de senhas</span>
      </ShortcutButton>
      <ShortcutButton address="/reports">
        <AssessmentIcon fontSize="large" />
        <span className="text-md font-bold">Relatórios</span>
      </ShortcutButton>
    </>
  );
}

export default AdmShortcuts;
