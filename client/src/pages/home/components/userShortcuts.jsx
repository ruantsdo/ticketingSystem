//Components
import { ShortcutButton } from "./";

//Icons
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

function UserShortcuts({ children }) {
  return (
    <>
      <ShortcutButton address="/queueRegistration">
        <PlaylistAddIcon fontSize="large" />
        <text className="text-md font-bold">Criar nova senha</text>
      </ShortcutButton>
      <ShortcutButton address="/tokensList">
        <FormatListBulletedIcon fontSize="large" />
        <text className="text-md font-bold">Lista de senhas</text>
      </ShortcutButton>
    </>
  );
}

export default UserShortcuts;
