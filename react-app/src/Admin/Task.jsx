import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
  Modal,
  useTheme,
  Popover,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Autocomplete,
  alpha,
  Avatar,
} from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIcon from "@mui/icons-material/Assignment";
import {
  FaTasks,
  FaUsers,
  FaCheckCircle,
  FaHourglassHalf,
  FaPlayCircle,
} from "react-icons/fa";
import axios from "axios";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { TimeEntry } from "./TimeEntry";
import Slide from "@mui/material/Slide";
import Project from "../Employee/Project";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "../redux/Employee/EmployeeSlice";
import { fetchTasks, TaskActions } from "../redux/Tasks/TaskSlice";

import { fetchProjects } from "../redux/Project/ProjectSlice";
const statusOptions = ["Open", "In Progress", "Completed"];
// const statusConfig = {
//   Completed: {
//     icon: FaCheckCircle,
//     color: "#2e7d32",
//     backgroundColor: "#e6f4ea",
//     borderColor: "#a5d6a7",
//   },
//   "In Progress": {
//     icon: FaPlayCircle,
//     color: "#1976d2",
//     backgroundColor: "#e8f0fe",
//     borderColor: "#90caf9",
//   },
//   Pending: {
//     icon: FaHourglassHalf,
//     color: "#ed6c02",
//     backgroundColor: "#fff8e6",
//     borderColor: "#ffb74d",
//   },
// };

