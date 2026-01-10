import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admincomponents/AdminSidebar";
import AdminTopBar from "../../components/admincomponents/AdminTopBar";
import "../../styles/AdminDashboard.css"; // Make sure to import the CSS

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="admin-profile-page-container">
      {" "}
      {/* Use the same container class */}
      <div className="admin-profile-layout">
        {" "}
        {/* Use the same layout class */}
        {/* Admin Sidebar */}
        <AdminSidebar />
        {/* Main Content Area */}
        <div className="admin-profile-main-area">
          {/* Top Bar */}
          <div className="admin-profile-topbar-wrapper">
            <AdminTopBar />
          </div>

          {/* Scrollable Content */}
          <div className="admin-profile-scrollable-content">
            <div className="admin-profile-content-wrapper">
              <div className="admin-profile-page-header">
                <h1>Admin Dashboard</h1>
                <p>Manage your platform and monitor system activities</p>
              </div>

              {/* Dashboard Content */}
              <div className="admin-dashboard-content">
                <div className="admin-welcome-message">
                  <h2>Welcome to Admin Dashboard</h2>
                  <p>
                    Manage users, monitor reports, and configure system settings
                    from here.
                  </p>
                </div>

                {/* Add more dashboard components here */}
                <div className="admin-dashboard-stats">
                  {/* You can add statistics cards here */}
                  <div className="admin-stat-card">
                    <h3>Total Users</h3>
                    <p className="admin-stat-number">1,234</p>
                  </div>
                  <div className="admin-stat-card">
                    <h3>Active Jobs</h3>
                    <p className="admin-stat-number">567</p>
                  </div>
                  <div className="admin-stat-card">
                    <h3>New Messages</h3>
                    <p className="admin-stat-number">89</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
