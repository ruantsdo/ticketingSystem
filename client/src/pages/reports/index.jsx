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

function Reports() {
  const { getAllServices } = useGetRoutes();

  const [services, setServices] = useState([]);
  const [tokens, setTokens] = useState([]);

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

  const defineServices = async () => {
    const services = await getAllServices();

    setServices(services);
  };

  const defineTargetToken = (id) => {
    setTargetToken(tokens[id]);
    setTokenDetailisOpen(true);
  };

  function generateGraphData() {
    const serviceCount = {};

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

    const typeData = [
      { Nome: "PRIORIDADE", Quantidade: finalResult[1]?.Quantidade || 0 },
      { Nome: "NORMAL", Quantidade: finalResult[0]?.Quantidade || 0 },
    ];

    const data02 = Object.values(typeData);
    setGraphComponent02(<Graph02 graphData={data02} />);

    setIsLoading(false);
  }

  useEffect(() => {
    defineServices();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (tokensAreDefined === true) {
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
      <div className="flex flex-row w-full h-fit justify-around pr-5 pl-5">
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
          className="mb-1 sm:max-w-xs border-none shadow-none"
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
          onPress={() => alert("Clicou")}
          mode="success"
          className="w-[10%]"
        >
          Buscar
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