const statusConfig = {
  Pending: {
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
function Task() {
  const location = useLocation();
  const dispatch = useDispatch();

  const { projectId } = location.state || {};
  const { projectName } = location.state || {};

  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewTask, setViewTask] = useState(null);
  const [assignOptions, setAssignOptions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  console.log("projectname,", projectName, projectId);
  const [newTask, setNewTask] = useState({
    projectId: projectId || "",
    project_name: projectName || "",
    name: "",
    assignTo: "",
    assignToID: "",
    status: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [TaskName, setTaskName] = useState("");
  const [errors, setErrors] = useState({});

  const { data } = useSelector((state) => state.projectReducer);
  const { data: employeedata } = useSelector((state) => state.employeeReducer);
  const { data: tasksData, isLoading } = useSelector(
    (state) => state.taskReducer
  );
  console.log("projectss data", data);
  console.log("employeeDatat", employeedata);
  console.log("tasks", tasksData);

  useEffect(() => {
    const fetchTasksData = async () => {
      try {
        // Fetch tasks by projectId if it's available
        if (projectId) {
          const res = await axios.get(
            `/server/time_entry_management_application_function/tasks/project/${projectId}`
          );
          console.log("taskres", res);
          setTasks(res.data.data);
        } else {
          // If Task data is not already in Redux, fetch it
          if (!Array.isArray(tasksData) || tasksData.length === 0) {
            const response = await dispatch(fetchTasks()).unwrap();
       
            setTasks(response);
          } else {
            // Use existing Task data from Redux
            setTasks(tasksData);
          }
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
  
    // Check and fetch employee and project data only if needed
    if (!Array.isArray(employeedata) || employeedata.length === 0) {
      dispatch(fetchEmployees());
    }
  
    if (!Array.isArray(data) || data.length === 0) {
      dispatch(fetchProjects());
    }
  
    fetchTasksData();
  }, [projectId, dispatch, Task, data, employeedata]);

  useEffect(() => {
    if (employeedata) {
      // Check if employeedata is available before filtering
      const employee = employeedata
        ?.filter(
          (employee) =>
            employee.role_details.role_name !== "Contacts" &&
            employee.role_details.role_name !== "Super Admin"
        )
        .map((employee) => ({
          username: `${employee.first_name} ${employee.last_name}`,
          userID: employee.user_id,
          role: employee.role_details.role_name,
        }));
      console.log("employee", employee);
      setAssignOptions(employee);

      if (projectId) {
        setTaskName(projectName);
      } else {
        setTaskName("Tasks");
        setTasks(tasksData);
      }
    }
  }, [employeedata, tasksData]);

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

  const filteredTasks = tasks?.filter((task) =>
    task?.Task_Name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedTasks = filteredTasks?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const validateForm = () => {
    let newErrors = {};

    if (!newTask.projectId) newErrors.projectId = "Project is required";
    if (!newTask.name) newErrors.name = "Task name is required";
    if (!newTask.assignToID)
      newErrors.assignToID = "At least one user must be assigned";
    if (!newTask.status) newErrors.status = "Status is required";
    if (!newTask.startDate) newErrors.startDate = "Start date is required";
    if (!newTask.endDate) newErrors.endDate = "End date is required";
    if (
      newTask.startDate &&
      newTask.endDate &&
      newTask.startDate > newTask.endDate
    )
      newErrors.endDate = "End date cannot be before start date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    console.log("nameee", name);
    console.log("bdsa", value);
    if (name === "projectId") {
      const selectedOption = data.find((option) => option.ROWID === value);
      if (selectedOption) {
        setNewTask((prev) => ({
          ...prev,
          project_name: selectedOption.Project_Name,
          projectId: selectedOption.ROWID,
        }));
      }
    } else if (name === "assignToID") {
      //  Ensure value is always an array
      const selectedValues = Array.isArray(value) ? value : value.split(",");

      const selectedUsernames = selectedValues
        ?.map((id) => {
          const user = assignOptions.find((option) => option.userID === id);
          return user ? user.username : "";
        })
        ?.filter(Boolean) // Remove empty names
        .join(", ");

      setNewTask((prev) => ({
        ...prev,
        assignTo: selectedUsernames, // Store names
        assignToID: selectedValues.join(","), //  Store IDs
      }));
    } else {
      setNewTask((prev) => ({ ...prev, [name]: value }));
    }
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

  const handleAddTask = async () => {
    console.log("newTask", newTask);
    try {
      // Ensure assignToID is properly formatted as a string
      const assignToID = Array.isArray(newTask.assignToID)
        ? newTask.assignToID.join(",")
        : newTask.assignToID;

      const response = await axios.post(
        "/server/time_entry_management_application_function/tasks",
        {
          Status: newTask.status,
          Description: newTask.description,
          Assign_To: newTask.assignTo, // Already comma-separated string of names
          Assign_To_ID: assignToID, // Ensure it's a comma-separated string of IDs
          ProjectID: newTask.projectId,
          Project_Name: newTask.project_name,
          Task_Name: newTask.name,
          Start_Date: newTask.startDate,
          End_Date: newTask.endDate,
        }
      );

      console.log("sfhsdfds", response);

      if (response.status === 200) {
        handleCancel();
        handleAlert("success", "Task added successfully");
        dispatch(TaskActions.addTaskData(response.data.data));
        if (projectId && newTask.projectId === projectId) {
          setTasks((prev) => [...prev, response.data.data]);
        }
      }
    } catch (error) {
      handleAlert("error", error.message || "Error adding task");
    }
  };

  const handleCancel = () => {
    setNewTask({
    projectId: projectId || "",
    project_name: projectName || "",
    name: "",
    assignTo: "",
    assignToID: "",
    status: "",
    startDate: "",
    endDate: "",
    description: "",
    });
    toggleDrawer(false);
  };

  const handleEdit = (task) => {
    console.log("task data",task);
    setCurrentTask(task);
    setEditModalOpen(true);
  };

  const handleDelete = async (ROWID) => {
    const response = await axios.delete(
      `/server/time_entry_management_application_function/tasks/${ROWID}`
    );

    const newTasksData = tasks?.filter((item) => item.id !== ROWID);
    setTasks(newTasksData);
  };

  const handleUpdateTask = async () => {
    console.log(currentTask);
    try {
      const ROWID = currentTask.ROWID;
      // Ensure assignToID is properly formatted as a string
      const Assign_To_ID = Array.isArray(currentTask.Assign_To_ID)
        ? currentTask.Assign_To_ID.join(",")
        : currentTask.Assign_To_ID;

      const updateResponse = await axios.post(
        `/server/time_entry_management_application_function/tasks/${ROWID}`,
        currentTask
      );
      console.log("updated", updateResponse);
      if (updateResponse.status === 200) {
        dispatch(TaskActions.updateTaskData(updateResponse.data.data));
        setCurrentTask(null);
        setEditModalOpen(false);
        handleAlert("success", "Task updated successfully");
        if (projectId && currentTask.ProjectID === projectId) {
          const updatedTasksData = tasks?.map((item) =>
            item.ROWID === ROWID? updateResponse.data.data : item
          );
          setTasks(updatedTasksData);
        }
  
      } else {
        handleAlert("error", "Failed to update task");
      }
    } catch (error) {
      handleAlert("error", error.message || "Error updating task");
    }
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "Project_Name") {
      const selectedOption = data.find((option) => option.ROWID === value);

      if (selectedOption) {
        setCurrentTask((prev) => ({
          ...prev,
          Project_Name: selectedOption.Project_Name,
          ProjectID: selectedOption.ROWID,
        }));
      }
    } else if (name === "Assign_To") {
      // Handle multiple selections
      const selectedValues = event.target.value;
      const selectedUsernames = selectedValues
        ?.map((id) => {
          const user = assignOptions?.find((option) => option.userID === id);
          return user ? user.username : "";
        })
        ?.filter((name) => name)
        .join(", ");

      setCurrentTask((prev) => ({
        ...prev,
        Assign_To: selectedUsernames,
        Assign_To_ID: selectedValues.join(","),
      }));
    } else {
      setCurrentTask((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleViewTask = (task) => {
    setViewTask(task);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewTask(null);
    setViewModalOpen(false);
  };

  const handleAssigneeClick = (event, assignees) => {
    setSelectedAssignees(assignees.split(",").map((name) => name.trim()));
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      try {
        const response = await axios.delete(
          `/server/time_entry_management_application_function/tasks/${taskToDelete.ROWID}`
        );
        if (response.status === 200) {
          dispatch(TaskActions.deleteTasktData(taskToDelete.ROWID));
          handleAlert("success", "Task deleted successfully");
          setTasks((prev) =>
            prev.filter((item) => item.ROWID!== taskToDelete.ROWID)
          );
        } else {
          handleAlert("error", "Failed to delete task");
        }
      } catch (error) {
        handleAlert("error", error.message || "Error deleting task");
      } finally {
        setDeleteConfirmOpen(false);
        setTaskToDelete(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      handleAddTask();
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
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
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* Left Side: Avatar + Typography */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: { xs: "100%", md: "auto" },
          }}
        >
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 50,
              height: 50,
            }}
          >
            <AssignmentIcon sx={{ color: "#fff" }} fontSize="large" />
          </Avatar>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              fontSize: { xs: "1.5rem", sm: "2rem" },
            }}
          >
            Tasks
          </Typography>
        </Box>

        {/* Right Side: Search Bar + Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            width: { xs: "100%", md: "auto" },
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <TextField
            label="Search Tasks"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            sx={{
              width: { xs: "100%", sm: "60%", md: "250px" },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => toggleDrawer(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Add Task
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          {isLoading ? (
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
                    Task ID
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Task Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Project Name
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
                    Start Date
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    End Date
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Description
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
          ) : paginatedTasks.length === 0 ? (
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
                    Task ID
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Task Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Project Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Associated
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
                    Start Date
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    End Date
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Action
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Time
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box
                      sx={{
                        p: 3,
                        textAlign: "center",
                        minHeight: "200px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <FaTasks size={50} color={theme.palette.text.secondary} />
                      <Typography variant="h5" color="text.secondary">
                        No Tasks Found
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        There are no tasks to display.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <TableContainer component={Paper}>
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
                      Task ID
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Task Name
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Project Name
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Associated
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
                      Start Date
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      End Date
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Action
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.primary.contrastText,
                        fontWeight: "bold",
                      }}
                    >
                      Time Entry
                    </TableCell>
                  </TableRow>
                </TableHead>
                {loading ? (
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
                ) : paginatedTasks.length === 0 ? (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={9} sx={{ p: 0 }}>
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
                              }}
                            >
                              <Skeleton variant="text" width="8%" />{" "}
                              {/* Task ID */}
                              <Skeleton variant="text" width="15%" />{" "}
                              {/* Task Name */}
                              <Skeleton variant="text" width="15%" />{" "}
                              {/* Project Name */}
                              <Skeleton variant="text" width="12%" />{" "}
                              {/* Associated */}
                              <Skeleton variant="text" width="10%" />{" "}
                              {/* Status */}
                              <Skeleton variant="text" width="12%" />{" "}
                              {/* Start Date */}
                              <Skeleton variant="text" width="12%" />{" "}
                              {/* End Date */}
                              <Skeleton variant="text" width="8%" />{" "}
                              {/* Actions */}
                              <Skeleton variant="text" width="8%" />{" "}
                              {/* Time Entry */}
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                ) : (
                  <TableBody>
                    {paginatedTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          {"T" + task.ROWID.substr(task.ROWID.length - 4)}
                        </TableCell>
                        <TableCell>{task.Task_Name}</TableCell>
                        <TableCell>{task.Project_Name}</TableCell>
                        <TableCell>
                          <Tooltip title="View Assignees">
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                handleAssigneeClick(e, task.Assign_To)
                              }
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <FaUsers />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {task.Assign_To.split(",").length}
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
                        <TableCell>
                          <Chip
                            label={task.Status}
                             size="small"
                            sx={{
                              backgroundColor:
                                statusConfig[task.Status]?.backgroundColor ||
                                "#f5f5f5",
                              color:
                                statusConfig[task.Status]?.color || "#757575",
                              border: `1px solid ${statusConfig[task.Status]?.borderColor || "#e0e0e0"}`,
                              fontWeight: 500,
                               fontSize: "0.75rem",
                               height: "24px",
                              "& .MuiChip-label": {
                                px: 1,
                              },
                              // minWidth: 110,
                              // height: 28,
                              // borderRadius: "14px",
                              // "&:hover": {
                              //   backgroundColor:
                              //     statusConfig[task.Status]?.backgroundColor ||
                              //     "#f5f5f5",
                              //   opacity: 0.9,
                              // },
                            }}
                           
                          />
                        </TableCell>
                        <TableCell>{task.Start_Date}</TableCell>
                        <TableCell>{task.End_Date}</TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(task)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(task)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                        <AccessTimeIcon
                          fontSize="large" // Use 'small', 'medium', 'large', or set via style
                          style={{
                            color: theme.palette.primary.main,
                            fontSize: 30, // You can increase this number as needed (e.g., 36, 40)
                            cursor: "pointer",
                          }}
                            onClick={() => handleViewTask(task)}
                          />
                         
                        
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )}
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 20]}
                      count={filteredTasks.length}
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

      {/* Add Task Drawer */}
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
            Add Task
          </Typography>

          {/* <Autocomplete
  options={projects}
  getOptionLabel={(option) => option.Project_Name} // Show project name
  isOptionEqualToValue={(option, value) => option.ROWID === value?.ROWID} // Ensure correct selection
  value={projects.find((option) => option.ROWID ===  projectId) || null}
  onChange={(event, newValue) => {
    handleInputChange({
      target: { name: "projectId", value: newValue ? newValue.ROWID : "" },
    });
  }}
  disabled={!!projectId} 
  renderInput={(params) => (
    <TextField
  {...params}
  label="Project Name"
  name="projectId"
  fullWidth
  variant="outlined"
  sx={{ marginBottom: 2 }}
  error={!!errors.projectId}
  helperText={errors.projectId || ""}
/>
  )}
/> */}

          <Autocomplete
            options={data}
            getOptionLabel={(option) => option.Project_Name}
            isOptionEqualToValue={(option, value) =>
              option.ROWID === value.ROWID
            }
            value={
              projectName
                ? data.find((option) => option.Project_Name === projectName)
                : data.find((option) => option.ROWID === newTask.projectId) ||
                  null
            }
            onChange={(event, newValue) => {
              if (!projectName) {
                handleInputChange({
                  target: {
                    name: "projectId",
                    value: newValue ? newValue.ROWID : "",
                  },
                });
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add Project"
                name="projectId"
                fullWidth
                variant="outlined"
                sx={{ marginBottom: 2 }}
                error={!!errors.projectId}
                helperText={errors.projectId}
              />
            )}
            disabled={!!projectName}
          />

          {/* <TextField
        label="Add Project"
        name="project"
        fullWidth
        select
        value={newTask.projectId}
        onChange={handleInputChange}
        sx={{ marginBottom: 2 }}
        error={!!errors.projectId}
        helperText={errors.projectId}
      >
        {projects.map((option) => (
          <MenuItem key={option.ROWID} value={option.ROWID}>
            {option.Project_Name}
          </MenuItem>
        ))}
      </TextField> */}

          <TextField
            label="Add Task"
            name="name"
            fullWidth
            value={newTask.name}
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
            error={!!errors.name}
            helperText={errors.name}
          />

          <Autocomplete
            multiple
            options={assignOptions}
            getOptionLabel={(option) => option.username}
            value={assignOptions.filter((option) =>
              Array.isArray(newTask.assignToID)
                ? newTask.assignToID.includes(option.userID)
                : typeof newTask.assignToID === "string"
                  ? newTask.assignToID.split(",").includes(option.userID)
                  : []
            )}
            onChange={(event, newValue) => {
              const selectedValues = Array.isArray(newValue) ? newValue : [];
              const selectedIDs = selectedValues.map((option) => option.userID);

              handleInputChange({
                target: {
                  name: "assignToID",
                  value: selectedIDs.length > 0 ? selectedIDs.join(",") : "", // Convert to a string
                },
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Associated"
                name="assignToID"
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
            name="status"
            value={newTask.status}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            error={!!errors.status}
            helperText={errors.status}
          >
            {Object.keys(statusConfig).map((status) => (
              <MenuItem
                key={status}
                value={status}
                sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}
              >
                <Box
                  component={statusConfig[status].icon}
                  sx={{ color: statusConfig[status].color, fontSize: "1.1rem" }}
                />
                <Typography
                  sx={{ color: statusConfig[status].color, fontWeight: 500 }}
                >
                  {status}
                </Typography>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Start Date"
            name="startDate"
            fullWidth
            type="date"
            value={newTask.startDate}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
            error={!!errors.startDate}
            helperText={errors.startDate}
          />

          <TextField
            label="End Date"
            name="endDate"
            fullWidth
            type="date"
            value={newTask.endDate}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
            error={!!errors.endDate}
            helperText={errors.endDate}
          />

          <TextField
            label="Add Description"
            name="description"
            fullWidth
            multiline
            rows={4}
            value={newTask.description}
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

      {/* Edit Task */}
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
            Edit Task
          </Typography>

          {currentTask && (
            <>
              <TextField
                label="Task Name"
                name="Task_Name"
                fullWidth
                value={currentTask.Task_Name}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Project"
                name="Project_Name"
                fullWidth
                select
                value={currentTask.ProjectID || ""}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              >
                {data.map((option) => (
                  <MenuItem key={option.ROWID} value={option.ROWID}>
                    {option.Project_Name}
                  </MenuItem>
                ))}
              </TextField>

              <Autocomplete
                multiple
                fullWidth
                options={assignOptions}
                getOptionLabel={(option) => option.username}
                value={assignOptions.filter((opt) =>
                  currentTask.Assign_To_ID
                    ? currentTask.Assign_To_ID.split(",").includes(opt.userID)
                    : []
                )}
                onChange={(event, newValue) => {
                  const selectedIDs = newValue.map((item) => item.userID);
                  const selectedNames = newValue.map((item) => item.username);

                  setCurrentTask((prev) => ({
                    ...prev,
                    Assign_To_ID: selectedIDs.join(","),
                    Assign_To: selectedNames.join(", "),
                  }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Associated" sx={{ mb: 2 }} />
                )}
              />

              <TextField
                select
                fullWidth
                label="Status"
                name="Status"
                value={currentTask.Status}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              >
                {Object.keys(statusConfig).map((Status) => (
                  <MenuItem
                    key={Status}
                    value={Status}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      py: 1,
                    }}
                  >
                    <Box
                      component={statusConfig[Status].icon}
                      sx={{
                        color: statusConfig[Status].color,
                        fontSize: "1.1rem",
                      }}
                    />
                    <Typography
                      sx={{
                        color: statusConfig[Status].color,
                        fontWeight: 500,
                      }}
                    >
                      {Status}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Start Date"
                name="Start_Date"
                fullWidth
                type="date"
                value={currentTask.Start_Date}
                onChange={handleEditInputChange}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />

              <TextField
                label="End Date"
                name="End_Date"
                fullWidth
                type="date"
                value={currentTask.End_Date}
                onChange={handleEditInputChange}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Add Description"
                name="Description"
                fullWidth
                multiline
                rows={4}
                value={currentTask.Description}
                onChange={handleEditInputChange}
                sx={{ marginBottom: 3 }}
              />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateTask}
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

      {console.log("viewtask", viewTask)}
      {/* time entry */}
      {viewTask ? (
        <TimeEntry
          theme={theme}
          handleEditInputChange={handleEditInputChange}
          projects={data}
          statusOptions={statusOptions}
          handleUpdateTask={handleUpdateTask}
          viewModalOpen={viewModalOpen}
          viewTask={viewTask}
          setViewTask={setViewTask}
          handleCloseViewModal={handleCloseViewModal}
        />
      ) : (
        <div></div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete task "{taskToDelete?.Task_Name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

export default Task;
