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
} from "@mui/material";
import { FaUsers } from "react-icons/fa";
import Skeleton from "@mui/material/Skeleton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { TimeEntry } from "./TimeEntry";
import { FaBug } from "react-icons/fa6";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// import { fetchEmpTask } from "../redux/EmpTask/Empissuelice";
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

export const EmpIssues = () => {
  const theme = useTheme();
  const location = useLocation();
  const { projectId } = location.state || {};
  const { projectName } = location.state || {}; // Access projectId from state
  console.log("= ", projectName);
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
  const [loading, setLoading] = useState(true);
  const [TaskName, setTaskName] = useState("");
  const [errors, setErrors] = useState({});
  const [role, setRole] = useState("");

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

  const [currUser, setCurrUser] = useState({});

  const Projects = useSelector((state) => state.projectReducer);
  const Employees = useSelector((state) => state.employeeReducer);

  console.log("Employee", Employees?.data?.users);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("currUser"));
        setCurrUser(user);

        console.log("user", user);

        const userRole = user.role;
        const userID = user.userid;
        setRole(userRole);

        let issueResponse;

        if (userRole === "Client") {
          issueResponse = await axios.get(
            `/server/time_entry_management_application_function/clientissue/${userID}`
          );
        } else {
          issueResponse = await axios.get(
            `/server/time_entry_management_application_function/assignissue/${userID}`
          );
        }

        console.log("response from issue", issueResponse);

        const issueFromResponse = issueResponse.data.data.map((item) => ({
          id: item.ROWID,
          issueId: item.ROWID,
          name: item.Issue_name,
          projectId: item.Project_ID,
          project_name: item.Project_Name,
          assignTo: item.Assignee_Name,
          assignToID: item.Assignee_ID,
          status: item.Status,
          severity: item.Severity,
          dueDate: item.Due_Date,
          description: item.Description,
          reporter: item.Reporter_Name,
          CreationTime: item.CREATEDTIME.split(" ")[0],
        }));
        console.log("response from issue ", issueFromResponse);
        // if (projectId ) {
        //   setTaskName(projectName);
        // } else {
        //   setTaskName("issue");
        // }
        setIssue(issueFromResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [anchorEl, setAnchorEl] = useState(null); // Manage Popover state
  const [selectedAssignees, setSelectedAssignees] = useState([]); // Store assignees

  // Handle Popover open
  const handleAssigneeClick = (event, assignTo) => {
    setAnchorEl(event.currentTarget); // Set the Popover anchor element
    setSelectedAssignees(assignTo.split(",")); // Split the assignees string by commas
  };

  // Close the Popover
  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const validateForm = () => {
    let newErrors = {};

    if (!newIssue.Project) newErrors.projectId = "Project is required";
    if (!newIssue.name) newErrors.name = "Task name is required";
    if (!newIssue.assignToID)
      newErrors.assignToID = "At least one user must be assigned";
    if (!newIssue.status) newErrors.status = "Status is required";
    if (!newIssue.startDate) newErrors.startDate = "Start date is required";
    if (!newIssue.endDate) newErrors.endDate = "End date is required";
    if (
      newIssue.startDate &&
      newIssue.endDate &&
      newIssue.startDate > newIssue.endDate
    )
      newErrors.endDate = "End date cannot be before start date";

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

  const filteredissue = issue.filter((isue) =>
    isue.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedissue = filteredissue.slice(
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
      const selectedAssignees = Employees.data.users.filter(
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
    const ROWID = currentIssue.id;

    const updateResponse = await axios.post(
      `/server/time_entry_management_application_function/issue/${ROWID}`,
      {
        Status: currentIssue.status,
        Description: currentIssue.description,
        Due_Date: currentIssue.dueDate,
        Issue_name: currentIssue.name,
        Project_ID: currentIssue.projectId,
        Severity: currentIssue.severity,
        Project_Name: currentIssue.project_name,
        Assignee_ID: currentIssue.assignToID,
        Assignee_Name: currentIssue.assignTo,
      }
    );

    console.log("updateResponse", updateResponse);

    setIssue((prev) =>
      prev.map((task) => (task.id === currentIssue.id ? currentIssue : task))
    );
    setCurrentIssue("");
    setEditModalOpen(false);
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "project") {
      const selectedOption = Projects.data.data.find(
        (option) => option.ROWID === value
      );

      if (selectedOption) {
        setCurrentIssue((prev) => ({
          ...prev,
          project_name: selectedOption.Project_Name,
          projectId: selectedOption.ROWID,
        }));
      }
    } else if (name === "AssigneeID") {
      const selectedValues = event.target.value;
      const selectedUsernames = selectedValues
        .map((id) => {
          const user = Employees.data.users.find(
            (option) => option.user_id === id
          );
          return user ? user.first_name + " " + user.last_name : "";
        })
        .filter((name) => name)
        .join(",");

      setCurrentIssue((prev) => ({
        ...prev,
        assignTo: selectedUsernames,
        assignToID: selectedValues.join(","),
      }));
    } else {
      setCurrentIssue((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleViewTask = (task) => {
    setViewTask(task);
    setViewModalOpen(true);
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
      console.log("Response Data:", response.data.data);
      const item = response.data.data;

      if (item) {
        const newIssueResponse = {
          id: item.ROWID || null, // Ensure ROWID exists
          issueId: item.ROWID || null,
          name: item.Issue_name || "",
          projectId: item.Project_ID || "",
          project_name: item.Project_Name || "",
          assignTo: item.Assignee_Name || "", // Assign names from response
          assignToID: item.Assignee_ID || "", // Assign IDs from response
          status: item.Status || "",
          severity: item.Severity || "",
          dueDate: item.Due_Date || "",
          description: item.Description || "",
          reporter: item.Reporter_Name || "",
          CreationTime: item.CREATEDTIME ? item.CREATEDTIME.split(" ")[0] : "",
        };

        // Add the new task to the issue list
        const newIssueData = [newIssueResponse, ...issue];
        setIssue(newIssueData);

        // Close the form or clear inputs
        handleCancel();

        // Show success message
        handleAlert("success", "Task added successfully");
        // Optionally, dispatch a fetch action to refresh issues list
        // dispatch(fetchissue());
      } else {
        throw new Error("Invalid response data received");
      }
    } catch (error) {
      // Handle errors
      console.error("Error adding task:", error);
      handleAlert("error", error.message || "Error adding task");
    }
  };

  const handleAlert = (severity, message) => {
    // setSnackbar({
    //   open: true,
    //   message,
    //   severity,
    // });
    console.log("sucess", message);
  };

  const handleCloseViewModal = () => {
    setViewTask(null);
    setViewModalOpen(false);
  };
  const handleCancel = () => {
    setnewIssue({
      project: "",
      name: "",
      assignTo: "",
      status: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    toggleDrawer(false);
  };
  const handleSubmit = () => {
    if (1 || validateForm()) {
      handleAddIssue();
    }
  };

  const deleteIssue = async (issueId) => {
    try {
      const response = await axios.delete(
        `/server/time_entry_management_application_function/issue/${issueId}`
      );

      console.log(response);
      setIssue((prev) => prev.filter((issue) => issue.id !== issueId));
    } catch (error) {
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

              {role === "Client" ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => toggleDrawer(true)}
                >
                  Submit Issue
                </Button>
              ) : (
                <></>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {loading ? (
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
          ) : issue.length === 0 ? (
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
                      <TableRow key={isue.id}>
                        <TableCell>
                          {"I" + isue.id.substr(isue.id.length - 4)}
                        </TableCell>
                        <TableCell>{isue.name}</TableCell>
                        <TableCell>{isue.reporter}</TableCell>
                        <TableCell>{isue.CreationTime}</TableCell>
                        <TableCell>
                          <Chip
                            label={isue.status}
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
                                handleAssigneeClick(e, isue.assignTo)
                              }
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <FaUsers />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {isue.assignTo.split(",").length}
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
                                Assigned Users
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
                        <TableCell>{isue.dueDate}</TableCell>

                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(isue)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => deleteIssue(isue.id)}
                          >
                            {role === "Client" ? <DeleteIcon /> : <></>}
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
            error={!!errors.Project}
            helperText={errors.Project}
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
            error={!!errors.name}
            helperText={errors.name}
          />

          <Autocomplete
            multiple
            options={Employees.data.users}
            getOptionLabel={(option) =>
              `${option.first_name} ${option.last_name}`
            } // Show full name of the employee
            value={Employees.data.users.filter((employee) =>
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
                error={!!errors.assignToID}
                helperText={errors.assignToID}
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
            error={!!errors.status}
            helperText={errors.status}
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
            error={!!errors.endDate}
            helperText={errors.endDate}
          />

          <TextField
            select
            fullWidth
            label="Severity"
            name="Severity"
            value={newIssue.Severity}
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
              {role === "Client" ? (
                <>
                  <TextField
                    label="Issue Name"
                    name="name"
                    fullWidth
                    value={currentIssue.name}
                    onChange={handleEditInputChange}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    label="Project"
                    name="project"
                    fullWidth
                    select
                    value={currentIssue.projectId || ""}
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
                    name="AssigneeID"
                    fullWidth
                    select
                    SelectProps={{ multiple: true }}
                    value={
                      currentIssue.assignToID
                        ? currentIssue.assignToID.split(",")
                        : []
                    }
                    onChange={handleEditInputChange}
                    sx={{ mb: 2 }}
                  >
                    {Employees.data.users.map((option) => (
                      <MenuItem key={option.user_id} value={option.user_id}>
                        {option.first_name} {option.last_name}
                      </MenuItem>
                    ))}
                  </TextField>
                </>
              ) : null}

              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={currentIssue.status}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              >
                {["Open", "Work In Progress", "Closed"].map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>

              {role == "Client" ? (
                <>
                  {" "}
                  <TextField
                    label="Due Date"
                    name="dueDate"
                    fullWidth
                    type="date"
                    value={currentIssue.dueDate}
                    onChange={handleEditInputChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    select
                    fullWidth
                    label="Severity"
                    name="Severity"
                    value={currentIssue.severity}
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
                    name="description"
                    fullWidth
                    multiline
                    rows={4}
                    value={currentIssue.description}
                    onChange={handleEditInputChange}
                    sx={{ marginBottom: 3 }}
                  />
                </>
              ) : null}

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
    </Box>
  );
};
