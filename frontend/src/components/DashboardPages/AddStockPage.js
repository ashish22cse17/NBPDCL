import React, { useState, useEffect } from "react";
import "./AddStockPage.css";
import axios from "axios";
import FilterDrawer from "./FilterDrawer";

const AddStockPage = () => {
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    quantity: "",
    unitPrice: "",
    supplier: "",
    location: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/stocks");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key]) newErrors[key] = "Required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      itemName: "",
      category: "",
      quantity: "",
      unitPrice: "",
      supplier: "",
      location: "",
      description: "",
    });
    setEditId(null);
    setShowModal(false);
    setErrors({});
  };

  const handleAddStock = async () => {
    try {
      await axios.post("http://localhost:5000/api/stocks/add", formData);
      setSuccessMsg("✅ Stock item added successfully!");
      resetForm();
      fetchProducts();
    } catch (err) {
      alert("Failed to add stock item.");
    }
  };

  const handleEditStock = async () => {
    try {
      await axios.put(`http://localhost:5000/api/stocks/${editId}`, formData);
      setSuccessMsg("✅ Stock item updated successfully!");
      resetForm();
      fetchProducts();
    } catch (err) {
      alert("Failed to update stock item.");
    }
  };

  const handleEdit = (item) => {
  setFormData({
    itemName: item.itemName || "",
    category: item.category || "",
    quantity: item.quantity || "",
    unitPrice: item.unitPrice || "",
    supplier: item.supplier || "",
    location: item.location || "",
    description: item.description || "",
  });
  setEditId(item._id);
  setShowModal(true);
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  console.log("Submitting form data:", formData); 
  editId ? await handleEditStock() : await handleAddStock();
};


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/stocks/${id}`);
      fetchProducts();
      alert("Item deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete item.");
    }
  };

  const filteredProducts = products
    .filter((item) => item.itemName.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((item) => {
      const { category, quantityMin, quantityMax, priceMin, priceMax, supplier, location } = filters;
      return (
        (!category || item.category === category) &&
        (!quantityMin || item.quantity >= Number(quantityMin)) &&
        (!quantityMax || item.quantity <= Number(quantityMax)) &&
        (!priceMin || item.unitPrice >= Number(priceMin)) &&
        (!priceMax || item.unitPrice <= Number(priceMax)) &&
        (!supplier || item.supplier.toLowerCase().includes(supplier.toLowerCase())) &&
        (!location || item.location.toLowerCase().includes(location.toLowerCase()))
      );
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  return (
    <div className="add-stock-wrapper">
      <div className="top-bar">
        <h2>📦 Stock Items</h2>
        <button className="open-modal-btn" onClick={() => setShowModal(true)}>
          ➕ Add Stock
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by item name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        <div className="pagination-controls">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>

          <button
            className="open-modal-btn"
            style={{ marginLeft: "10px" }}
            onClick={() => setIsFilterOpen(true)}
          >
            🔍 Filter
          </button>
        </div>
      </div>

      <div className="product-list-full">
        {paginatedItems.length === 0 ? (
          <p>No matching stock items found.</p>
        ) : (
          <>
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Supplier</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.itemName}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>₹{parseFloat(item.unitPrice).toFixed(2)}</td>
                    <td>{item.supplier}</td>
                    <td>{item.location}</td>
                    <td>
                      <button className="table-btn edit" onClick={() => handleEdit(item)}>
                        ✏️ Edit
                      </button>
                      <button className="table-btn delete" onClick={() => handleDelete(item._id)}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                ◀ Prev
              </button>
              <span>
                Page{" "}
                <select value={currentPage} onChange={(e) => setCurrentPage(Number(e.target.value))}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <option key={pageNum} value={pageNum}>
                      {pageNum}
                    </option>
                  ))}
                </select>{" "}
                of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next ▶
              </button>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editId ? "✏️ Edit Stock Item" : "➕ Add New Stock Item"}</h3>
            {successMsg && <div className="success-msg">{successMsg}</div>}
            <form className="add-stock-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                {[ 
                  { label: "Item Name", name: "itemName" },
                  { label: "Category", name: "category" },
                  { label: "Quantity", name: "quantity", type: "number" },
                  { label: "Unit Price (₹)", name: "unitPrice", type: "number", step: "0.01" },
                  { label: "Supplier", name: "supplier" },
                  { label: "Location", name: "location" },
                ].map(({ label, name, type = "text", step }) => (
                  <div className="form-group" key={name}>
                    <label>{label}</label>
                    <input
                      type={type}
                      step={step}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      min={type === "number" ? 0 : undefined}
                    />
                    {errors[name] && <span className="error">{errors[name]}</span>}
                  </div>
                ))}

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                  />
                  {errors.description && <span className="error">{errors.description}</span>}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editId ? "Update" : "Add Stock"}
                </button>
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FilterDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleFilterApply}
        categories={[...new Set(products.map((p) => p.category))]}
        initialFilters={filters}
      />
    </div>
  );
};

export default AddStockPage;
