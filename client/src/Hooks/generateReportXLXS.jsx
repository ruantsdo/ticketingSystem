//Toast
import { toast } from "react-toastify";

//XLSX
import * as XLSX from "xlsx";

const handleGenerateReport = async ({ headers, content, finalSheetName }) => {
  toast.promise(generateReport({ headers, content, finalSheetName }), {
    pending: "Estamos gerando seu relatório",
    success: "Relatório gerado!",
    error: "Falha ao gerar relatório!",
  });
};

const generateReport = ({ headers, content, finalSheetName }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const options = { header: headers };
      const wscols = headers.map((header) => ({ wch: header.length }));

      content.forEach((row) => {
        headers.forEach((header, i) => {
          const cellContent = row[header] || "";
          const cellLength = String(cellContent).length;
          wscols[i].wch = Math.max(wscols[i].wch + 1, cellLength);
        });
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(content, options);

      ws["!cols"] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, "Relatório");

      XLSX.writeFile(wb, `Relatório ${finalSheetName}.xlsx`);

      resolve();
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export { handleGenerateReport, generateReport };
