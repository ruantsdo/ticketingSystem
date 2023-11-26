const menuItems = [
  {
    name: "Gerenciar usuários",
    color: "foreground",
    address: "/newUser",
  },
  {
    name: "Gerenciar serviços",
    color: "foreground",
    address: "/service/register",
  },
  {
    name: "Gerenciar setores",
    color: "foreground",
    address: "/location/register",
  },
  {
    name: "Adicionar uma nova ficha",
    color: "foreground",
    address: "/queueRegistration",
  },
  {
    name: "Lista de fichas",
    color: "foreground",
    address: "/tokensList",
  },
  {
    name: "Tela de chamada (Padrão)",
    color: "foreground",
    address: "/tokenCall/default",
  },
  {
    name: "Tela de chamada (Alternativo)",
    color: "foreground",
    address: "/tokenCall/alternative",
  },
];

export default menuItems;
