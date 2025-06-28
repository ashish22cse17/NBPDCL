import React, { useState, useEffect } from "react";
import "./FilterDrawer.css";

const FilterDrawer = ({ open, onClose, onApply, categories, initialFilters }) => {
  const [localFilters, setLocalFilters] = useState(initialFilters);

  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  const handleChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    const cleared = {
      itemName: "",
      category: "",
      quantityMin: "",
      quantityMax: "",
      priceMin: "",
      priceMax: "",
      supplier: "",
      location: "",
    };
    setLocalFilters(cleared);
  };

  return (
    <div className={`drawer ${open ? "open" : ""}`}>
      <div className="drawer-header">
        <h3>Filter</h3>
        <button onClick={onClose}>❌</button>
      </div>

      <div className="drawer-body">
        <label>Item Name</label>
        <input value={localFilters.itemName} onChange={(e) => handleChange("itemName", e.target.value)} />

        <label>Category</label>
        <select value={localFilters.category} onChange={(e) => handleChange("category", e.target.value)}>
          <option value="">All</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>

        <label>Quantity Range</label>
        <div className="range-inputs">
          <input type="number" placeholder="Min" value={localFilters.quantityMin} onChange={(e) => handleChange("quantityMin", e.target.value)} />
          <input type="number" placeholder="Max" value={localFilters.quantityMax} onChange={(e) => handleChange("quantityMax", e.target.value)} />
        </div>

        <label>Price Range</label>
        <div className="range-inputs">
          <input type="number" placeholder="Min" value={localFilters.priceMin} onChange={(e) => handleChange("priceMin", e.target.value)} />
          <input type="number" placeholder="Max" value={localFilters.priceMax} onChange={(e) => handleChange("priceMax", e.target.value)} />
        </div>

        <label>Supplier</label>
        <input value={localFilters.supplier} onChange={(e) => handleChange("supplier", e.target.value)} />

        <label>Location</label>
        <input value={localFilters.location} onChange={(e) => handleChange("location", e.target.value)} />
      </div>

      <div className="drawer-footer">
        <button onClick={handleClear}>Clear All</button>
        <button onClick={() => onApply(localFilters)}>Apply</button>
      </div>
    </div>
  );
};

export default FilterDrawer;
