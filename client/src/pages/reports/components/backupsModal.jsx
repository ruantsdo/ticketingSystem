//React
import { useState, useMemo, useEffect } from "react";

//NextUi
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  getKeyValue,
  Spinner,
} from "@nextui-org/react";

//Components
import { Divider, Button } from "../../../components";

//Services
import api from "../../../services/api";

function BackUpsModal({ ...props }) {
  const {
    setTokens,
    setTokensAreDefined,
    setBackupsModalIsOpen,
    backupsModalIsOpen,
    setOriginalTokens,
  } = props;

  const [availableBackups, setAvailableBackups] = useState([]);

  const [page, setPage] = useState(1);
  const rowsPerPage = 4;
  const pages = Math.ceil(availableBackups.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return availableBackups.slice(start, end);
    // eslint-disable-next-line
  }, [page, availableBackups]);

  const findIndexById = (key) => {
    for (let i = 0; i < availableBackups.length; i++) {
      // eslint-disable-next-line
      if (availableBackups[i].id == key) {
        getTableData(i);
        return;
      }
    }
  };

  const getAvailableBackups = async () => {
    try {
      const response = await api.get("/checkBackups");
      setAvailableBackups(response.data);
    } catch (error) {
      console.log("Falha ao obter lista de backups!");
      console.log(error);
    }
  };

  const getTableData = async (key) => {
    const response = await api.get(
      `/getBackupData/${availableBackups[key].name}`
    );
    setTokens(response.data);
    setOriginalTokens(response.data);
    setBackupsModalIsOpen(false);
    setTokensAreDefined(true);
  };

  useEffect(() => {
    getAvailableBackups();
  }, []);

  return (
    <>
      <Modal isOpen={backupsModalIsOpen} hideCloseButton={true} backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col text-xl text-center">
                Selecione um backup!
              </ModalHeader>
              <Divider />
              <ModalBody className="flex flex-col text-center">
                <Table
                  isStriped
                  hideHeader
                  removeWrapper
                  aria-label="Lista backups disponíveis"
                  onRowAction={(key) => {
                    findIndexById(key);
                  }}
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
                  className="w-full"
                >
                  <TableHeader>
                    <TableColumn key="name">NOME</TableColumn>
                  </TableHeader>
                  <TableBody
                    items={items}
                    emptyContent={
                      !availableBackups ? (
                        <Spinner
                          size="lg"
                          label="Carregando..."
                          color="primary"
                        />
                      ) : (
                        <div className="flex flex-col text-sm">
                          <Spinner
                            size="sm"
                            color="success"
                            label="Não há backups disponíveis no momento..."
                          />
                          Atualize a página para buscar por atualizações...
                        </div>
                      )
                    }
                  >
                    {(item) => (
                      <TableRow
                        key={item.id}
                        className="hover:cursor-pointer hover:opacity-90 hover:ring-2 rounded-lg hover:shadow-md hover:scale-[101%] transition-all"
                      >
                        {(columnKey) => (
                          <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ModalBody>
              <Divider />
              <ModalFooter>
                <Button
                  mode="failed"
                  onPress={() => {
                    setBackupsModalIsOpen(false);
                  }}
                >
                  Fechar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default BackUpsModal;
