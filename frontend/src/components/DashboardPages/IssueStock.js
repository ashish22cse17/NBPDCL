// pages/IssueStock.js
import React, { useState, useEffect } from "react";

const IssueStock = () => {
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [issuedTo, setIssuedTo] = useState("");
  const [items, setItems] = useState([]);

  // Simulate fetching items from backend
  useEffect(() => {
    const dummyItems = [
      { _id: "1", name: "Printer Ink" },
      { _id: "2", name: "A4 Paper Pack" },
      { _id: "3", name: "Stapler" },
    ];
    setItems(dummyItems);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const issuedData = {
      itemId,
      quantity,
      issuedTo,
    };

    console.log("Dummy Issue Submitted:", issuedData);
    alert("Item issued (dummy) successfully!");

    setItemId("");
    setQuantity("");
    setIssuedTo("");
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">📤 Issue Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        >
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
          placeholder="Issued To (User ID or Name)"
          value={issuedTo}
          onChange={(e) => setIssuedTo(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Issue
        </button>
      </form>
    </div>
  );
};

export default IssueStock;
