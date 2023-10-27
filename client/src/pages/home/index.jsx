//React
import { useState } from "react";

//Socket
import * as socketIOClient from "socket.io-client";

//Components
import Container from "../../components/container";
import NavBar from "../../components/navbar";

//NextUI
import {} from "@nextui-org/react";

//Configs
import { myIp, port } from "../../services/api";

function Home() {
  const [queueItems, setQueueItems] = useState([]);

  const onNewQueueItem = (newQueueItem) => {
    setQueueItems([...queueItems, newQueueItem]);
  };

  //const socket = socketIOClient.io(`http://${myIp}:${port}`);

  //socket.connect();

  //socket.on("newQueueItem", onNewQueueItem);

  return (
    <>
      <NavBar />
      <Container>
        {queueItems.map((queueItem) => (
          <div key={queueItem.id}>
            {queueItem.id} - {queueItem.name}
          </div>
        ))}
      </Container>
    </>
  );
}

export default Home;
