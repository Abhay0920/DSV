import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  Skeleton,
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

const Feedback = () => {
  const [userid, setUserid] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetch = async () => {
      const userData = await JSON.parse(localStorage.getItem("currUser"));
      setUserid(userData.userid);
      setName(userData.firstName + " " + userData.lastName);
      setEmail(userData.mailid);

      const response = await axios.get(
        "/server/time_entry_management_application_function/feedback"
      );

      console.log("response", response.data.data);

      const feedbackData = response.data.data.filter(
        (feedback) => feedback.User_ID === userData.userid
      );

      if (response.status === 200) {
        setFeedback(feedbackData);
      }
      setLoading(false);
    };

    fetch();
  }, []);

  const handleAlert = (severity, message) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }
    console.log("Feedback submitted:", { name, email, message, userid });

    try {
      const response = await axios.post(
        "/server/time_entry_management_application_function/feedback",
        {
          Name: name.trim(),
          Email: email.trim(),
          Message: message.trim(),
          User_ID: userid,
        }
      );

      console.log("Response:", response.data.data);
      setFeedback([response.data.data, ...feedback]);

      if (response.status === 200) {
        handleAlert("success", "Feedback submitted successfully");
        setMessage("");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      handleAlert("error", "Failed to submit feedback. Please try again.");
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container sx={{ padding: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3,
        }}
      >
        <Typography variant="h4"> Feedback Form</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          disabled
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          disabled
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth
          label="Message"
          variant="outlined"
          margin="normal"
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button variant="contained" color="primary" type="submit">
          Submit
        </Button>
      </form>

      {feedback.length ? (
        <>
          <Box sx={{ textAlign: "center", marginBottom: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
              Your's Feedback
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {loading
              ? Array.from(new Array(6)).map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      component={Paper}
                      elevation={3}
                      sx={{
                        padding: 2,
                        borderRadius: 3,
                        height: 200,
                      }}
                    >
                      <CardContent>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton
                          variant="text"
                          width="80%"
                          height={30}
                          sx={{ marginTop: 1 }}
                        />
                        <Skeleton variant="text" width="60%" height={20} />
                        <Skeleton
                          variant="rectangular"
                          width="100%"
                          height={60}
                          sx={{ marginTop: 2 }}
                        />
                        <Skeleton
                          variant="text"
                          width="50%"
                          height={15}
                          sx={{ marginTop: 2 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              : feedback.map((item) => (
                   <Grid item xs={12} sm={6} md={4} key={item.id}>
                              <Card
                                component={Paper}
                                elevation={4}
                                sx={{
                                  borderRadius: 3,
                                  height: 230,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "space-between",
                                  transition: "transform 0.3s ease-in-out",
                                  "&:hover": { transform: "scale(1.05)" },
                                }}
                              >
                                <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                  <Box
                                    sx={{
                                     
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 2,
                                      marginBottom: 1,
                                    }}
                                  >
                                    <Avatar>{item.Name.charAt(0).toUpperCase()}</Avatar>
                                    <Box>
                                      <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
                                        {item.Name}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        {item.Email}
                                      </Typography>
                                    </Box>
                                  </Box>
                            
                                  <Typography
                                      variant="body1"
                                      sx={{
                                        marginBottom: 1,
                                        maxHeight: '6em', // Adjust this as needed
                                        overflowY: 'auto', // Enables vertical scrolling
                                        display: '-webkit-box',
                                        WebkitLineClamp: 4, // Limit to 4 lines
                                        WebkitBoxOrient: 'vertical', // Necessary for line clamp
                                        flexGrow: 1, // Allows this area to take up available space
                                        width: '100%', // Ensure it doesn't overflow horizontally
                                        wordWrap: 'break-word', // Breaks long words that may overflow horizontally
                                        overflowX: 'hidden'
                                      }}
                                    >
                                      {item.Message}
                                    </Typography>
                            
                                  <Box
                                    sx={{
                                      display: "flex",
                                     
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      marginTop: "auto", // pushes the date and status to the bottom
                                    }}
                                  >
                                    <Chip
                                      label={new Date(item.MODIFIEDTIME).toLocaleString()}
                                      color="primary"
                                      variant="outlined"
                                    />
                                    <Chip
                                      label={item.Status ? "Fixed" : "Will Fixed Soon"}
                                      sx={{
                                        backgroundColor: item.Status ? "lightgreen" : "",
                                      }}
                                    />
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid> 
                ))}
          </Grid>
        </>
      ) : (
        <></>
      )}

      {/* Snackbar component to display alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Feedback;
