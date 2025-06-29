import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AllocateOrder.css";

const AllocateOrder = () => {
  const [orders, setOrders] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [itemStatus, setItemStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/orders/pending");
        const ordersData = response.data;
        setOrders(ordersData);

        const stockMap = {};
        const statusMap = {};

        ordersData.forEach((order) => {
          order.items.forEach((item) => {
            const id = item.itemId?._id || item.itemId;
            if (!stockMap[id]) {
              stockMap[id] = {
                _id: id,
                itemName: item.itemName,
                quantity: item.availableStock,
              };
            }
            statusMap[`${order._id}-${id}`] = "Pending";
          });
        });

        setStocks(Object.values(stockMap));
        setItemStatus(statusMap);
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
        alert("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, []);

  const handleQuantityChange = (orderId, itemId, value) => {
    setAllocations((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        [itemId]: Math.max(0, Number(value)),
      },
    }));
  };

  const handleAcceptItem = async (orderId, itemId) => {
  const key = `${orderId}-${itemId}`;
  const allocatedQty = allocations[orderId]?.[itemId] ?? 1;

  try {
    const res = await axios.post("http://localhost:5000/api/orders/accept", {
      orderId,
      itemId,
      quantity: allocatedQty,
    });

    if (res.data.message) {
      setItemStatus((prev) => ({ ...prev, [key]: "Accepted" }));

      const stockIndex = stocks.findIndex((s) => s._id === itemId);
      if (stockIndex !== -1) {
        const updatedStocks = [...stocks];
        updatedStocks[stockIndex].quantity -= allocatedQty;
        if (updatedStocks[stockIndex].quantity < 0) {
          updatedStocks[stockIndex].quantity = 0;
        }
        setStocks(updatedStocks);
      }
    }
  } catch (err) {
    console.error("❌ Accept error:", err);
    alert("Failed to accept item.");
  }
};

const handleRejectItem = async (orderId, itemId) => {
  const key = `${orderId}-${itemId}`;

  try {
    const res = await axios.post("http://localhost:5000/api/orders/reject", {
      orderId,
      itemId,
    });

    if (res.data.message) {
      setItemStatus((prev) => ({ ...prev, [key]: "Rejected" }));
    }
  } catch (err) {
    console.error("❌ Reject error:", err);
    alert("Failed to reject item.");
  }
};


  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="allocate-order-container">
      <h2>📋 Pending Orders</h2>
      {orders.length === 0 ? (
        <p>No pending orders</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <h3>📦 Order ID: {order.orderId}</h3>
              <span className={`order-status-badge status-${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>

            <p><strong>User:</strong> {order.userName} ({order.userId})</p>
            <p><strong>Email:</strong> {order.placedByEmail}</p>
            <p><strong>Designation:</strong> {order.designation}</p>
            <p><strong>Center ID:</strong> {order.centerId}</p>
            <p><strong>Location:</strong> {order.centerName}</p>
            <p><strong>Placed On:</strong> {new Date(order.placedAt).toLocaleString()}</p>

            <hr />
            {order.items.map((item, idx) => {
              const itemId = item.itemId?._id || item.itemId;
              const key = `${order._id}-${itemId}`;
              const inStock = stocks.find((s) => s._id === itemId)?.quantity ?? 0;

              return (
                <div key={idx} className="order-item">
                  <h4>🛠️ {item.itemName}</h4>
                  <p>Category: {item.category}</p>
                  <p>Supplier: {item.supplier}</p>
                  <p>Item Location: {item.location}</p>
                  <p>Unit Price: ₹{item.unitPrice}</p>
                  <p>Requested Qty: {item.quantity}</p>
                  <p>Available Stock: {inStock}</p>

                  <input
                    type="number"
                    min="0"
                    max={item.quantity}
                    value={allocations[order._id]?.[itemId] ?? item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(order._id, itemId, e.target.value)
                    }
                  />

                  <div className="status-control">
                    <span className={`status-badge status-${itemStatus[key]?.toLowerCase()}`}>
                      {itemStatus[key]}
                    </span>

                    {itemStatus[key] === "Pending" && (
                      <div className="inline-buttons">
                        <button onClick={() => handleAcceptItem(order._id, itemId)} className="allocate-btn">
                          ✅ Accept
                        </button>
                        <button onClick={() => handleRejectItem(order._id, itemId)} className="reject-btn">
                          ❌ Reject
                        </button>
                      </div>
                    )}
                  </div>

                  <hr />
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
};

export default AllocateOrder;
