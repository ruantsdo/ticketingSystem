//Components
import { RedirectButton } from "../../";

//Icons
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import HomeIcon from "@mui/icons-material/Home";

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
        address="/queueRegistration"
        label="Registrar uma nova ficha"
      >
        <PlaylistAddIcon fontSize="large" />
      </RedirectButton>
      <RedirectButton
        isIconOnly={true}
        address="/tokensList"
        label="Ver fichas disponíveis"
      >
        <FormatListBulletedIcon fontSize="large" />
      </RedirectButton>
    </div>
  );
}

export default AdmShortcuts;
