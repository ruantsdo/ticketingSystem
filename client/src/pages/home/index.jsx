//React
import { useContext, useEffect, useState } from "react";

//Components
import { Container, AdmShortcuts, UserShortcuts } from "./components";

//Contexts
import AuthContext from "../../contexts/auth";

//Hooks
import useGetRoutes from "../../Hooks/getUserInfos";

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
import { CircularProgress } from "@nextui-org/react";

function Home() {
  const { currentUser } = useContext(AuthContext);
  const { defineFilteredTokens, getAllServices } = useGetRoutes();

  const [loadingGraph, setLoadingGraph] = useState(true);
  const [graphData, setGraphData] = useState(null);

  const handleGetInfo = async () => {
    const tokens = await defineFilteredTokens();
    const services = await getAllServices();

    generateGraphData(tokens, services);
  };

  function generateGraphData(tokens, services) {
    const serviceCount = {};

    tokens.forEach((token) => {
      const service = services.find((service) => service.id === token.service);
      if (service) {
        if (!serviceCount[service.name]) {
          serviceCount[service.name] = {
            name: service.name,
            Quantidade: 0,
            Atendidos: 0,
            Limite: service.limit === 0 ? "Ilimitado" : service.limit,
          };
        }

        if (token.status === "CONCLUIDO") {
          serviceCount[service.name].Atendidos++;
        }

        serviceCount[service.name].Quantidade++;
      }
    });

    const finalResult = Object.values(serviceCount).map((service) => ({
      ...service,
      Restante:
        service.Limite === "Ilimitado"
          ? "Ilimitado"
          : service.Limite - service.Quantidade,
    }));

    setGraphData(finalResult);
    setLoadingGraph(false);
  }

  useEffect(() => {
    handleGetInfo();
    // eslint-disable-next-line
  }, []);

  return (
    <Container>
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-4xl">Olá, {currentUser.name}</h1>
        </div>
        <div className="mb-4">
          <h3 className="text-2xl mb-2">Atalhos</h3>
          <div className="flex flex-row gap-2">
            {currentUser.permission_level > 3 ? (
              <AdmShortcuts />
            ) : (
              <UserShortcuts />
            )}
          </div>
        </div>
        <div>
          <h3 className="text-2xl mb-2">Resumo Geral</h3>
          {loadingGraph ? (
            <CircularProgress label="Processando dados..." color="primary" />
          ) : (
            <ResponsiveContainer width="50%" height={350}>
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
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Quantidade" stackId="a" fill="#ffc658" />
                <Bar dataKey="Restante" stackId="a" fill="#82ca9d" />
                <Bar dataKey="Atendidos" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Container>
  );
}

export default Home;
