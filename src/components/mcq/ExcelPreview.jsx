// 🔥 ExcelPreview.jsx
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "./excelPreview.css";

export default function ExcelPreview({
  onConfirm,
  resetTrigger,
  showProgress,
}) {
  const [data, setData] = useState([]);
  const [file, setFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  useEffect(() => {
    setData([]);
    setFile(null);
  }, [resetTrigger]);
  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile); // ✅ store file
    const reader = new FileReader();

    reader.onload = (evt) => {
      const binaryStr = evt.target.result;
      const workbook = XLSX.read(binaryStr, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setData(jsonData);
      setCurrentPage(1); // ✅ reset page
    };

    reader.readAsArrayBuffer(selectedFile);
  };
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  return (
    <div className="excel-preview-container">
      {/* <h2>📊 Excel Preview</h2> */}
      <div style={{ display: "grid" }}>
        {file && <p className="file-name">📁 {file.name}</p>}
        <label className="excel-upload-box">
          <input type="file" accept=".xlsx, .xls" onChange={handleFile} />
          <span>Click to upload Excel file</span>
        </label>
      </div>

      {data.length > 0 && (
        <div className="excel-modal">
          <div className="excel-modal-content">
            <h2>📊 Excel Preview</h2>
            <div className="excel-header">
              <strong className="close-btn-excel" onClick={() => setData([])}>
                ✖
              </strong>
              <select
                value={rowsPerPage} // ✅ THIS LINE FIXES IT
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="excel-select"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* <p className="file-name">📁 {file?.name}</p> */}
            <strong
              className="confirm-btn"
              onClick={() => onConfirm(file)}
              style={{
                pointerEvents: showProgress ? "none" : "auto",
                opacity: showProgress ? 0.5 : 1,
              }}
            >
              {" "}
              ✅ Confirm & Upload
            </strong>
            <div className="table-wrapper">
              <p className="row-info">
                Showing {currentRows.length} of {data.length} rows
              </p>
              <table>
                <thead>
                  <tr>
                    {Object.keys(data[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, idx) => (
                        <td key={idx}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ⬅ Prev
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next ➡
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
