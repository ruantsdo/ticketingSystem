//React
import { useState, useMemo, useEffect } from "react";

//Components
import { Subtitle } from "./";
import { Button } from "../../../components";

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
  Select,
  SelectItem,
} from "@nextui-org/react";

//Icons
import PersonIcon from "@mui/icons-material/Person";
import AssistWalkerIcon from "@mui/icons-material/AssistWalker";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ReportIcon from "@mui/icons-material/Report";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SettingsIcon from "@mui/icons-material/Settings";

function TokensTable({ ...props }) {
  const { tokens, defineTargetToken, setPickerIsOpen } = props;

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const tableRowsQuantity = lineCount();

  const [page, setPage] = useState(1);

  const pages = Math.max(1, Math.ceil(tokens.length / rowsPerPage));

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return tokens.slice(start, end);
  }, [page, tokens, rowsPerPage]);

  const findIndexById = (key) => {
    for (let i = 0; i < tokens.length; i++) {
      // eslint-disable-next-line
      if (tokens[i].id == key) {
        defineTargetToken(i);
        return;
      }
    }
  };

  function lineCount() {
    const result = [];

    for (let i = 5; i <= 30; i += 5) {
      result.push({ label: `${i} linhas`, value: i });
    }

    return result;
  }

  useEffect(() => {
    setPage(1);
  }, [tokens]);

  useEffect(() => {
    lineCount();
  }, []);

  return (
    <Table
      aria-label="Lista de fichas disponíveis para você"
      onRowAction={(key) => {
        findIndexById(key);
      }}
      isStriped
      bottomContent={
        <div className="flex flex-row w-full items-center justify-center">
          <div className="flex flex-row w-[42%] left-2 absolute justify-around">
            <Select
              size="sm"
              label="Linhas"
              variant="bordered"
              placeholder="5 linhas"
              className="w-[50%]"
              onChange={(e) => setRowsPerPage(e.target.value)}
            >
              {tableRowsQuantity.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </Select>
          </div>
          <Pagination
            loop
            isCompact
            showControls
            siblings={1}
            boundaries={1}
            color="success"
            initialPage={1}
            page={page}
            total={pages}
            onChange={(page) => setPage(page)}
          />
          <div className="flex flex-row right-2 absolute w-[42%] justify-around">
            <Button
              onPress={() => setPickerIsOpen(true)}
              mode="success"
              className="w-fit"
              endContent={<EventAvailableIcon />}
            >
              Selecionar um período
            </Button>
          </div>
        </div>
      }
      classNames={{
        wrapper: "min-h-[222px]",
      }}
      className="w-[70%]"
    >
      <TableHeader>
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
              <Spinner size="md" color="success" label="Não há fichas ..." />
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
            <TableCell>{item.service}</TableCell>
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
              {item.delayed_by !== null && (
                <Chip
                  radius="full"
                  startContent={<ReportIcon />}
                  className="bg-failed w-8 self-center mr-1.5"
                />
              )}
              {item.status === "ENCERRADO PELO SISTEMA" ? (
                <Chip
                  radius="full"
                  startContent={<SettingsIcon />}
                  className="bg-darkFailed w-8 self-center mr-1.5"
                />
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
