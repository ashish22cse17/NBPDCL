import React, { useEffect, useState } from 'react';
import './StockValueComplaints.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

const StockValueComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [proofFile, setProofFile] = useState(null);

  // Fetch complaints on mount
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/complaints/all', {
          withCredentials: true,
        });
        setComplaints(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load complaints', err);
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // Filter complaints
  const filteredComplaints = complaints
    .filter((c) =>
      c.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((c) => (selectedStatus ? c.status === selectedStatus : true));

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredComplaints.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredComplaints.length / recordsPerPage);

  // Download as PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Stock Value Complaints', 14, 15);
    autoTable(doc, {
      head: [['ID', 'Item', 'User Type', 'Reported By', 'Status', 'Date']],
      body: filteredComplaints.map((c) => [
        c.complaintId,
        c.item,
        c.userType,
        c.name || c.reportedBy,
        c.status,
        new Date(c.createdAt).toLocaleDateString(),
      ]),
      startY: 20,
    });
    doc.save('stock-value-complaints.pdf');
  };

  // Resolve Complaint
  const handleResolve = async () => {
    try {
      const formData = new FormData();
      formData.append('resolutionMessage', resolutionMessage);
      if (proofFile) formData.append('proof', proofFile);

      await axios.put(
        `http://localhost:5000/api/complaints/${activeComplaint.complaintId}/resolve`,
        formData,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const updated = complaints.map((comp) =>
        comp.complaintId === activeComplaint.complaintId
          ? {
              ...comp,
              status: 'Resolved',
              resolution: resolutionMessage,
              proof: proofFile?.name || 'No file',
            }
          : comp
      );

      setComplaints(updated);
      setActiveComplaint(null);
      setResolutionMessage('');
      setProofFile(null);
    } catch (err) {
      console.error('Error resolving complaint', err);
      alert('Failed to resolve complaint');
    }
  };

  return (
    <div className="svc-container">
      <h2 className="svc-heading">📄 Stock Value Complaints</h2>

      <div className="svc-toolbar">
        <input
          type="text"
          className="svc-search"
          placeholder="Search complaints..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          className="svc-select"
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Resolved">Resolved</option>
        </select>

        <select
          className="svc-select"
          value={recordsPerPage}
          onChange={(e) => {
            setRecordsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          {[5, 10, 20].map((num) => (
            <option key={num} value={num}>
              {num} per page
            </option>
          ))}
        </select>

        <button className="download-btn" onClick={handleDownloadPDF}>
          📄 Download PDF
        </button>
      </div>

      {loading ? (
        <p className="svc-loading">Loading complaints...</p>
      ) : currentRecords.length === 0 ? (
        <p className="svc-empty">No complaints found related to stock value.</p>
      ) : (
        <table className="svc-table">
          <thead>
            <tr>
              <th>Complaint ID</th>
              <th>Item</th>
              <th>Subject</th>
              <th>Description</th>
              <th>Reported By</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((c, index) => (
              <tr key={`${c.complaintId}-${index}`}>
                <td>{c.complaintId}</td>
                <td>{c.item}</td>
                <td>{c.subject}</td>
                <td>{c.description}</td>
                <td>{c.name || c.reportedBy}</td>
                <td>
                  <span className={`status ${c.status.toLowerCase()}`}>{c.status}</span>
                </td>
                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  {c.status === 'Pending' && (
                    <button onClick={() => setActiveComplaint(c)}>🛠 Resolve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {filteredComplaints.length > recordsPerPage && (
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ⬅️ Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next ➡️
          </button>
        </div>
      )}

      {activeComplaint && (
        <div className="reply-modal">
          <div className="reply-box">
            <h3>Resolve Complaint: {activeComplaint.complaintId}</h3>
            <p><strong>User Type:</strong> {activeComplaint.userType}</p>
            <p><strong>Name:</strong> {activeComplaint.name || activeComplaint.reportedBy}</p>
            <p><strong>Email:</strong> {activeComplaint.email || activeComplaint.centerEmail}</p>
            <p><strong>Item:</strong> {activeComplaint.item}</p>
            <p><strong>Complaint Type:</strong> {activeComplaint.type}</p>
            <p><strong>Subject:</strong> {activeComplaint.subject}</p>
            <p><strong>Description:</strong> {activeComplaint.description}</p>
            <p><strong>Date:</strong> {new Date(activeComplaint.createdAt).toLocaleDateString()}</p>

            <label>Resolution Message:</label>
            <textarea
              rows={4}
              value={resolutionMessage}
              onChange={(e) => setResolutionMessage(e.target.value)}
              placeholder="Type resolution details..."
            />

            <label>Attach Proof (optional):</label>
            <input
              type="file"
              onChange={(e) => setProofFile(e.target.files[0])}
            />

            <div className="reply-buttons">
              <button onClick={handleResolve}>✅ Submit</button>
              <button
                onClick={() => {
                  setActiveComplaint(null);
                  setResolutionMessage('');
                  setProofFile(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockValueComplaints;
