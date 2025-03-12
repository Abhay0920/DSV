import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";

function LoginSignup({ onLogin }) {
  const [activeTab, setActiveTab] = useState(0);
  const [loginDetails, setLoginDetails] = useState({ email: "", password: "" });
  const [signupDetails, setSignupDetails] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (event) => {
    const { name, value } = event.target;
    setSignupDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = () => {
    const adminCredentials = { email: "admin", password: "admin" };
    const employeeCredentials = { email: "employee", password: "employee" };

    if (
      loginDetails.email === adminCredentials.email &&
      loginDetails.password === adminCredentials.password
    ) {
      onLogin("Admin");
    } else if (
      loginDetails.email === employeeCredentials.email &&
      loginDetails.password === employeeCredentials.password
    ) {
      onLogin("Employee");
    } else {
      alert("Invalid credentials");
    }
  };

  const handleSignup = () => {
    if (signupDetails.password !== signupDetails.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    //console.log("Signup Details:", signupDetails);
    // Add your signup logic here
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}
    >
      <Grid item xs={12} sm={8} md={5}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>

          {activeTab === 0 && (
            <Box sx={{ marginTop: 3 }}>
              <Typography variant="h5" gutterBottom>
                Login
              </Typography>
              <TextField
                label="Email"
                name="email"
                fullWidth
                margin="normal"
                variant="outlined"
                value={loginDetails.email}
                onChange={handleLoginChange}
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                margin="normal"
                variant="outlined"
                value={loginDetails.password}
                onChange={handleLoginChange}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLogin}
                sx={{ marginTop: 2 }}
              >
                Login
              </Button>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ marginTop: 3 }}>
              <Typography variant="h5" gutterBottom>
                Sign Up
              </Typography>
              <TextField
                label="Name"
                name="name"
                fullWidth
                margin="normal"
                variant="outlined"
                value={signupDetails.name}
                onChange={handleSignupChange}
              />
              <TextField
                label="Email"
                name="email"
                fullWidth
                margin="normal"
                variant="outlined"
                value={signupDetails.email}
                onChange={handleSignupChange}
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                margin="normal"
                variant="outlined"
                value={signupDetails.password}
                onChange={handleSignupChange}
              />
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                fullWidth
                margin="normal"
                variant="outlined"
                value={signupDetails.confirmPassword}
                onChange={handleSignupChange}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSignup}
                sx={{ marginTop: 2 }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}

export default LoginSignup;
