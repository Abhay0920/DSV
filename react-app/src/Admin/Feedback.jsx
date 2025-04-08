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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const feedbackData = useSelector((state)=> state.feedbackReducer)
  useEffect(() => {
    const fetchFeedback = async () => {
      // const response = await axios.get(
      //   "/server/time_entry_management_application_function/feedback"
      // );

      const response = feedbackData;
      setFeedback(response.data.data);
      console.log("response", response.data.data);

      // if (response.status === 200) {
      //   setFeedback(response.data.data);
      // }
      setLoading(false);
    };
    fetchFeedback();
  }, []);

  const filteredFeedback = feedback.filter((item) =>
    statusFilter ? item.Status.toString() === statusFilter : true
  );


  const sortedFeedback = [...filteredFeedback].sort((a, b) => {
    return sortOrder === "ASC"
      ? new Date(a.MODIFIEDTIME) - new Date(b.MODIFIEDTIME)
      : new Date(b.MODIFIEDTIME) - new Date(a.MODIFIEDTIME);
  });
  
  return (
    <div>
    <Box  sx={{ padding: 3,}}>
      <Box sx={{ textAlign: "center", marginBottom: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
          User's Feedback
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <FormControl sx={{ minWidth: 150 }}>
          {/* <InputLabel>Status</InputLabel> */}
          <TextField
          label="Status"
          name="status"
          fullWidth
          variant="outlined"
          select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Fixed</MenuItem>
            <MenuItem value="false">Will Fix Soon</MenuItem>
          </TextField>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          {/* <InputLabel>View Mode</InputLabel> */}
          <TextField
           label="View Mode"
           name="View Mode"
           fullWidth
           variant="outlined"
           select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
          >
            <MenuItem value="card">Card View</MenuItem>
            <MenuItem value="table">Table View</MenuItem>
          </TextField>
        </FormControl>

        <FormControl sx={{ minWidth: 150}}>
        <TextField
                  label="Date"
                  name="Date"
                  fullWidth
                  variant="outlined"
                  select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  
                >
                  <MenuItem value="ASC">ASC</MenuItem>
                  <MenuItem value="DESC">DESC</MenuItem>
                </TextField>
              </FormControl>
      </Box>


     <div>
          {viewMode === "card" ? (
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
              height: '100%', // Make sure the card takes up the full height of the container
              display: 'flex',
              flexDirection: 'column', // Ensure card content is stacked vertically
              justifyContent: 'space-between',
            }}
          >
            <CardContent>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width="80%" height={30} sx={{ marginTop: 1 }} />
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="rectangular" width="100%" height={60} sx={{ marginTop: 2 }} />
              <Skeleton variant="text" width="50%" height={15} sx={{ marginTop: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      ))
    : sortedFeedback.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item.id}>
          <Card
            component={Paper}
            elevation={4}
            sx={{
              borderRadius: 3,
              height: 220, // Explicit height to maintain uniformity
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': { transform: 'scale(1.05)' },
              padding:"5px"
            }}
          >
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                padding: 1,
                justifyContent: 'space-between', // Ensure content is spread evenly
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 1 }}>
                <Avatar>{item.Name.charAt(0).toUpperCase()}</Avatar>
                <Box>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    {item.Name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ wordBreak: 'break-all' }}>
                    {item.Email}
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="body1"
                sx={{
                  marginBottom: 1,
                  overflowY: 'auto', // Enable scrolling for overflowed content
                  maxHeight: '6em', // Max height for the message
                  display: '-webkit-box',
                  WebkitLineClamp: 4, // Limit message to 4 lines
                  WebkitBoxOrient: 'vertical',
                  flexGrow: 1, // Allow this area to grow and fill the space
                }}
              >
                {item.Message}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto', // Pushes the date and status to the bottom
                }}
              >
                <Chip
                  label={new Date(item.MODIFIEDTIME).toLocaleString()}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={item.Status ? 'Fixed' : 'Will Fix Soon'}
                  sx={{
                    backgroundColor: item.Status ? 'lightgreen' : '#D3D3D3',
                    color: item.Status ? 'green' : 'initial',
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
</Grid>

      ) : (
        <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#1976d2" }}>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Name</TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Email</TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Message</TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
              Date{" "}
             
            </TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedFeedback.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.Name}</TableCell>
              <TableCell>{item.Email}</TableCell>
              <TableCell>{item.Message}</TableCell>
              <TableCell>{new Date(item.MODIFIEDTIME).toLocaleString()}</TableCell>
              <TableCell>
                <Chip
                  label={item.Status ? "Fixed" : "Will Fix Soon"}
                  sx={{
                    backgroundColor: item.Status ? "lightgreen" : "#D3D3D3",
                    color: item.Status ? "green" : "initial",
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
      )}
       </div>
    </Box>


    </div>
  );
};

export default Feedback;
