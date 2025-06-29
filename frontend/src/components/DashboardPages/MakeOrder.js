import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MakeOrder.css";

const MakeOrder = ({ userType }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          withCredentials: true,
        });
       
        setUserDetails(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch user info", err);
      }
    };
    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/stocks");
        setProducts(res.data);
        setFilteredProducts(res.data);

        const uniqueCategories = [
          "All",
          ...new Set(res.data.map((item) => item.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const filtered = products.filter((item) => {
      const matchesSearch = item.itemName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const handleAddToOrder = (item) => {
    if (!orderItems.find((i) => i._id === item._id)) {
      setOrderItems([...orderItems, { ...item, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (index, value) => {
    const updated = [...orderItems];
    updated[index].quantity = Math.max(1, Number(value));
    setOrderItems(updated);
  };

  const removeItem = (index) => {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  };

  const submitOrder = async () => {
    if (!userDetails?.email || orderItems.length === 0) {
      alert("❌ Order failed: Missing user or items.");
      return;
    }

    const payload = {
      userEmail: userDetails.email,
      items: orderItems.map(({ _id, quantity }) => ({
        itemId: _id,
        quantity,
      })),
    };

    try {
     
      await axios.post("http://localhost:5000/api/orders", payload, {
        withCredentials: true,
      });
      alert("✅ Order placed successfully!");
      setOrderItems([]);
    } catch (err) {
      console.error(
        "❌ Error placing order:",
        err.response?.data || err.message
      );
      alert("❌ Order failed. See console for details.");
    }
  };

  return (
    <div className="make-order-container">
      <h2 className="title">🛒 Make a New Order</h2>
      
      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="Search by item name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {orderItems.length > 0 && (
        <div className="order-section">
          <h3 className="subtitle">📝 Order Preview</h3>
          <div className="order-list">
            {orderItems.map((item, index) => (
              <div key={index} className="order-row">
                <span>{item.itemName}</span>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(index, e.target.value)
                  }
                />
                <button
                  className="remove-btn"
                  onClick={() => removeItem(index)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
          <button onClick={submitOrder} className="submit-order-btn">
            🚀 Place Order
          </button>
        </div>
      )}

      <div className="product-grid">
        <p>
          Showing {filteredProducts.length} of {products.length} items
        </p>
        {filteredProducts.map((item) => (
          <div key={item._id} className="card">
            <div className="card-content">
              <h3>{item.itemName}</h3>
              <p>
                <strong>Category:</strong> {item.category || "N/A"}
              </p>
              <p>
                <strong>Available:</strong> {item.quantity ?? "N/A"}
              </p>
              <p>
                <strong>Unit Price:</strong> ₹{item.unitPrice ?? "N/A"}
              </p>
              <p>
                <strong>Supplier:</strong> {item.supplier || "N/A"}
              </p>
              <p>
                <strong>Location:</strong> {item.location || "N/A"}
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {item.lastUpdated
                  ? new Date(item.lastUpdated).toLocaleDateString()
                  : "N/A"}
              </p>
              <button
                onClick={() => handleAddToOrder(item)}
                className="add-btn"
              >
                + Add to Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MakeOrder;
