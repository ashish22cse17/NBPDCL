const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Stock = require("../models/StockItem");

const placeOrder = async (req, res) => {
  const { userEmail, items } = req.body;

  try {
    if (!userEmail || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Missing userEmail or items." });
    }

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found by email." });
    }

    const orderItems = [];

    for (const { itemId, quantity } of items) {
      const stockItem = await Stock.findById(itemId);

      if (!stockItem) {
        return res.status(404).json({ message: `Item not found: ${itemId}` });
      }

      if (stockItem.quantity < quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for ${stockItem.itemName}` });
      }

      // Update stock quantity
      stockItem.quantity -= quantity;
      await stockItem.save();

      orderItems.push({
        itemId: stockItem._id,
        quantity,
        unitPrice: stockItem.unitPrice,
      });
    }

    const newOrder = new Order({
      userId: user._id,
      items: orderItems,
      placedByEmail: user.email,
    });

    await newOrder.save();

    res
      .status(201)
      .json({ message: "✅ Order placed successfully", orderId: newOrder._id });
  } catch (err) {
    console.error("❌ Error in placing order:", err);
    res.status(500).json({ message: "Server error while placing order" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(400).json({ message: "User email not found" });
    }

    // Find the user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found by email" });
    }

    // Find orders by user._id
    const orders = await Order.find({ userId: user._id })
      .populate("items.itemId", "itemName")
      .sort({ placedAt: -1 });

    console.log(`📥 Orders for ${userEmail}:`, orders.length);
    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching user orders:", err);
    res.status(500).json({ message: "Server error fetching orders" });
  }
};



const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: { $in: [null, "Pending"] } })
      .populate("userId", "fullName email location designation")
      .populate("items.itemId", "itemName category location quantity unitPrice supplier")
      .sort({ createdAt: -1 });

    const formatted = orders.map((order) => ({
      orderId: order.orderId,
      _id: order._id,
      userId: order.userId?._id,
      userName: order.userId?.fullName || "Unknown",
      centerName: order.userId?.location || "N/A",
      centerId: order.userId?.centerId || "N/A",
      designation: order.userId?.designation || "N/A",
      placedByEmail: order.placedByEmail,
      placedAt: order.placedAt,
      status: order.status || "Pending",
      items: order.items.map((item) => ({
        itemId: item.itemId?._id,
        itemName: item.itemId?.itemName || "Unknown Item",
        category: item.itemId?.category || "Unknown Category",
        quantity: item.quantity,
        unitPrice: item.itemId?.unitPrice ?? 0,
        availableStock: item.itemId?.quantity ?? 0,
        supplier: item.itemId?.supplier || "N/A",
        location: item.itemId?.location || "N/A",
        status: item.status || "Pending",
      })),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching pending orders:", err);
    res.status(500).json({ message: "Server error fetching pending orders" });
  }
};

const acceptOrderItem = async (req, res) => {
  try {
    const { orderId, itemId, quantity } = req.body;

    if (!orderId || !itemId || quantity == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.items.find((i) => i.itemId.toString() === itemId);
    if (!item) return res.status(404).json({ message: "Item not found in order" });

    const stockItem = await Stock.findById(itemId);
    if (!stockItem) return res.status(404).json({ message: "Stock item not found" });

    if (stockItem.quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    // Deduct stock
    stockItem.quantity -= quantity;
    await stockItem.save();

    // Update item status in order
    item.status = "Accepted";

    // Save updated order
    await order.save();

    // Update order status based on all items
    const allStatuses = order.items.map((i) => i.status);
    if (allStatuses.every((s) => s === "Accepted")) {
      order.status = "Accepted";
    } else if (allStatuses.every((s) => s === "Rejected")) {
      order.status = "Rejected";
    } else {
      order.status = "Pending";
    }

    await order.save();

    res.json({ message: "Item accepted and stock updated", orderStatus: order.status });
  } catch (err) {
    console.error("❌ Accept Error:", err);
    res.status(500).json({ message: "Server error accepting item" });
  }
};


const rejectOrderItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.body;

    if (!orderId || !itemId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.items.find((i) => i.itemId.toString() === itemId);
    if (!item) return res.status(404).json({ message: "Item not found in order" });

    item.status = "Rejected";
    await order.save();

    // Update order status based on all items
    const allStatuses = order.items.map((i) => i.status);
    if (allStatuses.every((s) => s === "Accepted")) {
      order.status = "Accepted";
    } else if (allStatuses.every((s) => s === "Rejected")) {
      order.status = "Rejected";
    } else {
      order.status = "Pending";
    }

    await order.save();

    res.json({ message: "Item rejected", orderStatus: order.status });
  } catch (err) {
    console.error("❌ Reject Error:", err);
    res.status(500).json({ message: "Server error rejecting item" });
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("userId").populate("items.itemId");

    const logs = [];

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.status === "Accepted" || item.status === "Rejected") {
          logs.push({
            _id: `${order._id}-${item.itemId?._id}`,
            itemName: item.itemId?.itemName || "Unknown",
            action: item.status,
            quantity: item.allocatedQuantity || item.quantity,
            performedBy: order.userId?.fullName || order.placedByEmail || "Unknown",
            date: order.updatedAt || order.createdAt,
          });
        }
      });
    });

    res.json(logs);
  } catch (err) {
    console.error("❌ Error getting activity logs:", err);
    res.status(500).json({ message: "Failed to get activity logs" });
  }
};







module.exports = { placeOrder , getMyOrders,  getPendingOrders, acceptOrderItem, rejectOrderItem, getActivityLogs};
