import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Layout1 from "./Admin/Layout1";
import EmpLayout from "./Employee/Layout1";
import Dashboard from "./Admin/Dashboard";
import Project from "./Admin/Project";
import Task from "./Admin/Task";
import Feedback from "./Admin/Feedback";
import Employees from "./Admin/Employee";
import Profile from "./Admin/Profile";
import EmpDashboard from "./Employee/Dashboard";
import EmpProject from "./Employee/Project";
import EmpTask from "./Employee/Task";
import EmpProfile from "./Employee/Profile";
import Emp from "./Employee/Employee";
import EmpFeedback from "./Employee/Feedback";
import axios from "axios";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [currUser, setCurrUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedcurrUser = localStorage.getItem("currUser");
        let userDetail = null;

        if (!savedcurrUser) {
          const result = await window.catalyst.auth.isUserAuthenticated();

          userDetail = {
            userid: result.content.user_id,
            firstName: result.content.first_name,
            lastName: result.content.last_name,
            mailid: result.content.email_id,
            timeZone: result.content.time_zone,
            createdTime: result.content.created_time,
            role: result.content.role_details.role_name,
            user_type: result.content.user_type,
            org_id: result.content.org_id,
          };
          localStorage.setItem("currUser", JSON.stringify(userDetail));
        } else {
          try {
            userDetail = JSON.parse(savedcurrUser);
          } catch (error) {
            console.error("Failed to parse currUser:", error);
            localStorage.removeItem("currUser");
          }
        }

        if (userDetail) {
          setCurrUser(userDetail);
          setUserRole(userDetail.role);
          setIsAuthenticated(true);

          const profileResponse = await axios.get(
            `/server/time_entry_management_application_function/userprofile/${userDetail.userid}`
          );
          const coverResponse = await axios.get(
            `/server/time_entry_management_application_function/usercover/${userDetail.userid}`
          );

          if (profileResponse.data.data) {
            localStorage.setItem("profileData", profileResponse.data.data);
          } else {
            localStorage.setItem(
              "profileData",
              "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
            );
          }

          if (coverResponse.data.data) {
            localStorage.setItem("coverData", coverResponse.data.data);
          } else {
            localStorage.setItem(
              "coverData",
              "https://media.licdn.com/dms/image/v2/D563DAQHzNlFsRnMJDg/image-scale_191_1128/image-scale_191_1128/0/1699936674657/fi_digital_services_cover?e=2147483647&v=beta&t=ra0dfMKNg51crI9H1y9cKrtDrSfsOhgON6X_f2Gli7g"
            );
          }
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isCheckingAuth) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <h1
          style={{
            marginBottom: "50px",
            color: "#333",
            fontFamily: "Arial, sans-serif",
            textAlign: "center",
          }}
        >
          DSV-360
        </h1>
        <div className="loader" style={{ marginTop: "30px" }}></div>
      </div>
    );
  }

  if (!currUser) {
    window.location.href = "/__catalyst/auth/login";
    return null;
  }

  return (
  
      <Routes>
        {userRole === "Super Admin" || userRole === "Admin" ? (
          <Route path="/" element={<Layout1 />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Project currUser={currUser} />} />
            <Route path="task" element={<Task />} />
            <Route path="employees" element={<Employees />} />
            <Route path="profile" element={<Profile />} />
            <Route path="feedback" element={<Feedback />} />
          </Route>
        ) : (
          <Route path="/" element={<EmpLayout />}>
            <Route index element={<EmpDashboard />} />
            <Route path="projects" element={<EmpProject currUser={currUser} />} />
            <Route path="task" element={<EmpTask />} />
            <Route path="employees" element={<Emp />} />
            <Route path="profile" element={<EmpProfile />} />
            <Route path="feedback" element={<EmpFeedback />} />
          </Route>
        )}
      </Routes>
  
  );
}

export default App;
