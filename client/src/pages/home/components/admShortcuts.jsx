//Components
import { ShortcutButton } from "./";

//Icons
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import AssessmentIcon from "@mui/icons-material/Assessment";

function AdmShortcuts({ children }) {
  return (
    <>
      <ShortcutButton address="/user/management">
        <ManageAccountsIcon fontSize="large" />
        <text className="text-md font-bold">Gerenciar Usuários</text>
      </ShortcutButton>
      <ShortcutButton address="/user/management">
        <AddHomeWorkIcon fontSize="large" />
        <text className="text-md font-bold">Gerenciar Serviços</text>
      </ShortcutButton>
      <ShortcutButton address="/user/management">
        <AddLocationIcon fontSize="large" />
        <text className="text-md font-bold">Gerenciar Locais</text>
      </ShortcutButton>
      <ShortcutButton address="/user/management">
        <AssessmentIcon fontSize="large" />
        <text className="text-md font-bold">Gerenciar Relatórios</text>
      </ShortcutButton>
    </>
  );
}

export default AdmShortcuts;
