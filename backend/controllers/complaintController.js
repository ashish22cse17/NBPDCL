const Complaint = require('../models/Complaint');


const submitComplaint = async (req, res) => {
  try {
    const { userType } = req.body;

    if (!userType || !['guest', 'user'].includes(userType)) {
      return res.status(400).json({ message: 'Invalid or missing user type' });
    }

    const newComplaint = new Complaint(req.body);
    await newComplaint.save();

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaintId: newComplaint.complaintId,
    });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ message: 'Failed to submit complaint' });
  }
};

const getComplaints = async (req, res) => {
  const { userType, identifier, complaintId } = req.query;

  try {
    let complaints;

    if (complaintId) {
      complaints = await Complaint.findOne({ complaintId });
      if (!complaints) return res.status(404).json({ message: "Complaint not found" });
      return res.status(200).json(complaints);
    }

   
     complaints = await Complaint.find({
      $or: [{ email: identifier }, { centerId: identifier }],
    });

    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const resolveComplaint = async (req, res) => {
  const { complaintId } = req.params;
  const { resolutionMessage } = req.body;
  let proofPath = null;

  try {
    const complaint = await Complaint.findOne({ complaintId });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Save file path if proof was uploaded
    if (req.file) {
      proofPath = `/uploads/${req.file.filename}`;
    }

    complaint.status = 'Resolved';
    complaint.resolution = resolutionMessage;
    complaint.proof = proofPath;

    await complaint.save();

    res.status(200).json({ message: 'Complaint resolved successfully' });
  } catch (error) {
    console.error('Error resolving complaint:', error);
    res.status(500).json({ message: 'Failed to resolve complaint' });
  }
};



module.exports = {
  submitComplaint,
  getComplaints,
  getAllComplaints,
  resolveComplaint,
};
