// routes/stockRoutes.js
const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");

router.post("/add", stockController.addStock);
router.get("/", stockController.getAllStocks);
router.get("/by-category", stockController.getStockByCategory);
router.get("/search", stockController.searchItems);
router.put("/:id", stockController.updateStock);
router.delete("/:id", stockController.deleteStock);

module.exports = router;
