//React
import { useContext, useEffect, useState } from "react";

//Components
import { Container, AdmShortcuts, UserShortcuts } from "./components";
import Graph01 from "./components/graphic01";
import Graph02 from "../reports/components/graphics/graphic02";

//Contexts
import AuthContext from "../../contexts/auth";
import { useWebSocket } from "../../contexts/webSocket";

//Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

//NextUi
import { CircularProgress, Card } from "@nextui-org/react";

//Stores
import { useServicesStore, useTokensStore } from "../../stores";
import { toast } from "react-toastify";

function Home() {
  const { socket } = useWebSocket();

  const { currentUser } = useContext(AuthContext);
  const { getAllServices } = useServicesStore();
  const { filterTokensByUser } = useTokensStore();

  const [loadingGraph, setLoadingGraph] = useState(true);
  const [graphData, setGraphData] = useState(null);

  const [GraphComponent01, setGraphComponent01] = useState();
  const [GraphComponent02, setGraphComponent02] = useState();

  const handleGetInfo = async () => {
    const tokens = await filterTokensByUser(currentUser.id);
    const services = await getAllServices();

    generateGraphData(tokens, services);
    generateSecondaryGraphData(tokens);
  };

  function generateGraphData(tokens, services) {
    const serviceCount = {};

    if (tokens && services) {
      tokens.forEach((token) => {
        const service = services.find(
          (service) => service.id === token.service
        );
        if (service) {
          if (!serviceCount[service.name]) {
            serviceCount[service.name] = {
              name: service.name,
              Quantidade: 0,
              Atendidos: 0,
              Aguardando: 0,
              Adiados: 0,
              "Em atendimento": 0,
              Disponibilidade:
                service.limit === 0 ? "Ilimitado" : service.limit,
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

      setGraphData(finalResult);
      setLoadingGraph(false);
    }
  }

  const generateSecondaryGraphData = (tokens) => {
    const serviceTypeCount = [
      { Nome: "PRIORIDADE", Quantidade: 0 },
      { Nome: "NORMAL", Quantidade: 0 },
    ];
    const serviceStatusCount = [
      { Nome: "ATENDIDOS", Quantidade: 0 },
      { Nome: "AGUARDANDO", Quantidade: 0 },
      { Nome: "EM ATENDIMENTO", Quantidade: 0 },
      { Nome: "ADIADOS", Quantidade: 0 },
    ];

    if (tokens) {
      tokens.forEach((token) => {
        if (token.status === "CONCLUIDO") {
          serviceStatusCount[0].Quantidade++;
        } else if (token.status === "EM ATENDIMENTO") {
          serviceStatusCount[2].Quantidade++;
        } else if (token.status === "ADIADO") {
          serviceStatusCount[3].Quantidade++;
        } else if (token.status === "EM ESPERA") {
          serviceStatusCount[1].Quantidade++;
        }

        if (token.priority === 1) {
          serviceTypeCount[0].Quantidade++;
        } else {
          serviceTypeCount[1].Quantidade++;
        }
      });

      setGraphComponent01(
        <Card className="flex w-2/12 bg-cardBackground transition-all">
          <Graph02 graphData={serviceTypeCount} />
        </Card>
      );

      setGraphComponent02(
        <Card className="flex w-3/12 bg-cardBackground transition-all">
          <Graph01 graphData={serviceStatusCount} />
        </Card>
      );
    }
  };

  useEffect(() => {
    handleGetInfo();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket.on("new_token", () => {
      handleGetInfo();
    });

    socket.on("midNight", () => {
      toast.warning("A sessão atual será limpa e atualizada em 5 segundos!");
      setTimeout(() => {
        localStorage.removeItem("currentSession");
        window.location.reload(true);
      }, 5000);
    });

    return () => {
      socket.off("new_token");
      socket.off("midNight");
    };
  });

  return (
    <Container>
      <div className="p-4">
        <div className="mb-4">
          <div className="flex flex-row gap-2 justify-center">
            {currentUser.permission_level > 3 ? (
              <AdmShortcuts />
            ) : (
              <UserShortcuts />
            )}
          </div>
        </div>
        <div>
          <h3 className="text-2xl mb-2">Resumo Geral</h3>
          <Card className="flex bg-cardBackground  transition-all">
            <div className="flex w-full items-center justify-center">
              {loadingGraph ? (
                <CircularProgress
                  label="Processando dados..."
                  color="primary"
                  className="mt-32"
                />
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height={350}
                  className="text-textColor"
                >
                  <BarChart
                    data={graphData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="2 2" />
                    <XAxis dataKey="name" stroke="black" />
                    <YAxis stroke="black" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="Quantidade"
                      stackId="a"
                      fill="#ffc658"
                      maxBarSize={100}
                    />
                    <Bar
                      dataKey="Disponibilidade"
                      stackId="a"
                      fill="#82ca9d"
                      maxBarSize={100}
                    />
                    <Bar
                      dataKey="Atendidos"
                      stackId="b"
                      fill="#2C931F"
                      maxBarSize={100}
                    />
                    <Bar
                      dataKey="Aguardando"
                      stackId="b"
                      fill="#008EDB"
                      maxBarSize={100}
                    />
                    <Bar
                      dataKey="Adiados"
                      stackId="b"
                      fill="#FF6254"
                      maxBarSize={100}
                    />
                    <Bar
                      dataKey="Em atendimento"
                      stackId="b"
                      fill="#A946A0"
                      maxBarSize={100}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
        <div className="flex flex-row gap-5 mt-5">
          {GraphComponent01}
          {GraphComponent02}
        </div>
      </div>
    </Container>
  );
}

export default Home;
