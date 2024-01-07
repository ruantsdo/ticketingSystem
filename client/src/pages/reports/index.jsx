//React
import { useState, useMemo, useEffect } from "react";

//Components
import { FullContainer } from "../../components/";

//NextUi
import {
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

//Services
import api from "../../services/api";

function Reports() {
  const [avaliableBackups, setAvaliableBackups] = useState([]);
  // eslint-disable-next-line
  const [itemKey, setItemKey] = useState();

  const [page, setPage] = useState(1);
  const rowsPerPage = 4;
  const pages = Math.ceil(avaliableBackups.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return avaliableBackups.slice(start, end);
    // eslint-disable-next-line
  }, [page, avaliableBackups]);

  const findIndexById = (key) => {
    for (let i = 0; i < avaliableBackups.length; i++) {
      // eslint-disable-next-line
      if (avaliableBackups[i].id == key) {
        getTableData(i);
        setItemKey(i);
        return i;
      }
    }
  };

  const getAvaliableBackups = async () => {
    try {
      const response = await api.get("/checkBackups");
      setAvaliableBackups(response.data);
    } catch (error) {
      console.log("Falha ao obter lista de backups!");
      console.log(error);
    }
  };

  const getTableData = async (key) => {
    const response = await api.get(
      `/getBackupData/${avaliableBackups[key].name}`
    );
    console.log(response.data);
  };

  useEffect(() => {
    getAvaliableBackups();
  }, []);

  return (
    <FullContainer>
      <Table
        aria-label="Lista backups disponíveis"
        onRowAction={(key) => {
          findIndexById(key);
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
          <TableColumn key="name">NOME</TableColumn>
        </TableHeader>
        <TableBody
          items={items}
          emptyContent={
            !avaliableBackups ? (
              <Spinner size="lg" label="Carregando..." color="primary" />
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
    </FullContainer>
  );
}

export default Reports;
