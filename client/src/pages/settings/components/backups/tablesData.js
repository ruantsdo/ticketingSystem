//Icons
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import HistoryIcon from "@mui/icons-material/History";

const tablesData = [
  {
    table: "users",
    label: "Usuários",
    icon: <PersonIcon />,
  },
  {
    table: "services",
    label: "Serviços",
    icon: <HomeWorkIcon />,
  },
  {
    table: "locations",
    label: "Locais",
    icon: <LocationOnIcon />,
  },
  {
    table: "tokens",
    label: "Fichas",
    icon: <BackupTableIcon />,
  },
  {
    table: "historic",
    label: "Histórico",
    icon: <HistoryIcon />,
  },
];

export default tablesData;
