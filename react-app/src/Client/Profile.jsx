import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ButtonGroup,
  Skeleton,
  Input,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import Slide from "@mui/material/Slide";
import { Business } from "@mui/icons-material";

import CloudDownloadSharpIcon from "@mui/icons-material/CloudDownloadSharp";
import CloudUploadSharpIcon from "@mui/icons-material/CloudUploadSharp";
import axios from "axios";

const profile = require("../../public/contactProfile.png");
const coverImage = require("../../public/contactCover.png");

function Profile() {
  const [userDetail, setUserDetail] = useState({});
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const getUserDetail = async () => {
      const user = JSON.parse(localStorage.getItem("currUser"));
      console.log("user", user);
      setUserDetail(user);

      console.log("userDetail", userDetail);

      try {
        const contactRes = await axios.get(
          `/server/time_entry_management_application_function/contactData/${user.userid}`
        );

        const contactData = contactRes.data.data[0].Client_Contact;
        console.log("contactData", contactData);
        setUserInfo(contactData);
        console.log("userInfo", userInfo);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserDetail();
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  function SlideTransition(props) {
    return <Slide {...props} direction="down" />;
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box
        sx={{
          position: "relative",
          height: 200,
          backgroundImage: `url( "https://scontent-bom1-2.xx.fbcdn.net/v/t39.30808-6/367709073_722498016556740_2958855278498819119_n.png?_nc_cat=100&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=x0wuewO_JNgQ7kNvwHDpy66&_nc_oc=AdkMce1FTBl9hyilycnVwl7gV2HS4x2T1-serW3F0DsK7bS18s7kpVo9pPH9necaCAs&_nc_zt=23&_nc_ht=scontent-bom1-2.xx&_nc_gid=P2i33bIlkd-PoLpWlfureQ&oh=00_AfH1KZ3ZX-VBjZwLLrKHL3i-aGgwwz7O6bvIsEXvwSPXOw&oe=67FD920B")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 2,
          overflow: "hidden",
        }}
      />

      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          marginTop: -8,
          marginLeft: 3,
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          {loading ? (
            <Skeleton variant="circular" width={150} height={150} />
          ) : (
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={profile}
                sx={{ width: 150, height: 150, border: "4px solid white" }}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ marginLeft: 3, marginTop: 6 }}>
          {loading ? (
            <>
              <Skeleton variant="text" width={200} height={40} />
              <Skeleton variant="text" width={150} height={30} />
            </>
          ) : (
            <>
              <Typography variant="h4">
                {userDetail.firstName + " " + userDetail.lastName}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {userDetail.role}
              </Typography>
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">Organization Detail</Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: "#1976d2", // MUI blue color
                    marginRight: 1,
                  }}
                >
                  <Business sx={{ fontSize: 18, color: "#fff" }} />
                </Avatar>
                <Chip
                  label={userInfo.Org_Name || "Not provided"}
                  color="primary"
                  variant="filled"
                  size="medium"
                  sx={{
                    fontWeight: "bold",
                    textTransform: "capitalize",
                    borderRadius: 2,
                  }}
                />
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography variant="h6">
                          Contact Information
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <strong>Email:</strong>
                      </TableCell>
                      <TableCell>{userDetail.mailid}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Phone:</strong>
                      </TableCell>
                      <TableCell>{userInfo.Phone}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Created At:</strong>
                      </TableCell>
                      <TableCell>{userDetail.createdTime}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={SlideTransition}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            "&.MuiAlert-standardSuccess": {
              backgroundColor: "#4caf50",
              color: "#fff",
            },
            "&.MuiAlert-standardError": {
              backgroundColor: "#f44336",
              color: "#fff",
            },
            "& .MuiAlert-icon": {
              color: "#fff",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Profile;
