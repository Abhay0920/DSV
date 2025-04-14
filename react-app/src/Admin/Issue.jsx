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
  TableFooter,
  TablePagination,
  IconButton,
  Drawer,
  MenuItem,
  useTheme,
  Chip,
  Autocomplete,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,
  Modal,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { FaUsers } from "react-icons/fa";
import Slide from "@mui/material/Slide";
import { FormControl, InputLabel, Select } from '@mui/material';


import Skeleton from "@mui/material/Skeleton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { FaBug } from "react-icons/fa6";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchIssueData } from "../redux/Client/issueSlice";
import { issuesActions } from "../redux/Client/issueSlice";
const statusOptions = ["Open", "In Progress", "Completed"];

const statusConfig = {
  Open: {
    color: "#f0ad4e",
    backgroundColor: "#fff3cd",
    borderColor: "#ffeeba",
  },
  "In Progress": {
    color: "#0d6efd",
    backgroundColor: "#cfe2ff",
    borderColor: "#b6d4fe",
  },
  Completed: {
    color: "#198754",
    backgroundColor: "#d1e7dd",
    borderColor: "#badbcc",
  },
  "Work In Process": {
    color: "#0d6efd",
    backgroundColor: "#cfe2ff",
    borderColor: "#b6d4fe",
  },
  Close: {
    color: "#dc3545",
    backgroundColor: "#f8d7da",
    borderColor: "#f5c2c7",
  },
};

