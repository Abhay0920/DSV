import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Stack,
  Box,
} from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const ProfileCard = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isCheckedIn) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
      setTime(0);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <Card sx={{ maxWidth: 400, p: 3, borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        {/* Profile Section */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: blue[500], width: 56, height: 56 }}>A</Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Abhay Singh Patel
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Product Developer Intern 
            </Typography>
          </Box>
        </Stack>

        {/* Reporting Manager */}
        <Typography sx={{ mt: 2 }} variant="body2" color="textSecondary">
          Reporting to: <strong>John Doe</strong>
          Organization: <strong>Fistine Infotech Pvt. Ltd.</strong>
        </Typography>

        {/* Timer Section */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            backgroundColor: grey[100],
            borderRadius: 2,
            p: 1,
            mt: 2,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <AccessTimeIcon color="primary" />
          <Typography fontWeight="bold">{formatTime(time)}</Typography>
        </Stack>

        {/* Check-In / Check-Out Button */}
        <Button
          fullWidth
          variant="contained"
          color={isCheckedIn ? "error" : "primary"}
          sx={{ mt: 2 }}
          onClick={() => setIsCheckedIn(!isCheckedIn)}
        >
          {isCheckedIn ? "Check-Out" : "Check-In"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
