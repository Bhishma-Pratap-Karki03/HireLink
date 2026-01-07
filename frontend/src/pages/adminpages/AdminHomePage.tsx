import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminHomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    //Check if user is logged in and is admin email
    const token = localStorage.getItem("authToken");
    const userDataStr = localStorage.getItem("userData");

    if (!token) {
      navigate("/login");
      return;
    }

    if (userDataStr) {
      try {
        const user = JSON.parse(userDataStr);

        // Check if this is the admin email
        if (user.email !== "hirelinknp@gmail.com") {
          // Redirect non-admin users to appropriate home page
          if (user.role === "recruiter") {
            navigate("/recruiter-home");
          } else {
            navigate("/candidate-home");
          }
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        navigate("/login");
      }
    }
  }, [navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Home Page</h1>
      <p>Welcome to your Home Page</p>
      <button
        onClick={() => {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default AdminHomePage;
