//Toast
import { toast } from "react-toastify";

//XLSX
import * as XLSX from "xlsx";

const handleGenerateReport = async ({ headers, content, sheetName }) => {
  toast.promise(generateReport({ headers, content, sheetName }), {
    pending: "Estamos gerando seu relatório",
    success: "Relatório gerado!",
    error: "Falha ao gerar relatório!",
  });
};

const generateReport = ({ headers, content, sheetName }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const options = { header: headers };

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(content, options);

      XLSX.utils.book_append_sheet(wb, ws, "Relatório");

      XLSX.writeFile(wb, `Relatório ${sheetName}.xlsx`);

      resolve();
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export { handleGenerateReport, generateReport };
