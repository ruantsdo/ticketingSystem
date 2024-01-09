//React
import { useState, useMemo } from "react";

//Components
import { Subtitle } from "./";

//NextUI
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Chip,
  Spinner,
} from "@nextui-org/react";

//Icons
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import PersonIcon from "@mui/icons-material/Person";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import AssistWalkerIcon from "@mui/icons-material/AssistWalker";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ReportIcon from "@mui/icons-material/Report";
import { Button } from "../../../components";

function TokensTable({ ...props }) {
  const { tokens, services, defineTargetToken, setBackupsModalIsOpen } = props;

  const [page, setPage] = useState(1);

  const rowsPerPage = 5;

  const pages = Math.ceil(tokens.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return tokens.slice(start, end);
  }, [page, tokens]);

  const findIndexById = (key) => {
    for (let i = 0; i < tokens.length; i++) {
      // eslint-disable-next-line
      if (tokens[i].id == key) {
        defineTargetToken(i);
        return;
      }
    }
  };

  return (
    <Table
      aria-label="Lista de fichas disponiveis para você"
      onRowAction={(key) => {
        findIndexById(key);
      }}
      isStriped
      bottomContent={
        <div className="flex flex-row w-full items-center justify-center">
          <Pagination
            isCompact
            showControls
            color="success"
            page={page}
            total={pages}
            onChange={(page) => setPage(page)}
          />

          <Button
            onPress={() => setBackupsModalIsOpen(true)}
            mode="success"
            className="w-fit right-4 absolute"
          >
            Selecionar um período
          </Button>
        </div>
      }
      classNames={{
        wrapper: "min-h-[222px]",
      }}
      className="w-[70%]"
    >
      <TableHeader>
        <TableColumn className="w-1/12">FICHA Nº</TableColumn>
        <TableColumn>SERVIÇO</TableColumn>
        <TableColumn className="hidden sm:flex sm:items-center h-11">
          SOLICITADO POR
        </TableColumn>
        <TableColumn className="w-2/12">
          <Subtitle />
        </TableColumn>
      </TableHeader>
      <TableBody
        items={items}
        emptyContent={
          tokens.length > 0 ? (
            <Spinner size="lg" label="Carregando..." color="primary" />
          ) : (
            <div className="flex flex-col text-sm">
              <Spinner
                size="sm"
                color="success"
                label="Não há fichas disponíveis no momento..."
              />
              Atualize a página para buscar por atualizações ou selecione um
              período diferente ...
            </div>
          )
        }
      >
        {(item) => (
          <TableRow
            key={item.id}
            className="hover:cursor-pointer hover:opacity-90 hover:ring-2 rounded-lg hover:shadow-md hover:scale-[101%] transition-all"
          >
            <TableCell>{item.position}</TableCell>
            <TableCell>{services[item.service - 1].name}</TableCell>
            <TableCell className="hidden sm:table-cell">
              {item.requested_by !== ""
                ? item.requested_by
                : "Nome não fornecido"}
            </TableCell>
            <TableCell className="flex">
              {item.priority === 1 ? (
                <Chip
                  radius="full"
                  startContent={<AssistWalkerIcon />}
                  className="bg-alert w-[1.9rem] self-center mr-1.5 "
                />
              ) : (
                <Chip
                  radius="full"
                  startContent={<PersonIcon />}
                  className="bg-success w-8 self-center mr-1.5"
                />
              )}
              {item.status === "EM ESPERA" ? (
                <Chip
                  radius="full"
                  startContent={<HourglassBottomIcon />}
                  className="bg-info w-8 self-center mr-1.5"
                />
              ) : item.status === "EM ATENDIMENTO" ? (
                <Chip
                  radius="full"
                  startContent={<AirlineSeatReclineNormalIcon />}
                  className="bg-info w-8 self-center mr-1.5"
                />
              ) : item.status === "ADIADO" ? (
                <div>
                  <Chip
                    radius="full"
                    startContent={<HourglassBottomIcon />}
                    className="bg-info w-8 self-center mr-1.5"
                  />
                  <Chip
                    radius="full"
                    startContent={<ReportIcon />}
                    className="bg-failed w-8 self-center mr-1.5"
                  />
                </div>
              ) : item.status === "CONCLUIDO" ? (
                <Chip
                  radius="full"
                  startContent={<EmojiEmotionsIcon />}
                  className="bg-success w-8 self-center mr-1.5"
                />
              ) : null}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default TokensTable;
