const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const stockRoutes = require('./routes/stockRoutes');
const complaintRoutes = require("./routes/complaintRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();
connectDB();

const _dirname=path.resolve();
const app = express();



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true               
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/complaints', complaintRoutes); 
app.use("/api/orders", orderRoutes);


 app.use(express.static(path.join(_dirname,"/frontend/build")));
app.get(/^\/(?!api).*/,(req,res)=>{
    res.sendFile(path.resolve(_dirname,"frontend","build","index.html"));
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

