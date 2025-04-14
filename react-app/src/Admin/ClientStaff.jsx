import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TableFooter,
  TablePagination,
  Drawer,
  MenuItem,
  Modal,
  Chip,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
} from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import { FaProjectDiagram } from "react-icons/fa";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchClientContact,
  clientContactActions,
  setFilteredClientContact,
} from "../redux/Client/contacts";
import axios from "axios";
import { fetchClientData } from "../redux/Client/clientSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useLocation } from "react-router-dom";
export const ClientStaff = () => {

    const location = useLocation();
    
    const { Org_Id } = location.state || {}; 
    const { Org_Name } = location.state || {}; 
   
    console.log("organization:",Org_Name);

  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [staff, setStaff] = useState([]);
  const [show, setShow] = useState(false);
  const [alertLabel, setAlertLabel] = useState("");
  const [alerttype, setalerttype] = useState("");
  const [newClientStaff, setNewClientStaff] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    mobile: "",
    orgId: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
   const [errors, setErrors] = useState({});
  const [org, setorg] = useState([]);
  const theme = useTheme();

  const dispatch = useDispatch();
  const { data, isLoading } = useSelector(
    (state) => state.clientContactReducer
  );
  const { data: client } = useSelector((state) => state.clientReducer);
 

  useEffect(() => {
      dispatch(fetchClientContact());
      dispatch(fetchClientData());

  }, [dispatch]);

  const handleSearch = (event) => {
    setSearchQuery(event?.target?.value);
  };

  const handleAlert = (severity, message) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  function SlideTransition(props) {
    return <Slide {...props} direction="down" />;
  }
  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "organization") {
      const selectedOption = client.find((option) => option.ROWID === value);
      if (selectedOption) {
        setNewClientStaff((prev) => ({
          ...prev,
          organization: selectedOption.Org_Name,
          orgId: selectedOption.ROWID,
        }));
      }
    } else setNewClientStaff((prev) => ({ ...prev, [name]: value }));

    console.log("input is chang");
  };

  const handleAddClientStaff = async () => {
    if (
      newClientStaff.firstName &&
      newClientStaff.lastName &&
      newClientStaff.email &&
      newClientStaff.mobile &&
      newClientStaff.organization &&
      newClientStaff.orgId
    ) {
      console.log("Adding ClientStaff:", newClientStaff);

      try {
        const response = await axios.post(
          "/server/time_entry_management_application_function/addContact",
          {
            first_name: newClientStaff.firstName,
            last_name: newClientStaff.lastName,
            org_name: newClientStaff.organization,
            email_id: newClientStaff.email,
            org_id: newClientStaff.orgId,
            phone: newClientStaff.mobile,
          }
        );

        console.log("API Response:", response.data.data);
        if (response.status == 200) {
          dispatch(clientContactActions.addClientStaffData(response.data.data));
        }

        // Ensure user details are correctly received
        const userDetails = response.data.data;
        if (!userDetails) {
          throw new Error("User details not found in response.");
        }

        // Update employees state
        // setStaff((prev) => {
        //   const updatedStaff = [...prev, userDetails];
        //   console.log("Updated Employees List:", updatedStaff);
        //   return updatedStaff;
        // });

        // Show success alert
        handleAlert("success", "Client Contact Added and confirmed.");

        // Close drawer & reset form
        setDrawerOpen(false);
        setNewClientStaff({}); // Reset to an empty object
      } catch (error) {
        console.error("Error adding employee:", error);

        // Handle error alert
        handleAlert(
          "error",
          error.response?.data?.message ||
            error.message ||
            "Something went wrong!"
        );
      }
    } else {
      handleAlert("error", "Please fill all fields");
    }
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event?.target?.value, 10));
    setPage(0);
  };

  const filteredStaff = data?.filter(
    (stf) =>
      // return(
      stf.First_Name &&
      stf.First_Name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginatedStaff = filteredStaff?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const validateForm = () => {
    let newErrors = {};

    if (!newClientStaff.firstName)
      newErrors.firstName = "First name is required";
    if (!newClientStaff.email) newErrors.email = "email  is required";

    if (!newClientStaff.organization) newErrors.organization = "organization is required";
    if (!newClientStaff.mobile)
      newErrors.mobile = "mobile type  is required";
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
    handleAddClientStaff(newClientStaff);
      toggleDrawer(false);
    }

    console.log("adding the staff");
  };

  return (
    <>
      <Box sx={{ padding: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 3,
          }}
        >
          <Typography variant="h4">Client Contacts</Typography>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TextField
              label="Search Client "
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearch}
              sx={{ width: "40%" }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => toggleDrawer(true)}
            >
              Add ClientStaff
            </Button>
          </CardContent>
        </Card>
        <Grid item xs={12}>
          {data.length == 0 ? (
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                  }}
                >
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Frist Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Last Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Organization
                  </TableCell>

                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Contacts
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "300px",
                        gap: 2,
                      }}
                    >
                      {[...Array(6)].map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            width: "100%",
                            height: "40px",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Skeleton variant="text" width="8%" />
                          <Skeleton variant="text" width="15%" />
                          <Skeleton variant="text" width="10%" />
                          <Skeleton variant="text" width="12%" />
                          <Skeleton variant="text" width="15%" />
                          <Skeleton variant="text" width="12%" />
                          <Skeleton variant="text" width="12%" />
                          <Skeleton variant="text" width="8%" />
                          <Skeleton variant="text" width="8%" />
                        </Box>
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : paginatedStaff?.length === 0 ? (
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                  }}
                >
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    First Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Last Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Organization
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "300px",
                        gap: 2,
                      }}
                    >
                      <ConnectWithoutContactIcon
                        sx={{
                          display: "block",
                          margin: "0 auto",
                          fontSize: 100,
                        }}
                      />
                      <Typography variant="h6" color="text.secondary">
                        No Client Contact Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You does not have any client contacts
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#1976d2" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      ID
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      First Name
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Last Name
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Email
                    </TableCell>

                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Organization
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Contacts
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                {data.length === 0 ? (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0 }}>
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            p: 2,
                          }}
                        >
                          {[...Array(6)].map((_, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                width: "100%",
                                height: "40px",
                                alignItems: "center",
                                gap: 2,
                                animation: "pulse 1.5s ease-in-out infinite",
                                "@keyframes pulse": {
                                  "0%": {
                                    opacity: 1,
                                  },
                                  "50%": {
                                    opacity: 0.4,
                                  },
                                  "100%": {
                                    opacity: 1,
                                  },
                                },
                              }}
                            >
                              <Skeleton
                                variant="text"
                                width="8%"
                                animation="wave"
                                sx={{ transform: "none" }}
                              />
                              <Skeleton
                                variant="text"
                                width="20%"
                                animation="wave"
                                sx={{ transform: "none" }}
                              />
                              <Skeleton
                                variant="text"
                                width="15%"
                                animation="wave"
                                sx={{ transform: "none" }}
                              />
                              <Skeleton
                                variant="text"
                                width="20%"
                                animation="wave"
                                sx={{ transform: "none" }}
                              />
                              <Skeleton
                                variant="text"
                                width="15%"
                                animation="wave"
                                sx={{ transform: "none" }}
                              />
                              <Skeleton
                                variant="text"
                                width="15%"
                                animation="wave"
                                sx={{ transform: "none" }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) : (
                  <TableBody>
                    {paginatedStaff?.map((data) => (
                      <TableRow key={data.ROWID}>
                        <TableCell>
                          {"Cl" + data.ROWID?.substr(data.ROWID.length - 4)}
                        </TableCell>
                        <TableCell>{data.First_Name}</TableCell>

                        <TableCell>{data.Last_Name}</TableCell>
                        <TableCell>{data.Email}</TableCell>
                        <TableCell>{data.Org_Name}</TableCell>
                        <TableCell>{data.Phone}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {/* Switch with label */}
                            <FormControlLabel
                              control={
                                <Switch
                                // checked={employee.status === "ACTIVE"}
                                // onChange={() => toggleUserActive(employee.user_id, employee.status)}
                                />
                              }
                              // label={employee.status === "ACTIVE" ? "Active" : "Inactive"}
                            />

                            {/* Delete Icon */}
                            <IconButton
                              color="error"
                              // onClick={() => handleDeleteClick(project)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )}

                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 20]}
                      count={filteredStaff?.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          )}
        </Grid>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => toggleDrawer(false)}
        >
          <Box
            sx={{
              width: 400,
              padding: 2,
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
              marginTop: "70px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Typography variant="h5">Add Client Contact</Typography>
              <IconButton onClick={() => toggleDrawer(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <TextField
              label="First Name"
              name="firstName"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
              error={!!errors.firstName}
              helperText={errors.firstName}
            />

            <TextField
              label="Last Name"
              name="lastName"
              fullWidth
              variant="outlined"
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
              // error={!!errors.last_name}
              // helperText={errors.last_name}
            />

            <TextField
              label="Email"
              name="email"
              fullWidth
              variant="outlined"
              type="email"
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              label="Organization"
              name="organization"
              fullWidth
              variant="outlined"
              select
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
              error={!!errors. organization}
              helperText={errors. organization}
            >
              {client?.map((organization) => (
                <MenuItem key={organization.ROWID} value={organization.ROWID}>
                  {organization.Org_Name}
                </MenuItem>
              ))}
             
             
            </TextField>

            <TextField
              label="Contact Number"
              name="mobile"
              fullWidth
              variant="outlined"
              type="text"
              onChange={handleInputChange}
              sx={{ marginBottom: 2 }}
              error={!!errors.mobile}
              helperText={errors.mobile}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 3,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </Drawer>

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
    </>
  );
};
