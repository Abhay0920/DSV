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
  alpha,
  useTheme,
  Alert,
} from "@mui/material";
import axios from "axios";
import RateReviewIcon from "@mui/icons-material/RateReview";

const Feedback = () => {
  const theme = useTheme();
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
  const [error, setError] = useState("");

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
      setError("Message cannot be empty.");
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
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.08
          )} 0%, ${alpha(theme.palette.primary.light, 0.15)} 100%)`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              width: "100%",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {/* Icon + Heading */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 50,
                  height: 50,
                }}
              >
                <RateReviewIcon sx={{ color: "#fff" }} />
              </Avatar>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: { xs: 1, sm: 0 },
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  display: "inline-block",
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                Feedback Form
              </Typography>
            </Box>
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
              error={!!error}
              helperText={error}
            />
            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
          </form>
        </Box>
      </Paper>

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
                        height: 220,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "transform 0.3s ease-in-out",
                        "&:hover": { transform: "scale(1.05)" },
                        padding: "5px",
                      }}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          padding: 1,
                          justifyContent: "space-between",
                        }}
                      >
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
                            <Typography
                              variant="h6"
                              color="primary"
                              sx={{ fontWeight: "bold" }}
                            >
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
                            overflowY: "auto", // Enables vertical scrolling
                            maxHeight: "6em", // Adjust this as needed
                            display: "-webkit-box",
                            WebkitLineClamp: 4, // Limit to 4 lines
                            WebkitBoxOrient: "vertical", // Necessary for line clamp
                            flexGrow: 1, // Allows this area to take up available space
                            // width: '100%', // Ensure it doesn't overflow horizontally
                            // wordWrap: 'break-word', // Breaks long words that may overflow horizontally
                            // overflowX: 'hidden'
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
                            label={
                              item.Status === "true"
                                ? "Fixed"
                                : "Will Fixed Soon"
                            }
                            sx={{
                              backgroundColor:
                                item.Status === "true" ? "lightgreen" : "",
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
