//Components
import { RedirectButton } from "../../../components";

//Icons
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

function UserShortcuts() {
  return (
    <div className="flex w-full justify-center gap-3">
      <RedirectButton address="/queueRegistration">
        <PlaylistAddIcon fontSize="large" />
        <span className="text-md font-bold">Criar nova senha</span>
      </RedirectButton>
      <RedirectButton address="/tokensList">
        <FormatListBulletedIcon fontSize="large" />
        <span className="text-md font-bold">Lista de senhas</span>
      </RedirectButton>
    </div>
  );
}

export default UserShortcuts;
