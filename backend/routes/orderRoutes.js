const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getPendingOrders,
  acceptOrderItem ,
  rejectOrderItem ,
  getActivityLogs,
  
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");


router.post("/", placeOrder);
router.get("/my-orders", protect, getMyOrders);


router.get("/pending", getPendingOrders);
router.post("/accept", acceptOrderItem);
router.post("/reject", rejectOrderItem);
router.get("/logs", getActivityLogs);




module.exports = router;
