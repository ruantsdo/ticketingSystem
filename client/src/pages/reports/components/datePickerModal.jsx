//Components
import { Divider, Button, Select } from "../../../components";
import { DatePickerItems } from "./";

//NextUI
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  SelectItem,
} from "@nextui-org/react";

//DatePicker
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

//Toast
import { toast } from "react-toastify";

//Icons
import FilterAltIcon from "@mui/icons-material/FilterAlt";

function DatePickerModal({ ...props }) {
  const {
    handleFilterTokensByDateInterval,
    pickerIsOpen,
    setPickerIsOpen,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    pickerFilter,
    setPickerFilter,
  } = props;

  const inputStyle = {
    backgroundColor: "white",
    border: "1px solid black",
    borderRadius: "10px",
    width: "fit-content",
    height: "3rem",
    padding: "1rem",
  };

  return (
    <Modal
      isOpen={pickerIsOpen}
      hideCloseButton={true}
      size="2xl"
      className="h-full sm:h-[70%] xl:h-[50%]"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 justify-center items-center font-semibold">
              Defina um intervalo de tempo
              <section className="flex gap-3 justify-center items-center"></section>
            </ModalHeader>
            <Divider />
            <ModalBody>
              <div className="flex flex-row w-full justify-around text-black">
                <div>
                  <label className="text-black dark:text-white">
                    Data e horário iniciais:
                  </label>
                  <Datetime
                    onChange={(date) => setStartDate(date)}
                    value={startDate}
                    inputProps={{ style: inputStyle }}
                    locale="pt-br"
                    dateFormat="DD/MM/YYYY"
                    timeFormat="HH:mm"
                  />
                </div>
                <div>
                  <label className="text-black dark:text-white">
                    Data e horário finais:
                  </label>
                  <Datetime
                    onChange={(date) => {
                      setEndDate(date);
                    }}
                    value={endDate}
                    inputProps={{ style: inputStyle }}
                    locale="pt-br"
                    dateFormat="DD/MM/YYYY"
                    timeFormat="HH:mm"
                  />
                </div>
              </div>
              <Select
                size="sm"
                items={DatePickerItems}
                label="Filtrar por"
                placeholder="Indique o filtro desejado"
                className="border-none shadow-none w-full"
                variant="faded"
                onSelectionChange={(key) => {
                  setPickerFilter(key.currentKey);
                }}
              >
                {DatePickerItems.map((item) => (
                  <SelectItem key={item.value}>{item.placeholder}</SelectItem>
                ))}
              </Select>
            </ModalBody>
            <Divider />
            <ModalFooter className="flex justify-center align-middle">
              <Button
                onPress={() => {
                  setPickerIsOpen(false);
                }}
                mode="failed"
                className="w-fit"
              >
                Fechar
              </Button>
              <Button
                onPress={() => {
                  if (pickerFilter) {
                    handleFilterTokensByDateInterval();
                    setPickerIsOpen(false);
                  } else {
                    toast.info(
                      "Você deve definir o filtro desejado antes de aplicar o filtro!"
                    );
                  }
                }}
                endContent={<FilterAltIcon />}
                mode="success"
                className="w-fit"
              >
                Filtrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default DatePickerModal;
