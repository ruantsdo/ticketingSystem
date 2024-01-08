//React
import { useState, useEffect } from "react";

//Components
import { FullContainer } from "../../components/";
import {
  BackUpsModal,
  TokensTable,
  TokensDetails,
  TypesGraph,
} from "./components";

//Hooks
import useGetRoutes from "../../Hooks/getUserInfos";

function Reports() {
  const { getAllServices } = useGetRoutes();
  const [services, setServices] = useState([]);
  const [tokens, setTokens] = useState([]);

  const [tableComponent, setTableComponent] = useState();

  const [tokenDetailisOpen, setTokenDetailisOpen] = useState(false);
  const [targetToken, setTargetToken] = useState();

  const defineServices = async () => {
    const services = await getAllServices();

    setServices(services);
  };

  const defineTargetToken = (id) => {
    setTargetToken(tokens[id]);
    setTokenDetailisOpen(true);
  };

  useEffect(() => {
    defineServices();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setTableComponent(
      <TokensTable
        tokens={tokens}
        services={services}
        defineTargetToken={defineTargetToken}
      />
    );
    // eslint-disable-next-line
  }, [tokens]);

  return (
    <FullContainer>
      <div className="flex flex-row w-screen h-fit items-center justify-center">
        {tableComponent}
        <TypesGraph />
      </div>
      <TokensDetails
        tokenDetailisOpen={tokenDetailisOpen}
        setTokenDetailisOpen={setTokenDetailisOpen}
        token={targetToken}
        services={services}
      />
      <BackUpsModal BackupsModalIsOpen={true} setTokens={setTokens} />
    </FullContainer>
  );
}

export default Reports;
