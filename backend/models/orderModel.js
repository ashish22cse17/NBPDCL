const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StockItem",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      unitPrice: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending",
      },
      allocatedQuantity: {
        type: Number,
        default: 0,
      },
    },
  ],
  placedByEmail: {
    type: String,
  },
  placedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "Pending",
  },
}, { timestamps: true });

// Auto-generate orderId like ORD101, ORD102...
orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    const Order = mongoose.model("Order");
    const lastOrder = await Order.findOne({})
      .sort({ createdAt: -1 })
      .select("orderId");

    const lastId = lastOrder?.orderId?.match(/ORD(\d+)/)?.[1] || 100;
    this.orderId = `ORD${parseInt(lastId) + 1}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
