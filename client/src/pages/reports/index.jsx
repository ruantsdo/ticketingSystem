//React
import { useState, useEffect } from "react";

//Components
import { Button, FullContainer, Select } from "../../components/";
import {
  BackUpsModal,
  TokensTable,
  TokensDetails,
  SelectItems,
} from "./components";

//NextUi
import { CircularProgress, SelectItem, Input } from "@nextui-org/react";

//Graphics
import Graph01 from "./components/graphics/graphic01";
import Graph02 from "./components/graphics/graphic02";

//Hooks
import useGetRoutes from "../../Hooks/getUserInfos";
import { handleGenerateReport } from "../../Hooks/generateReportXLXS";

//Icons
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import DownloadIcon from "@mui/icons-material/Download";

//Toast
import { toast } from "react-toastify";

//Models
import { headers } from "./components/models/reportHeaders";

function Reports() {
  const { getAllServices } = useGetRoutes();

  const [services, setServices] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [originalTokens, setOriginalTokens] = useState(null);

  const [backupsModalIsOpen, setBackupsModalIsOpen] = useState(true);

  const [tableComponent, setTableComponent] = useState();

  const [GraphComponent01, setGraphComponent01] = useState();
  const [GraphComponent02, setGraphComponent02] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [loadMenssage, setLoadMessage] = useState(
    "Aguardando input de dados..."
  );

  const [tokensAreDefined, setTokensAreDefined] = useState(false);

  const [tokenDetailisOpen, setTokenDetailisOpen] = useState(false);
  const [targetToken, setTargetToken] = useState();

  const [searchValue, setSearchValue] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const [sheetName, setSheetName] = useState("completo");

  const defineServices = async () => {
    const services = await getAllServices();

    setServices(services);
  };

  const defineTargetToken = (id) => {
    setTargetToken(tokens[id]);
    setTokenDetailisOpen(true);
  };

  const generateGraphData = () => {
    const serviceCount = {};
    const serviceTypeCount = [
      { Nome: "PRIORIDADE", Quantidade: 0 },
      { Nome: "NORMAL", Quantidade: 0 },
    ];

    tokens.forEach((token) => {
      const service = services.find((service) => service.id === token.service);
      if (service) {
        if (!serviceCount[service.name]) {
          serviceCount[service.name] = {
            name: service.name,
            Quantidade: 0,
            Atendidos: 0,
            Aguardando: 0,
            Adiados: 0,
            "Em atendimento": 0,
            Disponibilidade: service.limit === 0 ? "Ilimitado" : service.limit,
          };
        }

        if (token.status === "CONCLUIDO") {
          serviceCount[service.name].Atendidos++;
        } else if (token.status === "EM ATENDIMENTO") {
          serviceCount[service.name]["Em atendimento"]++;
        } else if (token.status === "ADIADO") {
          serviceCount[service.name].Adiados++;
        } else {
          serviceCount[service.name].Aguardando++;
        }

        if (token.priority === 1) {
          serviceTypeCount[0].Quantidade++;
        } else {
          serviceTypeCount[1].Quantidade++;
        }

        serviceCount[service.name].Quantidade++;
      }
    });

    const finalResult = Object.values(serviceCount).map((service) => ({
      ...service,
      Disponibilidade:
        service.Disponibilidade === "Ilimitado"
          ? "Ilimitado"
          : service.Disponibilidade - service.Quantidade,
    }));

    const data01 = Object.values(finalResult);
    setGraphComponent01(<Graph01 graphData={data01} />);

    const data02 = Object.values(serviceTypeCount);
    setGraphComponent02(<Graph02 graphData={data02} />);

    setIsLoading(false);
  };

  const filterTokens = () => {
    if (searchValue !== "" && searchFilter !== "") {
      const filteredTokens = tokens.filter((token) => {
        const filterValue = token[searchFilter];

        if (searchFilter === "service") {
          const foundService = services.find(
            (service) => service.name === searchValue
          );
          return foundService ? foundService.id : null;
        } else if (searchFilter === "priority") {
          const upperCaseSearchValue = searchValue.toUpperCase();

          if (upperCaseSearchValue === "NORMAL") {
            return token.priority === 0;
          } else if (upperCaseSearchValue === "PRIORIDADE") {
            return token.priority === 1;
          }
        } else if (searchFilter === "status") {
          const upperCaseSearchValue = removeAccents(searchValue.toUpperCase());

          return (
            typeof filterValue === "string" &&
            removeAccents(filterValue.toUpperCase()).includes(
              upperCaseSearchValue
            )
          );
        } else if (
          typeof filterValue === "string" &&
          filterValue.includes(searchValue)
        ) {
          return true;
        }

        return false;
      });

      setTokens(filteredTokens);
      generateSheetName();
    } else {
      toast.info("Ambos os campos devem ser preenchidos");
    }
  };

  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const generateSheetName = () => {
    const filterNames = {
      service: `por serviço (${searchValue})`,
      created_by: `senhas criadas por (${searchValue})`,
      requested_by: `senhas solicitadas por (${searchValue})`,
      solved_by: `senhas concluídas por (${searchValue})`,
      delayed_by: `senhas adiadas por (${searchValue})`,
      priority: `por prioridade (${searchValue})`,
      status: `por status (${searchValue})`,
    };

    const defaultFilterName = `outro filtro (${searchValue})`;

    setSheetName(filterNames[searchFilter] || defaultFilterName);
  };

  const handleCreateReport = async () => {
    const content = tokens.map((item) => {
      const service = services.find((service) => service.id === item.service);
      const serviceName = service
        ? service.name
        : "Nome do Serviço Não Encontrado";

      return {
        ID: item.id,
        POSIÇÃO: item.position,
        SERVIÇO: serviceName,
        PRIORIDADE: item.priority === 1 ? "Prioridade" : "Normal",
        "SOLICITADO POR": item.requested_by,
        "CRIADO POR": item.created_by,
        "CRIADO EM": item.created_at,
        "RESOLVIDO POR": item.solved_by,
        "RESOLVIDO EM": item.solved_at,
        "ATRASADO POR": item.delayed_by,
        "ATRASADO EM": item.delayed_at,
        STATUS: item.status,
        DESCRIÇÃO: item.description,
      };
    });

    await handleGenerateReport({ headers, content, sheetName });
  };

  useEffect(() => {
    defineServices();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (tokensAreDefined === true) {
      if (!originalTokens) {
        setOriginalTokens(tokens);
      }
      setLoadMessage("Processando dados...");
      generateGraphData();
    }

    setTableComponent(
      <TokensTable
        tokens={tokens}
        services={services}
        defineTargetToken={defineTargetToken}
        setBackupsModalIsOpen={setBackupsModalIsOpen}
      />
    );
    // eslint-disable-next-line
  }, [tokens]);

  return (
    <FullContainer className="min-h-screen gap-3">
      <div className="flex flex-row w-full h-fit justify-around items-center pr-2 pl-2">
        <Input
          size="sm"
          variant="faded"
          className="w-[40%]"
          type="text"
          label="Buscar por..."
          name="searchValue"
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <Select
          size="sm"
          items={SelectItems}
          label="Filtrar por"
          placeholder="Indique o filtro desejado"
          className="sm:max-w-xs border-none shadow-none w-[30%]"
          variant="faded"
          onSelectionChange={(key) => {
            setSearchFilter(key.currentKey);
          }}
        >
          {SelectItems.map((item) => (
            <SelectItem key={item.value}>{item.placeholder}</SelectItem>
          ))}
        </Select>
        <Button
          onPress={() => filterTokens()}
          mode="success"
          className="w-fit"
          endContent={<SearchIcon />}
        >
          Buscar
        </Button>
        <Button
          onPress={() => handleCreateReport()}
          className="w-fit bg-info"
          endContent={<DownloadIcon />}
        >
          Gerar planilha
        </Button>
        <Button
          onPress={() => {
            if (tokensAreDefined === true) {
              setTokens(originalTokens);
            }
          }}
          className="w-fit bg-alert"
          endContent={<FilterAltOffIcon />}
        >
          Remover filtros
        </Button>
      </div>
      <div className="flex flex-row w-[100%] h-fit items-center justify-around">
        {tableComponent}
        {isLoading ? (
          <CircularProgress label={loadMenssage} color="primary" />
        ) : (
          <div className="w-[25%] h-[100%]">{GraphComponent02}</div>
        )}
      </div>
      <div className="flex flex-col w-[99%] h-fit items-center justify-around">
        {isLoading ? (
          <CircularProgress label={loadMenssage} color="primary" />
        ) : (
          <>{GraphComponent01}</>
        )}
        <TokensDetails
          tokenDetailisOpen={tokenDetailisOpen}
          setTokenDetailisOpen={setTokenDetailisOpen}
          token={targetToken}
          services={services}
        />
        <BackUpsModal
          setTokens={setTokens}
          setTokensAreDefined={setTokensAreDefined}
          setBackupsModalIsOpen={setBackupsModalIsOpen}
          backupsModalIsOpen={backupsModalIsOpen}
        />
      </div>
    </FullContainer>
  );
}

export default Reports;
