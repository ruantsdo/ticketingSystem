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
        <text className="text-md font-bold">Gerenciar Usuários</text>
      </ShortcutButton>
      <ShortcutButton address="/service/management">
        <AddHomeWorkIcon fontSize="large" />
        <text className="text-md font-bold">Gerenciar Serviços</text>
      </ShortcutButton>
      <ShortcutButton address="/location/management">
        <AddLocationIcon fontSize="large" />
        <text className="text-md font-bold">Gerenciar Locais</text>
      </ShortcutButton>
      <ShortcutButton address="/home">
        <AssessmentIcon fontSize="large" />
        <text className="text-md font-bold">Relatórios</text>
      </ShortcutButton>
      <ShortcutButton address="/queueRegistration">
        <FormatListBulletedIcon fontSize="large" />
        <text className="text-md font-bold">Lista de senhas</text>
      </ShortcutButton>
    </>
  );
}

export default AdmShortcuts;
