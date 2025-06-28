import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageUsersPage.css";

const DESIGNATION_OPTIONS = ["Engineer", "Manager", "Clerk", "Technician"];

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (id, newStatus, designation) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/users/${id}/status`, {
        status: newStatus,
        designation,
      });

      setUsers((prev) =>
        prev.map((user) => (user._id === id ? res.data.user : user))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDesignationChange = async (id, newDesignation) => {
    const user = users.find((u) => u._id === id);

    if (user.designation && user.designation !== newDesignation) {
      const confirmChange = window.confirm(
        `This user already has a designation "${user.designation}". Do you want to change it to "${newDesignation}"?`
      );
      if (!confirmChange) return;
    }

    // Only update in local state for now
    setUsers((prev) =>
      prev.map((u) =>
        u._id === id ? { ...u, designation: newDesignation } : u
      )
    );
  };

  return (
    <div className="manage-users-container">
      <h2 className="manage-users-title">👥 Manage Users</h2>
      <div className="table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User Name</th>
              <th>Email</th>
              <th>Center ID</th>
              <th>Designation</th>
              <th>Status</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7">No users found.</td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.centerId || "-"}</td>
                  <td>
                    {user.designation ? (
                      <span>{user.designation}</span>
                    ) : (
                      <select
                        value={user.designation || ""}
                        onChange={(e) =>
                          handleDesignationChange(user._id, e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {DESIGNATION_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn accept"
                      onClick={() =>
                        handleStatusChange(
                          user._id,
                          "accepted",
                          user.designation
                        )
                      }
                      disabled={!user.designation || user.status === "accepted"}
                    >
                      Accept
                    </button>
                    <button
                      className="btn hold"
                      onClick={() =>
                        handleStatusChange(
                          user._id,
                          "held",
                          user.designation
                        )
                      }
                    >
                      Hold
                    </button>
                    <button
                      className="btn block"
                      onClick={() =>
                        handleStatusChange(
                          user._id,
                          "blocked",
                          user.designation
                        )
                      }
                    >
                      Block
                    </button>
                    <button
                      className="btn delete"
                      onClick={async () => {
                        if (window.confirm("Delete this user?")) {
                          await axios.delete(
                            `http://localhost:5000/api/users/${user._id}`
                          );
                          setUsers((prev) =>
                            prev.filter((u) => u._id !== user._id)
                          );
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsersPage;
