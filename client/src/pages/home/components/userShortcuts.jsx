//Components
import { ShortcutButton } from "./";

//Icons
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

function UserShortcuts() {
  return (
    <div className="flex w-full justify-center gap-3">
      <ShortcutButton address="/queueRegistration">
        <PlaylistAddIcon fontSize="large" />
        <span className="text-md font-bold">Criar nova senha</span>
      </ShortcutButton>
      <ShortcutButton address="/tokensList">
        <FormatListBulletedIcon fontSize="large" />
        <span className="text-md font-bold">Lista de senhas</span>
      </ShortcutButton>
    </div>
  );
}

export default UserShortcuts;
