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

function Home() {
  const { currentUser } = useContext(AuthContext);
  const { defineFilteredTokens, getAllServices } = useGetRoutes();

  const [tokens, setTokens] = useState(null);
  const [services, setServices] = useState(null);

  const data = [
    {
      name: "Page A",
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: "Page B",
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: "Page C",
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: "Page D",
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: "Page E",
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: "Page F",
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: "Page G",
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

  const handleGetInfo = async () => {
    const tokens = await defineFilteredTokens();
    const services = await getAllServices();

    setTokens(tokens);
    setServices(services);

    contarItens(tokens, services);
  };

  function contarItens(tokens, services) {
    // Inicializa um objeto para armazenar as contagens
    const contagemPorServico = {};

    // Itera sobre o array de tokens
    tokens.forEach((token) => {
      // Procura o serviço correspondente no array de services
      const servico = services.find((service) => service.id === token.service);

      // Se o serviço existir
      if (servico) {
        // Inicializa a contagem para o serviço, se ainda não existir
        if (!contagemPorServico[servico.name]) {
          contagemPorServico[servico.name] = {
            name: servico.name,
            quantidade: 0,
            limite: servico.limit,
          };
        }

        // Incrementa a contagem para o serviço
        contagemPorServico[servico.name].quantidade++;
      }
    });

    // Converte o objeto de contagens para um array
    const resultadoFinal = Object.values(contagemPorServico).map((servico) => ({
      ...servico,
      restante: servico.quantidade - servico.limite,
    }));

    console.log(resultadoFinal);
    return resultadoFinal;
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
          <ResponsiveContainer width="50%" height={350}>
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pv" stackId="a" fill="#8884d8" />
              <Bar dataKey="amt" stackId="a" fill="#82ca9d" />
              <Bar dataKey="uv" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Container>
  );
}

export default Home;
