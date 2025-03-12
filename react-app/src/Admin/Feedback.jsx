import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Skeleton,
  Chip,
  Avatar,
  colors,
} from "@mui/material";
import axios from "axios";

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      const response = await axios.get(
        "/server/time_entry_management_application_function/feedback"
      );

      console.log("response", response.data.data);

      if (response.status === 200) {
        setFeedback(response.data.data);
      }
      setLoading(false);
    };
    fetchFeedback();
  }, []);

  return (
    <div>
    <Container  sx={{ padding: 3 }}>
      <Box sx={{ textAlign: "center", marginBottom: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          User's Feedback
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
              }}
            >
              <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%",  width:"300px"}}>
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
                    maxHeight: '6em', // assuming each line is about 1.5em tall, adjust as necessary
                    overflowY: 'auto', // enables vertical scrolling
                    display: '-webkit-box',
                    WebkitLineClamp: 4, // limit to 3 lines
                    WebkitBoxOrient: 'vertical', 
                    flexGrow: 1, // allows this area to take up available space
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
    </Container>
    </div>
  );
};

export default Feedback;
