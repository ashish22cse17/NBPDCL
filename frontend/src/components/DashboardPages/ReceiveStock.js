// pages/ReceiveStock.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const ReceiveStock = () => {
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get("/api/items").then((res) => setItems(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/receive", { itemId, quantity, supplier });
      alert("Stock received successfully!");
      setItemId(""); setQuantity(""); setSupplier("");
    } catch (err) {
      alert("Error receiving stock");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">📥 Receive Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select value={itemId} onChange={(e) => setItemId(e.target.value)} required className="w-full border rounded px-3 py-2">
          <option value="">Select Item</option>
          {items.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="text"
          placeholder="Supplier Name"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />

        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Receive
        </button>
      </form>
    </div>
  );
};

export default ReceiveStock;
