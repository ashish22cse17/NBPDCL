const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, unique: true },
  userType: { type: String, enum: ['guest', 'user'], required: true },
  name: String,
  email: String,
  centerId: String,
  designation: String,
  item: { type: String, required: true },
  type: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  resolution: { type: String },
  proof: { type: String }, 
  resolvedAt: { type: Date },
}, { timestamps: true });

complaintSchema.pre('save', async function (next) {
  if (!this.complaintId) {
    const Complaint = mongoose.model('Complaint');
    const last = await Complaint.findOne({}).sort({ createdAt: -1 }).select("complaintId");
    const lastId = last?.complaintId?.match(/CMP(\d+)/)?.[1] || 100;
    this.complaintId = `CMP${parseInt(lastId) + 1}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
