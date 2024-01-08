//React
import { CircularProgress } from "@nextui-org/react";
import { useEffect, useState } from "react";

//Components
import Graph01 from "./graphics/graphic01";
import Graph02 from "./graphics/graphic02";

function TypesGraph({ ...props }) {
  const { tokens, services } = props;

  const [graphData01, setGraphData01] = useState(null);
  const [graphData02, setGraphData02] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

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

    setGraphData01(Object.values(finalResult));

    const typeData = [
      { Nome: "PRIORIDADE", Quantidade: finalResult[1]?.Quantidade || 0 },
      { Nome: "NORMAL", Quantidade: finalResult[0]?.Quantidade || 0 },
    ];

    setGraphData02(Object.values(typeData));

    setIsLoading(false);
  }

  useEffect(() => {
    generateGraphData();
    // eslint-disable-next-line
  }, [tokens]);

  return (
    <>
      {isLoading ? (
        <CircularProgress label="Processando dados..." color="primary" />
      ) : (
        <>
          <Graph01 graphData={graphData01} />
          <Graph02 graphData={graphData02} />
        </>
      )}
    </>
  );
}

export default TypesGraph;
