import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MyOrders.css";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/orders/my-orders", {
          withCredentials: true,
        });

        if (!Array.isArray(res.data)) {
          console.error("⚠️ Expected array, got:", res.data);
          setOrders([]);
        } else {
          setOrders(res.data);
        }
      } catch (err) {
        console.error("❌ Failed to fetch orders:", err?.response?.data || err.message);
        alert("❌ Error fetching orders. See console.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="my-orders-container">
      <h2>📦 My Orders</h2>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="responsive-table">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total Quantity</th>
                <th>Order Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const totalQty =
                  order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

                return (
                  <tr key={order.orderId || order._id}>
                    <td>{order.orderId || order._id}</td>
                    <td>
                      {order.placedAt
                        ? new Date(order.placedAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {order.items && order.items.length > 0 ? (
                        <div className="item-cell">
                          {order.items.map((i, idx) => (
                            <div key={idx} className="item-row">
                              <div className="item-info">
                                <div className="item-name">{i.itemId?.itemName || "❓ Unknown"}</div>
                                <div className="item-details">
                                  <span>🆔 {i.itemId?._id || "N/A"}</span>
                                  <span>Qty: {i.quantity}</span>
                                </div>
                              </div>
                              <div className={`item-status badge ${i.status?.toLowerCase() || "pending"}`}>
                                {i.status || "Pending"}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>No items</div>
                      )}
                    </td>
                    <td>{totalQty}</td>
                    <td>
                      <span className={`badge ${order.status?.toLowerCase() || "pending"}`}>
                        {order.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
