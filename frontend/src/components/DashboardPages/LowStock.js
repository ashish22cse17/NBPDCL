import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./LowStock.css";

const LowStock = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/stocks");
        const lowItems = res.data.filter((item) => item.quantity < 25);
        setLowStockItems(lowItems);
      } catch (err) {
        console.error("Failed to fetch low stock items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockItems();
  }, []);

  const categories = [...new Set(lowStockItems.map((item) => item.category))];

  const filteredItems = lowStockItems
    .filter((item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) =>
      selectedCategory ? item.category === selectedCategory : true
    );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredItems.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredItems.length / recordsPerPage);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Low Stock Report", 14, 15);
    autoTable(doc, {
      head: [["S.No.", "Item ID", "Item Name", "Category", "Quantity"]],
      body: filteredItems.map((item, i) => [
        i + 1,
        item._id.slice(0, 9),
        item.itemName,
        item.category,
        item.quantity,
      ]),
      startY: 20,
      headStyles: { fillColor: [255, 99, 71] },
    });
    doc.save("low-stock-report.pdf");
  };

  return (
    <div className="low-stock-container">
      <h2 className="low-stock-heading">⚠️ Low Stock Items</h2>

      <div className="low-stock-toolbar">
        <input
          type="text"
          placeholder="Search item..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="low-search"
        />

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="low-select"
        >
          <option value="">All Categories</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={recordsPerPage}
          onChange={(e) => {
            setRecordsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="low-select"
        >
          {[5, 10, 20, 50].map((num) => (
            <option key={num} value={num}>
              {num} per page
            </option>
          ))}
        </select>

        <button className="download-btn" onClick={handleDownloadPDF}>
          📄 Download PDF
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Loading low stock data...</p>
      ) : currentRecords.length > 0 ? (
        <table className="low-stock-table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Item Id</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((item, index) => (
              <tr key={item._id}>
                <td>{indexOfFirstRecord + index + 1}</td>
                <td>{item._id.slice(0, 9)}...</td>
                <td>{item.itemName}</td>
                <td>{item.category}</td>
                <td className="low-value">{item.quantity}</td>
                <td>
                  <button className="restock-btn">Request Restock</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-items">🎉 No items are currently low in stock.</p>
      )}

      {filteredItems.length > recordsPerPage && (
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ⬅️ Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next ➡️
          </button>
        </div>
      )}
    </div>
  );
};

export default LowStock;
