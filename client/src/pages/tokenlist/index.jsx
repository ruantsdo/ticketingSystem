//React
import React, { useState, useEffect, useContext, useMemo } from "react";

//Components
import FullContainer from "../../components/fullContainer";

//NextUI
import {
  Button,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Chip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";

//Validation
//import { Formik, Form, useFormik } from "formik";

//Icons

//Services
import api from "../../services/api";

//Contexts
import AuthContext from "../../contexts/auth";
import { useWebSocket } from "../../contexts/webSocket";

function TokensList() {
  const { socket } = useWebSocket();

  const { currentUser } = useContext(AuthContext);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [page, setPage] = useState(1);
  const [tokensLength, setTokensLength] = useState(1);
  const [tokens, setTokens] = useState([]);
  const [itemKey, setItemKey] = useState();

  const rowsPerPage = 5;

  const pages = Math.ceil(tokensLength / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return tokens.slice(start, end);
  }, [page, tokens]);

  const handleTokens = async () => {
    try {
      const response = await api.get("/token/query");
      defineFilteredTokens(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const defineFilteredTokens = (data) => {
    if (
      currentUser.permission_level === 3 ||
      currentUser.permission_level === 2
    ) {
      const tokens = data.filter(
        (token) => token.sector === currentUser.sector
      );
      setTokens(tokens);
      setTokensLength(tokens.length);
    } else if (currentUser.permission_level >= 4) {
      setTokens(data);
      setTokensLength(data.length);
    }
  };

  const findIndexById = (key) => {
    for (let i = 0; i < tokensLength; i++) {
      // eslint-disable-next-line
      if (tokens[i].id == key) {
        setItemKey(i);
        return;
      }
    }
  };

  useEffect(() => {
    handleTokens();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket.on("new_token", () => {
      handleTokens();
    });

    return () => {
      socket.off("new_token");
    };
  });

  function emitSignalQueueUpdate(data) {
    socket.emit("queued_update", data);
  }

  return (
    <FullContainer>
      <Table
        aria-label="Lista de fichas disponiveis para o seu setor"
        onRowAction={(key) => {
          findIndexById(key);
          onOpen();
        }}
        isStriped
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              color="success"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
      >
        <TableHeader>
          <TableColumn>FICHA Nº</TableColumn>
          <TableColumn>SETOR</TableColumn>
          <TableColumn>SERVIÇO</TableColumn>
          <TableColumn>SOLICITADO POR</TableColumn>
          <TableColumn>PRIORIDADE</TableColumn>
        </TableHeader>
        <TableBody
          items={items}
          emptyContent={"Ainda não há fichas para o seu setor..."}
        >
          {(item) => (
            <TableRow
              key={item.id}
              className="hover:cursor-pointer hover:opacity-90 hover:border border-divider hover:shadow-md"
            >
              <TableCell>{item.position}</TableCell>
              <TableCell>{item.sector}</TableCell>
              <TableCell>{item.service}</TableCell>
              <TableCell>
                {item.requested_by !== ""
                  ? item.requested_by
                  : "Nome não fornecido"}
              </TableCell>
              <TableCell>
                {item.priority === 1 ? (
                  <Chip size="sm" radius="sm" className="bg-alert">
                    PRIORIDADE
                  </Chip>
                ) : (
                  <Chip size="sm" radius="sm" className="bg-success">
                    NORMAL
                  </Chip>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="opaque">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <section className="flex gap-3 justify-center items-center">
                  Dados da Ficha
                  {tokens[itemKey].priority === 1 ? (
                    <Chip size="sm" radius="sm" className="bg-alert">
                      PRIORIDADE
                    </Chip>
                  ) : (
                    <Chip size="sm" radius="sm" className="bg-success">
                      NORMAL
                    </Chip>
                  )}
                </section>
              </ModalHeader>
              <Divider />
              <ModalBody>
                <p>Número da ficha: {tokens[itemKey].position} </p>
                <p>Setor: {tokens[itemKey].sector}</p>
                <p>Serviço desejado: {tokens[itemKey].service}</p>
                <p>Ficha criada por: {tokens[itemKey].created_by}</p>
                {tokens[itemKey].requested_by !== "" ? (
                  <p>Ficha solicitada por: {tokens[itemKey].requested_by}</p>
                ) : (
                  <p>Ficha solicitada por: NÃO FOI ESPECIFICADO</p>
                )}
              </ModalBody>
              <Divider />
              <ModalFooter>
                <Button
                  className="bg-failed"
                  onPress={() => {
                    onClose();
                  }}
                >
                  Fechar
                </Button>
                <Button
                  onPress={() => {
                    onClose();
                    emitSignalQueueUpdate(tokens[itemKey]);
                  }}
                  className="bg-success"
                >
                  Chamar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </FullContainer>
  );
}

export default TokensList;
