//React
import { useContext, useEffect, useState } from "react";

//Components
import { Container, AdmShortcuts, UserShortcuts } from "./components";

//Contexts
import AuthContext from "../../contexts/auth";

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

function Home() {
  const { currentUser } = useContext(AuthContext);
  const { getAllServices } = useServicesStore();
  const { filterTokensByUser } = useTokensStore();

  const [loadingGraph, setLoadingGraph] = useState(true);
  const [graphData, setGraphData] = useState(null);

  const handleGetInfo = async () => {
    const tokens = await filterTokensByUser(currentUser.id);
    const services = await getAllServices();

    generateGraphData(tokens, services);
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

  useEffect(() => {
    handleGetInfo();
    // eslint-disable-next-line
  }, []);

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
      </div>
    </Container>
  );
}

export default Home;
