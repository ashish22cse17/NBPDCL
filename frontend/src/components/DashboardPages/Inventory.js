import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Inventory.css";
import FilterDrawer from "./FilterDrawer"; // make sure path is correct

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    itemName: "",
    category: "",
    quantityMin: "",
    quantityMax: "",
    priceMin: "",
    priceMax: "",
    supplier: "",
    location: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/stocks");
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  const categories = [...new Set(products.map((item) => item.category))];

  const filteredProducts = products
    .filter((item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) =>
      filters.itemName
        ? item.itemName.toLowerCase().includes(filters.itemName.toLowerCase())
        : true
    )
    .filter((item) =>
      filters.category ? item.category === filters.category : true
    )
    .filter((item) =>
      filters.quantityMin ? item.quantity >= Number(filters.quantityMin) : true
    )
    .filter((item) =>
      filters.quantityMax ? item.quantity <= Number(filters.quantityMax) : true
    )
    .filter((item) =>
      filters.priceMin ? item.unitPrice >= Number(filters.priceMin) : true
    )
    .filter((item) =>
      filters.priceMax ? item.unitPrice <= Number(filters.priceMax) : true
    )
    .filter((item) =>
      filters.supplier
        ? item.supplier.toLowerCase().includes(filters.supplier.toLowerCase())
        : true
    )
    .filter((item) =>
      filters.location
        ? item.location.toLowerCase().includes(filters.location.toLowerCase())
        : true
    );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredProducts.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredProducts.length / recordsPerPage);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Inventory Report", 14, 15);
    const tableColumn = [
      "ID",
      "Item Name",
      "Category",
      "Quantity",
      "Unit Price (₹)",
      "Supplier",
      "Location",
      "Description",
    ];
    const tableRows = filteredProducts.map((item) => [
      item._id.slice(0, 6),
      item.itemName,
      item.category,
      item.quantity,
      `₹${item.unitPrice.toFixed(2)}`,
      item.supplier,
      item.location,
      item.description || "-",
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: "striped",
      headStyles: { fillColor: [0, 123, 255] },
    });
    doc.save("inventory-report.pdf");
  };

  return (
    <div className="inventory-container">
      <h2 className="inventory-heading">📦 Inventory</h2>

      <div className="inventory-toolbar">
        <div className="toolbar-row">
          <input
            type="text"
            placeholder="Search item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inventory-search"
          />
        </div>

        <div className="toolbar-row toolbar-row-bottom">
          <select
            value={recordsPerPage}
            onChange={(e) => {
              setRecordsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="inventory-select"
          >
            {[5, 10, 20, 50].map((num) => (
              <option key={num} value={num}>
                {num} per page
              </option>
            ))}
          </select>

          <div className="toolbar-actions">
            <button className="filter-btn" onClick={() => setDrawerOpen(true)}>
              ⚙️ Filter
            </button>
            <button className="download-btn" onClick={handleDownloadPDF}>
              📄 Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Supplier</th>
              <th>Location</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((item) => (
                <tr key={item._id}>
                  <td>{item._id.slice(0, 6)}...</td>
                  <td>{item.itemName}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.unitPrice.toFixed(2)}</td>
                  <td>{item.supplier}</td>
                  <td>{item.location}</td>
                  <td>{item.description || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next ➡️
        </button>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setDrawerOpen(false);
          setCurrentPage(1);
        }}
        categories={categories}
        initialFilters={filters}
      />
    </div>
  );
};

export default Inventory;

// Helpers
export const getInventoryCount = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/stocks");
    return res.data.length;
  } catch (err) {
    console.error("Failed to fetch count:", err);
    return 0;
  }
};

export const getLowStockCount = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/stocks");
    return res.data.filter((item) => item.quantity < 25).length;
  } catch (err) {
    console.error("Failed to fetch low stock count:", err);
    return 0;
  }
};

export const getTotalStockValue = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/stocks");
    return res.data.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  } catch (err) {
    console.error("Failed to fetch stock value:", err);
    return 0;
  }
};
