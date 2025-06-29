import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Complaint.css";

function Complaint({ userType }) {
  const [mode, setMode] = useState("file");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    centerId: "",
    designation: "",
    item: "",
    type: "",
    subject: "",
    description: "",
    userType: userType,
  });

  const [userDetails, setUserDetails] = useState(null);
  const [trackInput, setTrackInput] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [trackMode, setTrackMode] = useState("email");

  const complaintTypes = {
    guest: ["Power Outage", "High Bill", "Pole Issue", "Transformer Issue", "Others"],
    user: ["Damaged Equipment", "Stock Shortage", "Delay in Supply", "Meter Fault", "Others"],
  };

  useEffect(() => {
    const getUserDetails = async () => {
      if (userType === "user") {
        try {
          const res = await axios.get("http://localhost:5000/api/users/me", {
            withCredentials: true,
          });
          setUserDetails(res.data);
          setFormData((prev) => ({
            ...prev,
            name: res.data.fullName || "",
            email: res.data.email || "",
            centerId: res.data.centerId || "",
            designation: res.data.designation || "",
          }));
        } catch (err) {
          console.error("Error fetching user details", err);
        }
      }
    };
    getUserDetails();
  }, [userType]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length > 1) {
        axios
          .get(`http://localhost:5000/api/stocks/search?q=${searchTerm}`)
          .then((res) => setSuggestions(res.data))
          .catch((err) => console.error(err));
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData, userType };

      await axios.post("http://localhost:5000/api/complaints", dataToSend, {
        withCredentials: true,
      });

      alert("Complaint submitted successfully!");
      setFormData({
        name: "",
        email: "",
        centerId: "",
        designation: "",
        item: "",
        type: "",
        subject: "",
        description: "",
        userType: userType,
      });
      setSearchTerm("");
      setSuggestions([]);
    } catch (err) {
      console.error(err);
      alert("Failed to submit complaint.");
    }
  };

  const handleTrack = async () => {
    if (!trackInput) return alert("Please enter the required field");

    try {
      const res = await axios.get("http://localhost:5000/api/complaints", {
        params:
          trackMode === "complaintId"
            ? { complaintId: trackInput }
            : { userType, identifier: trackInput },
        withCredentials: true,
      });
      setComplaints(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch complaints");
    }
  };

  return (
    <div className="complaint-form-container">
      <div className="mode-toggle">
        <button
          onClick={() => setMode("file")}
          className={mode === "file" ? "active" : ""}
        >
          File Complaint
        </button>
        <button
          onClick={() => setMode("track")}
          className={mode === "track" ? "active" : ""}
        >
          Track Complaints
        </button>
      </div>

      {mode === "file" ? (
        <form className="complaint-form" onSubmit={handleSubmit}>
          <p>
            <strong>User Type:</strong> {userType}
          </p>

          {userType === "guest" ? (
            <>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </>
          ) : (
            <>
              <input type="text" value={userDetails?.fullName || ""} readOnly />
              <input type="email" value={userDetails?.email || ""} readOnly />
              <input type="text" value={userDetails?.centerId || ""} readOnly />
              <input type="text" value={userDetails?.designation || ""} readOnly />
            </>
          )}

          <div className="autocomplete-container">
            <input
              type="text"
              placeholder="Item Name"
              value={formData.item}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setFormData({ ...formData, item: e.target.value });
              }}
              required
            />
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setFormData({ ...formData, item: item.itemName });
                      setSearchTerm(item.itemName);
                      setSuggestions([]);
                    }}
                  >
                    {item.itemName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          >
            <option value="">Select Complaint Type</option>
            {complaintTypes[userType === "guest" ? "guest" : "user"].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Subject"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            required
          />

          <textarea
            placeholder="Description"
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />

          <button type="submit">Submit Complaint</button>
        </form>
      ) : (
        <div className="track-section">
          <p>
            <strong>User Type:</strong> {userType || "guest"}
          </p>

          <div className="track-controls">
            <select
              value={trackMode}
              onChange={(e) => setTrackMode(e.target.value)}
            >
              <option value="email">Track by Email</option>
              <option value="complaintId">Track by Complaint ID</option>
            </select>

            <input
              type="text"
              placeholder={
                trackMode === "email"
                  ? userType === "guest"
                    ? "Enter your Email"
                    : "Enter Center Email"
                  : "Enter Complaint ID"
              }
              value={trackInput}
              onChange={(e) => setTrackInput(e.target.value)}
            />
            <button onClick={handleTrack}>Fetch Complaints</button>
          </div>

          <div className="complaints-list">
            {complaints.length === 0 ? (
              <p>No complaints found.</p>
            ) : (
              complaints.map((comp, i) => (
                <div key={i} className="complaint-card improved">
                  <div className="complaint-header">
                    <h3>{comp.subject}</h3>
                    <span className={`status ${comp.status?.toLowerCase() || "pending"}`}>
                      {comp.status || "Pending"}
                    </span>
                  </div>
                  <p><strong>Complaint ID:</strong> {comp.complaintId}</p>
                  <p><strong>Filed by:</strong> {comp.userType === "guest" ? comp.name : comp.centerId}</p>
                  <p><strong>Item:</strong> {comp.item}</p>
                  <p><strong>Type:</strong> {comp.type}</p>
                  <p><strong>Description:</strong> {comp.description}</p>
                  <p><strong>Created At:</strong> {new Date(comp.createdAt).toLocaleString()}</p>

                  {comp.resolution && (
                    <div className="resolution-box">
                      <strong>Resolution:</strong>
                      <p>{comp.resolution}</p>
                    </div>
                  )}

                  {comp.proof && (
                    <div className="proof-box">
                      <strong>Proof:</strong>
                      <img
                        src={`http://localhost:5000${comp.proof}`}
                        alt="Proof"
                        className="proof-img"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Complaint;