export const Issues = () => {
  const theme = useTheme();
  const location = useLocation();
  const { projectId } = location.state || {};
  const { projectName } = location.state || {}; // Access projectId from state

  const [issue, setIssue] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentIssue, setCurrentIssue] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewTask, setViewTask] = useState(null);
  const [assignOptions, setAssignOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);

  const [TaskName, setTaskName] = useState("");
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [newIssue, setnewIssue] = useState({
    Status: "",
    Description: "",
    Due_Date: "",
    Issue_name: "",
    Project_ID: "",
    Severity: "",
    Project_Name: " ",
    Reporter_ID: "",
    Assignee_ID: "",
    Reporter_Name: " ",
    Assignee_Name: "",
  });
  const [filter, setFilter] = useState("all"); // "all" or "unassigned"

  const [currUser, setCurrUser] = useState({});

  const Projects = useSelector((state) => state.projectReducer);
  const Employees = useSelector((state) => state.employeeReducer);

  console.log("Employee", Employees?.data?.users);
  const dispatch = useDispatch();

  const { data, isLoading } = useSelector((state) => state.issueReducer);
  console.log("issuedata", data);

  useEffect(() => {
    dispatch(fetchIssueData());
  }, [dispatch]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //       const user = JSON.parse(localStorage.getItem("currUser"));
  //       setCurrUser(user);

  //       console.log("user", user);

  //       const userRole = user.role;
  //       const userID = user.userid;

  //       // const issueResponse = await axios.get(
  //       //   `/server/time_entry_management_application_function/issue`
  //       // );

  //       // console.log("response from issue", issueResponse);

  //       // const issueFromResponse = issueResponse.data.data.map((item) => ({
  //       //   id: item.ROWID,
  //       //   issueId: item.ROWID,
  //       //   name: item.Issue_name,
  //       //   projectId: item.Project_ID,
  //       //   project_name: item.Project_Name,
  //       //   assignTo: item.Assignee_Name,
  //       //   assignToID: item.Assignee_ID,
  //       //   status: item.Status,
  //       //   severity: item.Severity,
  //       //   dueDate: item.Due_Date,
  //       //   description: item.Description,
  //       //   reporter: item.Reporter_Name,
  //       //   CreationTime: item.CREATEDTIME.split(" ")[0],
  //       // }));
  //       // console.log("response from issue ", issueFromResponse);
  //       // if (projectId ) {
  //       //   setTaskName(projectName);
  //       // } else {
  //       //   setTaskName("issue");
  //       // }
  //       // setIssue(issueFromResponse);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, []);

  const [anchorEl, setAnchorEl] = useState(null); // Manage Popover state
  const [selectedAssignees, setSelectedAssignees] = useState([]); // Store assignees

  // Handle Popover open
  const handleAssigneeClick = (event, assignTo) => {
    setAnchorEl(event.currentTarget); // Set the Popover anchor element
    setSelectedAssignees(assignTo.split(",")); // Split the assignees string by commas
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };
  
  // Close the Popover
  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const validateForm = () => {
    let newErrors = {};

    if (!newIssue.Project_ID) newErrors.Project_ID = "Project is required";
    if (!newIssue.Issue_name) newErrors.Issue_name = "issue name is required";
    if (!newIssue.Assignee_ID)
      newErrors.Assignee_ID = "At least one user must be assigned";
    if (!newIssue.Status) newErrors.Status = "Status is required";
    if (!newIssue.Severity) newErrors.Severity = "Severity  is required";
    if (!newIssue.Due_Date) newErrors.Due_Date = "Due date is required";
    // if (
    //   newIssue.startDate &&
    //   newIssue.endDate &&
    //   newIssue.startDate > newIssue.endDate
    // )
    //   newErrors.endDate = "End date cannot be before start date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const filteredissue = data?.filter((isue) =>
  //   isue?.Issue_name?.toLowerCase().includes(searchQuery?.toLowerCase() || "")
  // );
  const filteredissue = data?.filter((issue) => {
    const matchesSearch = issue?.Issue_name?.toLowerCase().includes(searchQuery?.toLowerCase() || "");
  
    const matchesAssignee =
      filter === "all" ? true : !issue?.Assignee_Name || issue?.Assignee_Name === "";
  
    return matchesSearch && matchesAssignee;
  });
  

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  function SlideTransition(props) {
    return <Slide {...props} direction="down" />;
  }

  const paginatedissue = filteredissue?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    console.log("name", name);
    console.log("value", value);

    // Handle Project selection
    if (name === "Project") {
      const selectedOption = Projects.data.data.find(
        (option) => option.ROWID === value
      );
      console.log("selected:", selectedOption);

      if (selectedOption) {
        setnewIssue((prev) => ({
          ...prev,
          Project_Name: selectedOption.Project_Name,
          Project_ID: value,
        }));
      }
    }

    // Handle Assignee selection (multiple selection)
    else if (name === "AssigneeID") {
      const selectedAssignees = Employees?.data?.users.filter(
        (employee) => value.includes(employee.user_id) // Check if the employee's user_id is selected
      );

      const assigneeIDs = selectedAssignees
        .map((employee) => employee.user_id)
        .join(","); // Join selected IDs as comma-separated string
      const assigneeNames = selectedAssignees
        .map((employee) => `${employee.first_name} ${employee.last_name}`)
        .join(","); // Join selected names as comma-separated string

      setnewIssue((prev) => ({
        ...prev,
        Assignee_Name: assigneeNames, // Store names as comma-separated string
        Assignee_ID: assigneeIDs, // Store IDs as comma-separated string
      }));
    }

    // For all other inputs, just update the state
    else {
      setnewIssue((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateIssue = async () => {
    console.log(currentIssue);
    const ROWID = currentIssue.ROWID;

    const updateResponse = await axios.post(
      `/server/time_entry_management_application_function/issue/${ROWID}`,
      {
        Status: currentIssue.Status,
        Description: currentIssue.Description,
        Due_Date: currentIssue.Due_Date,
        Issue_name: currentIssue.Issue_name,
        Project_ID: currentIssue.Project_ID,
        Severity: currentIssue.Severity,
        Project_Name: currentIssue.Project_Name,
        Assignee_ID: currentIssue.Assignee_ID,
        Assignee_Name: currentIssue.Assignee_Name,
      }
    );

    console.log("updateResponse", updateResponse);
    if (updateResponse.status === 200) {
      dispatch(issuesActions.updateIssueData(currentIssue));
      handleAlert("success", "Issue updated and confirmed.");
    }

    // setIssue((prev) =>
    //   prev.map((task) => (task.id === currentIssue.ROWID ? currentIssue : task))
    // );
    setCurrentIssue("");
    setEditModalOpen(false);
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    console.log("name:", name);
    console.log("value:", value);
    if (name === "Project_Name") {
      const selectedOption = Projects.data.data.find(
        (option) => option.ROWID === value
      );

      if (selectedOption) {
        setCurrentIssue((prev) => ({
          ...prev,
          Project_Name: selectedOption.Project_Name,
          Project_ID: selectedOption.ROWID,
        }));
      }
    } else if (name === "Assignee_ID") {
      const selectedValues = event.target.value;
      const selectedUsernames = selectedValues
        .map((id) => {
          const user = Employees?.data?.users.find(
            (option) => option.user_id === id
          );
          return user ? user.first_name + " " + user.last_name : "";
        })
        .filter((name) => name)
        .join(",");

      setCurrentIssue((prev) => ({
        ...prev,
        Assignee_Name: selectedUsernames,
        Assignee_ID: selectedValues.join(","),
      }));
    } else {
      setCurrentIssue((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleViewTask = (task) => {
    setViewTask(task);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (issueId) => {
    setIssueToDelete(issueId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    // setProjectToDelete(null);
  };
  const handleAddIssue = async () => {
    console.log("newIssue", newIssue);
    newIssue.Reporter_ID = currUser.userid;
    newIssue.Reporter_Name = `${currUser.firstName} ${currUser.lastName}`;

    try {
      const response = await axios.post(
        "/server/time_entry_management_application_function/issue",
        newIssue
      );
      console.log("Response Data:", response.data);
      const item = response.data.data;
      console.log("hiting cancel");
      handleCancel();
      if (response.data.success) {
        handleAlert("success", "Issue  Added and confirmed.");
        dispatch(issuesActions.addissueData(response.data.data));
      } else {
        handleAlert("error", "Something went wrong!");
        throw new Error("Invalid response data received");
      }
    } catch (error) {
      // Handle errors
      handleAlert("error", "Something went wrong!");
      console.error("Error adding task:", error);
      handleAlert("error", error.message || "Error adding task");
    }
  };

  const handleAlert = (severity, message) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseViewModal = () => {
    setViewTask(null);
    setViewModalOpen(false);
  };
  const handleCancel = () => {
    console.log("hiting cancel");
    setnewIssue({
      Status: "",
      Description: "",
      Due_Date: "",
      Issue_name: "",
      Project_ID: "",
      Severity: "",
      Project_Name: " ",
      Reporter_ID: "",
      Assignee_ID: "",
      Reporter_Name: " ",
      Assignee_Name: "",
    });
    toggleDrawer(false);
  };
  const handleSubmit = () => {
    if (validateForm()) {
      handleAddIssue();
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(
        `/server/time_entry_management_application_function/issue/${issueToDelete}`
      );

      console.log("response", response);

      if (response.status === 200) {
        handleAlert("success", "Issue  Deleted and confirmed.");
        dispatch(issuesActions.deleteissueData(issueToDelete));
        setDeleteConfirmOpen(false);
      }
    } catch (error) {
      handleAlert("error", "something went wrong");
      console.error("Error deleting issue:", error);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleEdit = (isue) => {
    console.log("name of the issue ", isue);
    setCurrentIssue(isue);
    console.log("current isusue", currentIssue);
    setEditModalOpen(true);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3,
        }}
      >
        <Typography variant="h4">Issues</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {loading ? (
                <>
                  <Skeleton
                    variant="rectangular"
                    width="40%"
                    height={40}
                    sx={{ borderRadius: 1 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={120}
                    height={40}
                    sx={{ borderRadius: 1 }}
                  />
                </>
              ) : (
                <TextField
                  label="Search Issues"
                  variant="outlined"
                  size="small"
                  // value={searchQuery}
                  // onChange={handleSearch}
                  sx={{ width: "40%" }}
                />
              )}
               <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            label="Filter"
            value={filter}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All Issues</MenuItem>
            <MenuItem value="unassigned">Unassigned Only</MenuItem>
          </Select>
        </FormControl>

              <Button
                variant="contained"
                color="primary"
                onClick={() => toggleDrawer(true)}
              >
                Submit Issue
              </Button>
            </CardContent>
          </Card>
        </Grid>

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
                    Issue ID
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Issue Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Project
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Reporter
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Creation Time
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Assignee
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Due Date
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Severity
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7}>
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
          ) : data.length === 0 ? (
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
                    Issue ID
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Issue Name
                  </TableCell>

                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Project
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Reporter
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Creation Time
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Assignee
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Due Date
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Severity
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7}>
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
                      <FaBug size={50} color={theme.palette.text.secondary} />
                      <Typography variant="h6" color="text.secondary">
                        No Issue found yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You currently don't created any Issue
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
                  <TableRow
                    sx={{ backgroundColor: theme.palette.primary.main }}
                  >
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Issue ID
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Issue Name
                    </TableCell>

                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Project
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Reporter
                    </TableCell>

                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Creation Time
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Assignee
                    </TableCell>

                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Due Date
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

                {loading ? (
                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        sx={{ width: "100%", height: "200px" }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          {[...Array(6)].map((_, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                p: 1,
                              }}
                            >
                              <Skeleton variant="text" width={80} />
                              <Skeleton variant="text" width={150} />
                              <Skeleton variant="text" width={120} />
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Skeleton
                                  variant="circular"
                                  width={24}
                                  height={24}
                                />
                                <Skeleton variant="text" width={60} />
                              </Box>
                              <Skeleton
                                variant="rectangular"
                                width={100}
                                height={32}
                                sx={{ borderRadius: 1 }}
                              />
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Skeleton
                                  variant="circular"
                                  width={32}
                                  height={32}
                                />
                                <Skeleton
                                  variant="circular"
                                  width={32}
                                  height={32}
                                />
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) : paginatedissue.length === 0 ? (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7} sx={{ p: 0 }}>
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
                              <Skeleton
                                variant="text"
                                width="15%"
                                animation="wave"
                                sx={{ transform: "none" }}
                              />
                              <Skeleton
                                variant="text"
                                width="7%"
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
                    {paginatedissue.map((isue) => (
                      <TableRow
                        key={isue.id}
                        // sx={{
                        //   backgroundColor:
                        //     !isue.Assignee_Name ||
                        //     isue.Assignee_Name.split(",").filter(
                        //       (name) => name.trim() !== ""
                        //     ).length === 0
                        //       ? "#e9ff32"
                        //       : "inherit",
                        // }}
                      >
                        <TableCell>
                          {"I" + isue.ROWID.substr(isue.ROWID.length - 4)}
                        </TableCell>
                        <TableCell>{isue.Issue_name}</TableCell>
                        <TableCell>{isue.Project_Name}</TableCell>
                        <TableCell>{isue.Reporter_Name}</TableCell>
                        <TableCell>{isue.CREATEDTIME.split(" ")[0]}</TableCell>
                        <TableCell>
                          <Chip
                            label={isue.Status}
                            size="small"
                            sx={{
                              backgroundColor:
                                statusConfig[isue.status]?.backgroundColor ||
                                "#f5f5f5",
                              color:
                                statusConfig[isue.status]?.color || "#757575",
                              border: `1px solid ${statusConfig[isue.status]?.borderColor || "#e0e0e0"}`,
                              fontWeight: 500,
                              fontSize: "0.75rem",
                              height: "24px",
                              "& .MuiChip-label": {
                                px: 1,
                              },
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Tooltip title="View Assignees">
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                handleAssigneeClick(e, isue.Assignee_Name)
                              }
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <FaUsers
                              
                                style={{
                                  color:
                                    isue.Assignee_Name.length === 0 ? "red": theme.palette.primary.main,
                                }}
                              />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {isue.Assignee_Name
                                  ? isue.Assignee_Name.split(",").filter(
                                      (name) => name.trim() !== ""
                                    ).length
                                  : 0}
                              </Typography>
                            </IconButton>
                          </Tooltip>

                          <Popover
                            open={Boolean(anchorEl)}
                            anchorEl={anchorEl}
                            onClose={handleClosePopover}
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "left",
                            }}
                            transformOrigin={{
                              vertical: "top",
                              horizontal: "left",
                            }}
                          >
                            <List
                              sx={{
                                minWidth: 200,
                                maxWidth: 300,
                                p: 1,
                                bgcolor: theme.palette.background.paper,
                                boxShadow: theme.shadows[2],
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  px: 2,
                                  py: 1,
                                  color: theme.palette.text.secondary,
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                }}
                              >
                              {selectedAssignees.length === 1 && selectedAssignees[0]==="" ? "Please Assigne User": "Assigned User"}
                               {console.log("seleee",selectedAssignees)}
                              </Typography>
                              {selectedAssignees.map((assignee, index) => (
                                <ListItem key={index} sx={{ py: 0.5 }}>
                                  <ListItemText
                                    primary={assignee}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                    }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Popover>
                        </TableCell>

                        {/* <TableCell>{isue.assignTo}</TableCell> */}
                        <TableCell>{isue.Due_Date}</TableCell>

                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(isue)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(isue.ROWID)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )}

                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 20]}
                      count={filteredissue.length}
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
          <Typography variant="h5" sx={{ marginBottom: 3 }}>
            Add Issue
          </Typography>

          <TextField
            select
            fullWidth
            label="Project"
            name="Project"
            value={newIssue.Project_ID}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            error={!!errors.Project_ID}
            helperText={errors.Project_ID}
          >
            {Projects.data.data.map((project) => (
              <MenuItem key={project.ROWID} value={project.ROWID}>
                {project.Project_Name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Add Issue"
            name="Issue_name"
            fullWidth
            value={newIssue.Issue_name}
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
            error={!!errors.Issue_name}
            helperText={errors.Issue_name}
          />

          <Autocomplete
            multiple
            options={Employees?.data?.users}
            getOptionLabel={(option) =>
              `${option.first_name} ${option.last_name}`
            } // Show full name of the employee
            value={Employees?.data?.users?.filter((employee) =>
              Array.isArray(newIssue.Assignee_ID)
                ? newIssue.Assignee_ID.includes(employee.user_id) // If Assignee_ID is an array
                : typeof newIssue.Assignee_ID === "string"
                  ? newIssue.Assignee_ID.split(",").includes(employee.user_id) // If Assignee_ID is a comma-separated string
                  : []
            )}
            onChange={(event, newValue) => {
              const selectedValues = newValue; // Array of selected employees

              const selectedIDs = selectedValues.map(
                (option) => option.user_id
              ); // Collect user IDs
              const selectedNames = selectedValues.map(
                (option) => `${option.first_name} ${option.last_name}`
              ); // Collect employee names

              // Update Assignee_ID with comma-separated user IDs
              handleInputChange({
                target: {
                  name: "Assignee_ID",
                  value: selectedIDs.join(","),
                },
              });

              // Optionally, store the selected names as a comma-separated string if needed
              handleInputChange({
                target: {
                  name: "Assignee_Name",
                  value: selectedNames.join(","),
                },
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assignee"
                name="AssigneeID"
                fullWidth
                error={!!errors.Assignee_ID}
                helperText={errors.Assignee_ID}
                sx={{ marginBottom: 2 }}
              />
            )}
          />

          <TextField
            select
            fullWidth
            label="Status"
            name="Status"
            value={newIssue.Status}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            error={!!errors.Status}
            helperText={errors.Status}
          >
            {["Open", "Work In Progress", "Close"].map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Due Date"
            name="Due_Date"
            fullWidth
            type="date"
            value={newIssue.Due_Date}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
            error={!!errors.Due_Date}
            helperText={errors.Due_Date}
          />

          <TextField
            select
            fullWidth
            label="Severity"
            name="Severity"
            value={newIssue.Severity}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            error={!!errors.Severity}
            helperText={errors.Severity}
          >
            <MenuItem value="Show stopper">Show stopper</MenuItem>
            <MenuItem value="Critical">Critical</MenuItem>
            <MenuItem value="Major">Major</MenuItem>
            <MenuItem value="Minor">Minor</MenuItem>
          </TextField>

          <TextField
            label="Add Description"
            name="Description"
            fullWidth
            multiline
            rows={4}
            value={newIssue.Description}
            onChange={handleInputChange}
            sx={{ marginBottom: 3 }}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Add
            </Button>
            <Button variant="outlined" color="error" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Modal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        aria-labelledby="edit-task-modal"
        aria-describedby="modal-for-editing-task"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: theme.palette.background.paper,
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="edit-task-modal" variant="h6" sx={{ mb: 2 }}>
            Edit Issue
          </Typography>

          {currentIssue && (
            <>
              <TextField
                label="Issue Name"
                name="Issue_name"
                fullWidth
                value={currentIssue.Issue_name}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Project"
                name="Project_Name"
                fullWidth
                select
                value={currentIssue.Project_ID}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              >
                {Projects.data.data.map((option) => (
                  <MenuItem key={option.ROWID} value={option.ROWID}>
                    {option.Project_Name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Assignee"
                name="Assignee_ID"
                fullWidth
                select
                SelectProps={{ multiple: true }}
                value={
                  currentIssue.Assignee_ID
                    ? currentIssue.Assignee_ID.split(",")
                    : []
                }
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              >
                {Employees?.data?.users?.map((option) => (
                  <MenuItem key={option.user_id} value={option.user_id}>
                    {option.first_name} {option.last_name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Status"
                name="Status"
                value={currentIssue.Status}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              >
                {["Open", "Work In Progress", "Closed"].map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Due Date"
                name="Due_Date"
                fullWidth
                type="date"
                value={currentIssue.Due_Date}
                onChange={handleEditInputChange}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              <TextField
                select
                fullWidth
                label="Severity"
                name="Severity"
                value={currentIssue.Severity}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
                error={!!errors.severity}
                helperText={errors.severity}
              >
                <MenuItem value="Show stopper">Show stopper</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
                <MenuItem value="Major">Major</MenuItem>
                <MenuItem value="Minor">Minor</MenuItem>
              </TextField>

              <TextField
                label="Add Description"
                name="Description"
                fullWidth
                multiline
                rows={4}
                value={currentIssue.Description}
                onChange={handleEditInputChange}
                sx={{ marginBottom: 3 }}
              />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateIssue}
                >
                  Update
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleCloseEditModal}
                >
                  Cancel
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

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
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: "500px",
            borderRadius: "8px",
          },
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
          {"Delete Issue"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete Issue{" "}
            {/* <strong>{projectToDelete?.name}</strong>? */}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
