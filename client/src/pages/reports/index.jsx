//React
import { useState, useEffect } from "react";
//Components
import { Button, FullContainer, Select } from "../../components/";
import {
  BackUpsModal,
  TokensTable,
  TokensDetails,
  SelectItems,
  DatePickerModal,
} from "./components";
//NextUi
import { CircularProgress, SelectItem, Input, Card } from "@nextui-org/react";
//Graphics
import Graph01 from "./components/graphics/graphic01";
import Graph02 from "./components/graphics/graphic02";
//Hooks
import getDataHooks from "../../Hooks/getData";
import { handleGenerateReport } from "../../Hooks/generateReportXLXS";
//Icons
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import DownloadIcon from "@mui/icons-material/Download";
//Toast
import { toast } from "react-toastify";
//Models
import { headers } from "./components/models/reportHeaders";
//TimePicker
import moment from "moment";
import "moment/locale/pt-br";
//Providers
import { useConfirmIdentity } from "../../providers/confirmIdentity";

function Reports() {
  const { getHistoric } = getDataHooks();
  const { requestAuth } = useConfirmIdentity();

  const currentDate = moment();
  const defaultStartDate = currentDate.startOf("day").toDate();
  const defaultEndDate = currentDate.endOf("day").toDate();
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [pickerIsOpen, setPickerIsOpen] = useState(false);
  const [pickerFilter, setPickerFilter] = useState(null);
  const [datePickerSelectPlaceHolder, setDatePickerSelectPlaceHolder] =
    useState(null);

  const [tokens, setTokens] = useState([]);
  const [originalTokens, setOriginalTokens] = useState(null);

  const [backupsModalIsOpen, setBackupsModalIsOpen] = useState(false);

  const [tableComponent, setTableComponent] = useState();

  const [GraphComponent01, setGraphComponent01] = useState();
  const [GraphComponent02, setGraphComponent02] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [loadMessage, setLoadMessage] = useState(
    "Aguardando input de dados..."
  );

  const [tokensAreDefined, setTokensAreDefined] = useState(false);

  const [tokenDetailIsOpen, setTokenDetailIsOpen] = useState(false);
  const [targetToken, setTargetToken] = useState();

  const [searchValue, setSearchValue] = useState("");
  const [searchFilter, setSearchFilter] = useState(null);
  const [searchFilterPlaceHolder, setSearchFilterPlaceHolder] = useState(null);

  const [sheetName, setSheetName] = useState("completo");
  const [sheetNameDate, setSheetNameDate] = useState("");

  const getTokens = async () => {
    try {
      const response = await getHistoric();

      if (response) {
        setOriginalTokens(response);
        setTokens(response);

        setTokensAreDefined(true);
      } else {
        setLoadMessage("Não há dados para serem exibidos...");
      }
    } catch (error) {
      console.error("Get tokens error...");
      console.error(error);
    }
  };

  const defineTargetToken = (id) => {
    setTargetToken(tokens[id]);
    setTokenDetailIsOpen(true);
  };

  const generateGraphData = () => {
    const serviceCount = {};
    const serviceTypeCount = [
      { Nome: "PRIORIDADE", Quantidade: 0 },
      { Nome: "NORMAL", Quantidade: 0 },
    ];

    if (tokens) {
      tokens.forEach((token) => {
        if (!serviceCount[token.service]) {
          serviceCount[token.service] = {
            name: token.service,
            Quantidade: 0,
            Atendidos: 0,
            Aguardando: 0,
            Adiados: 0,
            "Encerrados pelo sistema": 0,
          };
        }

        if (token.status === "CONCLUIDO") {
          serviceCount[token.service].Atendidos++;
        } else if (token.status === "EM ATENDIMENTO") {
          serviceCount[token.service]["Em atendimento"]++;
        } else if (token.status === "ADIADO") {
          serviceCount[token.service].Adiados++;
        } else {
          serviceCount[token.service]["Encerrados pelo sistema"]++;
        }

        if (token.priority === 1) {
          serviceTypeCount[0].Quantidade++;
        } else {
          serviceTypeCount[1].Quantidade++;
        }

        serviceCount[token.service].Quantidade++;
      });

      const finalResult = Object.values(serviceCount).map((service) => ({
        ...service,
      }));

      const data01 = Object.values(finalResult);
      setGraphComponent01(
        <Card className="flex w-full bg-cardBackground transition-all">
          <Graph01 graphData={data01} />
        </Card>
      );

      const data02 = Object.values(serviceTypeCount);
      setGraphComponent02(<Graph02 graphData={data02} />);
    }

    setIsLoading(false);
  };

  const filterTokens = () => {
    if (searchValue !== "" && searchFilter !== "") {
      const upperCaseSearchValue = removeAccents(searchValue.toUpperCase());

      const filteredTokens = tokens.filter((token) => {
        const filterValue = token[searchFilter];

        if (searchFilter === "service") {
          return token.service.toUpperCase() === upperCaseSearchValue;
        } else if (searchFilter === "priority") {
          if (searchValue.toUpperCase() === "NORMAL") {
            return token.priority === 0;
          } else if (searchValue.toUpperCase() === "PRIORIDADE") {
            return token.priority === 1;
          }
        } else if (searchFilter === "status") {
          if (
            upperCaseSearchValue === "ENCERRADO PELO SISTEMA" ||
            upperCaseSearchValue === "ENCERRADOS PELO SISTEMA"
          ) {
            return (
              typeof filterValue === "string" &&
              removeAccents(filterValue.toUpperCase()).includes(
                "ENCERRADO PELO SISTEMA"
              )
            );
          } else if (
            upperCaseSearchValue === "ADIADO" ||
            upperCaseSearchValue === "ADIADOS"
          ) {
            return token.delayed_at !== null;
          } else if (searchFilter === "called_by") {
            return removeAccents(filterValue.toUpperCase()).includes(
              upperCaseSearchValue
            );
          } else {
            return (
              typeof filterValue === "string" &&
              removeAccents(filterValue.toUpperCase()).includes(
                upperCaseSearchValue
              )
            );
          }
        } else if (
          typeof filterValue === "string" &&
          filterValue.toUpperCase().includes(searchValue.toUpperCase())
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
      created_by: `de senhas criadas por (${searchValue})`,
      called_by: `de senhas chamadas por (${searchValue})`,
      requested_by: `de senhas solicitadas por (${searchValue})`,
      solved_by: `de senhas concluídas por (${searchValue})`,
      delayed_by: `de senhas adiadas por (${searchValue})`,
      priority: `por prioridade (${searchValue})`,
      status: `por status (${searchValue})`,
    };

    const defaultFilterName = `outro filtro (${searchValue})`;

    setSheetName(filterNames[searchFilter] || defaultFilterName);
  };

  const handleCreateReport = async () => {
    requestAuth(async (userLevel) => {
      if (userLevel < 4) {
        toast.warn("Este usuário não tem as permissões necessárias");
        return;
      }
      const content = tokens.map((item) => {
        return {
          ID: item.id,
          POSIÇÃO: item.position,
          SERVIÇO: item.service,
          PRIORIDADE: item.priority === 1 ? "Prioridade" : "Normal",
          "SOLICITADO POR": item.requested_by,
          "CRIADO POR": item.created_by,
          "CRIADO EM": item.created_at,
          "CHAMADO POR": item.called_by,
          "CHAMADO EM": item.called_at,
          "RESOLVIDO POR": item.solved_by,
          "RESOLVIDO EM": item.solved_at,
          "ATRASADO POR": item.delayed_by,
          "ATRASADO EM": item.delayed_at,
          DEFICIÊNCIAS: item.deficiencies,
          STATUS: item.status,
          DESCRIÇÃO: item.description,
        };
      });
      const finalSheetName = `${sheetName}${sheetNameDate}`;
      await handleGenerateReport({ headers, content, finalSheetName });
    });
  };

  const handleFilterTokensByDateInterval = () => {
    const filteredItems = tokens.filter((item) => {
      const itemDate = moment.utc(
        item[pickerFilter],
        "DD/MM/YYYY [às] HH:mm:ss"
      );

      const startDateUTC = moment.utc(startDate);
      const endDateUTC = moment.utc(endDate);

      const itemDateLocal = itemDate.format("YYYY-MM-DD HH:mm:ss");
      const startDateLocal = startDateUTC.local().format("YYYY-MM-DD HH:mm:ss");
      const endDateLocal = endDateUTC.local().format("YYYY-MM-DD HH:mm:ss");

      return moment(itemDateLocal).isBetween(
        startDateLocal,
        endDateLocal,
        null,
        "seconds"
      );
    });
    const startDateLocal = moment
      .utc(startDate)
      .local()
      .format("DD-MM-YYYY HH:mm:ss");
    const endDateLocal = moment
      .utc(endDate)
      .local()
      .format("DD-MM-YYYY HH:mm:ss");

    setSheetNameDate(` entre ${startDateLocal} e ${endDateLocal}`);

    setTokens(filteredItems);
  };

  const resetFilters = () => {
    setTokens(originalTokens);
    setPickerFilter(null);
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setSearchFilter(null);
    setSearchValue("");
    setSheetName("completo");
    setDatePickerSelectPlaceHolder([]);
    setSearchFilterPlaceHolder([]);
  };

  useEffect(() => {
    getTokens();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (tokensAreDefined === true) {
      setLoadMessage("Processando dados...");
      generateGraphData();
    }

    setTableComponent(
      <TokensTable
        tokens={tokens ? tokens : []}
        defineTargetToken={defineTargetToken}
        setBackupsModalIsOpen={setBackupsModalIsOpen}
        setPickerIsOpen={setPickerIsOpen}
      />
    );
    // eslint-disable-next-line
  }, [tokens]);

  return (
    <FullContainer className="min-h-screen gap-3">
      <div className="flex flex-row w-full h-fit justify-around items-center pr-2 pl-2">
        <Select
          size="sm"
          items={SelectItems}
          label="Filtrar por"
          placeholder="Indique o filtro desejado"
          className="sm:max-w-xs border-none shadow-none w-[30%]"
          variant="faded"
          selectedKeys={searchFilterPlaceHolder}
          disabledKeys={searchFilterPlaceHolder}
          onSelectionChange={(key) => {
            setSearchFilter(SelectItems[key.currentKey - 1].value);
            setSearchFilterPlaceHolder(key.currentKey);
          }}
        >
          {SelectItems.map((item) => (
            <SelectItem key={item.id}>{item.placeholder}</SelectItem>
          ))}
        </Select>
        <Input
          size="sm"
          variant="faded"
          className="w-[40%]"
          type="text"
          label="Buscar por..."
          name="searchValue"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

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
            resetFilters();
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
          <CircularProgress label={loadMessage} color="primary" />
        ) : (
          <div className="w-[25%] h-[100%]">{GraphComponent02}</div>
        )}
      </div>
      <div className="flex flex-col w-[99%] h-fit items-center justify-around">
        {isLoading ? (
          <CircularProgress label={loadMessage} color="primary" />
        ) : (
          <>{GraphComponent01}</>
        )}
      </div>
      <TokensDetails
        tokenDetailIsOpen={tokenDetailIsOpen}
        setTokenDetailIsOpen={setTokenDetailIsOpen}
        token={targetToken}
      />
      <BackUpsModal
        setTokens={setTokens}
        setTokensAreDefined={setTokensAreDefined}
        setBackupsModalIsOpen={setBackupsModalIsOpen}
        backupsModalIsOpen={backupsModalIsOpen}
        setOriginalTokens={setOriginalTokens}
      />
      <DatePickerModal
        pickerIsOpen={pickerIsOpen}
        setPickerIsOpen={setPickerIsOpen}
        handleFilterTokensByDateInterval={handleFilterTokensByDateInterval}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        pickerFilter={pickerFilter}
        setPickerFilter={setPickerFilter}
        setSelectPlaceHolder={setDatePickerSelectPlaceHolder}
        selectPlaceHolder={datePickerSelectPlaceHolder}
      />
    </FullContainer>
  );
}

export default Reports;
