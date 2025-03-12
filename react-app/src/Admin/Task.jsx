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
} from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  FaTasks,
  FaUsers,
  FaCheckCircle,
  FaHourglassHalf,
  FaPlayCircle,
} from "react-icons/fa";
import axios from "axios";
import { TimeEntry } from "./TimeEntry";
import Slide from "@mui/material/Slide";
import Project from "../Employee/Project";

const statusOptions = ["Open", "In Progress", "Completed"];
const statusConfig = {
  Completed: {
    icon: FaCheckCircle,
    color: "#2e7d32",
    backgroundColor: "#e6f4ea",
    borderColor: "#a5d6a7",
  },
  "In Progress": {
    icon: FaPlayCircle,
    color: "#1976d2",
    backgroundColor: "#e8f0fe",
    borderColor: "#90caf9",
  },
  Pending: {
    icon: FaHourglassHalf,
    color: "#ed6c02",
    backgroundColor: "#fff8e6",
    borderColor: "#ffb74d",
  },
};

function Task() {

  const location = useLocation();
  const { projectId } = location.state || {};  // Access projectId from state
  console.log("Got project id:", projectId); 

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
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [newTask, setNewTask] = useState({
    projectId: "",
    project_name: "",
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


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const TaskResponse = await axios.get(
          "/server/time_entry_management_application_function/tasks"
        );
        const ProjectResponse = await axios.get(
          "/server/time_entry_management_application_function/projects"
        );
        const EmployeeResponse = await axios.get(
          "/server/time_entry_management_application_function/employee"
        );

        if (EmployeeResponse.status === 200) {
          const formattedAssignTo = EmployeeResponse.data.users
            .filter(
              (employee) =>
                employee.role_details.role_name !== "Admin" &&
                employee.role_details.role_name !== "Super Admin"
            )
            .map((employee) => ({
              username: `${employee.first_name} ${employee.last_name}`,
              userID: employee.user_id,
            }));

          setAssignOptions(formattedAssignTo);
        }

        // Filter tasks based on the provided projectId, if available
        const tasksFromResponse = TaskResponse.data.data
          .filter((item) => (projectId ? item.ProjectID === projectId : true)) // If projectId exists, filter tasks
          .map((item) => ({
            id: item.ROWID,
            taskid: item.ROWID,
            name: item.Task_Name,
            projectId: item.ProjectID,
            project_name: item.Project_Name,
            assignTo: item.Assign_To,
            assignToID: item.Assign_To_ID,
            status: item.Status,
            startDate: item.Start_Date,
            endDate: item.End_Date,
            description: item.Description,
          }));

          console.log("qwrewr",tasksFromResponse);
          console.log("sdfgs",tasksFromResponse[0].project_name);
          if (projectId) {
            setTaskName(tasksFromResponse[0]?.project_name);
          }
          else setTaskName("Tasks");

        setTasks(tasksFromResponse);
        setProjects(ProjectResponse.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

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

  const filteredTasks = tasks.filter((task) =>
    task.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedTasks = filteredTasks.slice(
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
    if (!newTask.assignToID) newErrors.assignToID = "At least one user must be assigned";
    if (!newTask.status) newErrors.status = "Status is required";
    if (!newTask.startDate) newErrors.startDate = "Start date is required";
    if (!newTask.endDate) newErrors.endDate = "End date is required";
    if (newTask.startDate && newTask.endDate && newTask.startDate > newTask.endDate)
      newErrors.endDate = "End date cannot be before start date";
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "projectId") {  
        const selectedOption = projects.find((option) => option.ROWID === value);
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
            .map((id) => {
                const user = assignOptions.find((option) => option.userID === id);
                return user ? user.username : "";
            })
            .filter(Boolean) // Remove empty names
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

      const updateData = {
        id: response.data.data.ROWID,
        taskid:
          "TASK " +
          response.data.data.ROWID.substr(response.data.data.ROWID.length - 4),
        name: response.data.data.Task_Name,
        projectId: response.data.data.ProjectID,
        project_name: response.data.data.Project_Name,
        assignTo: response.data.data.Assign_To,
        assignToID: response.data.data.Assign_To_ID,
        status: response.data.data.Status,
        startDate: response.data.data.Start_Date,
        endDate: response.data.data.End_Date,
        description: response.data.data.Description,
      };

      const newTaskData = [...tasks, updateData];
      setTasks(newTaskData);
      handleCancel();
      handleAlert("success", "Task added successfully");
    } catch (error) {
      handleAlert("error", error.message || "Error adding task");
    }
  };

  const handleCancel = () => {
    setNewTask({
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

  const handleEdit = (task) => {
    setCurrentTask(task);
    setEditModalOpen(true);
  };

  const handleDelete = async (ROWID) => {
    const response = await axios.delete(
      `/server/time_entry_management_application_function/tasks/${ROWID}`
    );

    const newTasksData = tasks.filter((item) => item.id !== ROWID);
    setTasks(newTasksData);
  };

  const handleUpdateTask = async () => {
    //console.log(currentTask);
    try {
      const ROWID = currentTask.id;
      // Ensure assignToID is properly formatted as a string
      const assignToID = Array.isArray(currentTask.assignToID)
        ? currentTask.assignToID.join(",")
        : currentTask.assignToID;

      const updateResponse = await axios.post(
        `/server/time_entry_management_application_function/tasks/${ROWID}`,
        {
          Status: currentTask.status,
          Description: currentTask.description,
          Assign_To: currentTask.assignTo, // Already comma-separated string of names
          Assign_To_ID: assignToID, // Ensure it's a comma-separated string of IDs
          ProjectID: currentTask.projectId,
          Project_Name: currentTask.project_name,
          Task_Name: currentTask.name,
          Start_Date: currentTask.startDate,
          End_Date: currentTask.endDate,
        }
      );

      if (updateResponse.status === 200) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === currentTask.id
              ? {
                  ...currentTask,
                  assignToID: assignToID, // Ensure the updated task has the correct format
                }
              : task
          )
        );
        setCurrentTask(null);
        setEditModalOpen(false);
        handleAlert("success", "Task updated successfully");
      } else {
        handleAlert("error", "Failed to update task");
      }
    } catch (error) {
      handleAlert("error", error.message || "Error updating task");
    }
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "project") {
      const selectedOption = projects.find((option) => option.ROWID === value);

      if (selectedOption) {
        setCurrentTask((prev) => ({
          ...prev,
          project_name: selectedOption.Project_Name,
          projectId: selectedOption.ROWID,
        }));
      }
    } else if (name === "associated") {
      // Handle multiple selections
      const selectedValues = event.target.value;
      const selectedUsernames = selectedValues
        .map((id) => {
          const user = assignOptions.find((option) => option.userID === id);
          return user ? user.username : "";
        })
        .filter((name) => name)
        .join(", ");

      setCurrentTask((prev) => ({
        ...prev,
        assignTo: selectedUsernames,
        assignToID: selectedValues.join(","),
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
          `/server/time_entry_management_application_function/tasks/${taskToDelete.id}`
        );
        if (response.status === 200) {
          setTasks((prevTasks) =>
            prevTasks.filter((task) => task.id !== taskToDelete.id)
          );
          handleAlert("success", "Task deleted successfully");
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3,
        }}
      >
        <Typography variant="h4">{TaskName}</Typography>
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
              <TextField
                label="Search Tasks"
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
                Add Task
              </Button>
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
          ) : tasks.length === 0 ? (
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
                ) : tasks.length === 0 ? (
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
                          {"T" + task.id.substr(task.id.length - 4)}
                        </TableCell>
                        <TableCell>{task.name}</TableCell>
                        <TableCell>{task.project_name}</TableCell>
                        <TableCell>
                          <Tooltip title="View Assignees">
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                handleAssigneeClick(e, task.assignTo)
                              }
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <FaUsers />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {task.assignTo.split(",").length}
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
                            icon={
                              <Box
                                component={
                                  statusConfig[task.status]?.icon ||
                                  FaHourglassHalf
                                }
                                sx={{
                                  fontSize: "1rem !important",
                                  mr: "4px !important",
                                  ml: "4px !important",
                                  color:
                                    statusConfig[task.status]?.color ||
                                    "#757575",
                                }}
                              />
                            }
                            label={task.status}
                            sx={{
                              backgroundColor:
                                statusConfig[task.status]?.backgroundColor ||
                                "#f5f5f5",
                              color:
                                statusConfig[task.status]?.color || "#757575",
                              border: `1px solid ${statusConfig[task.status]?.borderColor || "#e0e0e0"}`,
                              fontWeight: 500,
                              "& .MuiChip-label": {
                                px: 1,
                              },
                              minWidth: 110,
                              height: 28,
                              borderRadius: "14px",
                              "&:hover": {
                                backgroundColor:
                                  statusConfig[task.status]?.backgroundColor ||
                                  "#f5f5f5",
                                opacity: 0.9,
                              },
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{task.startDate}</TableCell>
                        <TableCell>{task.endDate}</TableCell>
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
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            onClick={() => handleViewTask(task)}
                          >
                            View
                          </Button>
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
      <Drawer anchor="right" open={drawerOpen} onClose={() => toggleDrawer(false)}>
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
      
      <Autocomplete
  options={projects}
  getOptionLabel={(option) => option.Project_Name} // Show project name
  isOptionEqualToValue={(option, value) => option.ROWID === value} // Ensure correct selection
  value={projects.find((option) => option.ROWID === newTask.projectId) || null}
  onChange={(event, newValue) => {
    handleInputChange({
      target: { name: "projectId", value: newValue ? newValue.ROWID : "" },
    });
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
            <Typography sx={{ color: statusConfig[status].color, fontWeight: 500 }}>
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
                name="name"
                fullWidth
                value={currentTask.name}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Project"
                name="project"
                fullWidth
                select
                value={currentTask.projectId || ""}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              >
                {projects.map((option) => (
                  <MenuItem key={option.ROWID} value={option.ROWID}>
                    {option.Project_Name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Associated"
                name="associated"
                fullWidth
                select
                SelectProps={{ multiple: true }}
                value={
                  currentTask.assignToID
                    ? currentTask.assignToID.split(",")
                    : []
                }
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              >
                {assignOptions.map((option) => (
                  <MenuItem key={option.userID} value={option.userID}>
                    {option.username}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={currentTask.status}
                onChange={handleEditInputChange}
                sx={{ mb: 2 }}
              >
                {Object.keys(statusConfig).map((status) => (
                  <MenuItem
                    key={status}
                    value={status}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      py: 1,
                    }}
                  >
                    <Box
                      component={statusConfig[status].icon}
                      sx={{
                        color: statusConfig[status].color,
                        fontSize: "1.1rem",
                      }}
                    />
                    <Typography
                      sx={{
                        color: statusConfig[status].color,
                        fontWeight: 500,
                      }}
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
                value={currentTask.startDate}
                onChange={handleEditInputChange}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />

              <TextField
                label="End Date"
                name="endDate"
                fullWidth
                type="date"
                value={currentTask.endDate}
                onChange={handleEditInputChange}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />

              <TextField
                label="Add Description"
                name="description"
                fullWidth
                multiline
                rows={4}
                value={currentTask.description}
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

      {/* time entry */}
      {viewTask ? (
        <TimeEntry
          theme={theme}
          handleEditInputChange={handleEditInputChange}
          projects={projects}
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
            Are you sure you want to delete task "{taskToDelete?.name}"? This
            action cannot be undone.
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






// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Grid,
//   Typography,
//   Button,
//   TextField,
//   Card,
//   CardContent,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   TableFooter,
//   TablePagination,
//   IconButton,
//   Drawer,
//   MenuItem,
//   Modal,
//   useTheme,
//   Popover,
//   List,
//   ListItem,
//   ListItemText,
//   Tooltip,
//   Chip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogContentText,
//   DialogActions,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import Skeleton from "@mui/material/Skeleton";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import {
//   FaTasks,
//   FaUsers,
//   FaCheckCircle,
//   FaHourglassHalf,
//   FaPlayCircle,
// } from "react-icons/fa";
// import axios from "axios";
// import { TimeEntry } from "./TimeEntry";
// import Slide from "@mui/material/Slide";

// const statusOptions = ["Open", "In Progress", "Completed"];
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

// function Task() {
//   const theme = useTheme();
//   const [tasks, setTasks] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [currentTask, setCurrentTask] = useState(null);
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [viewTask, setViewTask] = useState(null);
//   const [assignOptions, setAssignOptions] = useState([]);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [selectedAssignees, setSelectedAssignees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//   const [taskToDelete, setTaskToDelete] = useState(null);
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });

//   const [newTask, setNewTask] = useState({
//     projectId: "",
//     project_name: "",
//     name: "",
//     assignTo: "",
//     assignToID: "",
//     status: "",
//     startDate: "",
//     endDate: "",
//     description: "",
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const TaskResponse = await axios.get(
//           "/server/time_entry_management_application_function/tasks"
//         );
//         const ProjectResponse = await axios.get(
//           "/server/time_entry_management_application_function/projects"
//         );
//         const EmployeeResponse = await axios.get(
//           "/server/time_entry_management_application_function/employee"
//         );

//         if (EmployeeResponse.status === 200) {
//           const formattedAssignTo = EmployeeResponse.data.users
//             .filter(
//               (employee) =>
//                 employee.role_details.role_name !== "Admin" &&
//                 employee.role_details.role_name !== "Super Admin"
//             )
//             .map((employee) => ({
//               username: `${employee.first_name} ${employee.last_name}`,
//               userID: employee.user_id,
//             }));

//           setAssignOptions(formattedAssignTo);
//         }

//         const tasksFromResponse = TaskResponse.data.data.map((item) => ({
//           id: item.ROWID,
//           taskid: item.ROWID,
//           name: item.Task_Name,
//           projectId: item.ProjectID,
//           project_name: item.Project_Name,
//           assignTo: item.Assign_To,
//           assignToID: item.Assign_To_ID,
//           status: item.Status,
//           startDate: item.Start_Date,
//           endDate: item.End_Date,
//           description: item.Description,
//         }));

//         setTasks(tasksFromResponse);
//         setProjects(ProjectResponse.data.data);

//         //console.log("tasks=>", tasksFromResponse);
//         //console.log("projects=>", ProjectResponse.data.data);
//         //console.log("assignTo=>", assignOptions);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleSearch = (event) => {
//     setSearchQuery(event.target.value);
//   };

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const filteredTasks = tasks.filter((task) =>
//     task.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const paginatedTasks = filteredTasks.slice(
//     page * rowsPerPage,
//     page * rowsPerPage + rowsPerPage
//   );

//   const toggleDrawer = (open) => {
//     setDrawerOpen(open);
//   };

//   const handleInputChange = (event) => {
//     const { name, value } = event.target;

//     if (name === "project") {
//       const selectedOption = projects.find((option) => option.ROWID === value);
//       //console.log(selectedOption);

//       if (selectedOption) {
//         setNewTask((prev) => ({
//           ...prev,
//           project_name: selectedOption.Project_Name,
//           projectId: selectedOption.ROWID,
//         }));
//       }
//     } else if (name === "associated") {
//       // Handle multiple selections
//       const selectedValues = event.target.value;
//       const selectedUsernames = selectedValues
//         .map((id) => {
//           const user = assignOptions.find((option) => option.userID === id);
//           return user ? user.username : "";
//         })
//         .filter((name) => name)
//         .join(", ");

//       setNewTask((prev) => ({
//         ...prev,
//         assignTo: selectedUsernames,
//         assignToID: selectedValues.join(","),
//       }));
//     } else {
//       setNewTask((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleAlert = (severity, message) => {
//     setSnackbar({
//       open: true,
//       message,
//       severity,
//     });
//   };

//   const handleCloseSnackbar = (event, reason) => {
//     if (reason === "clickaway") {
//       return;
//     }
//     setSnackbar((prev) => ({ ...prev, open: false }));
//   };

//   function SlideTransition(props) {
//     return <Slide {...props} direction="down" />;
//   }

//   const handleAddTask = async () => {
//     //console.log("newTask", newTask);
//     try {
//       // Ensure assignToID is properly formatted as a string
//       const assignToID = Array.isArray(newTask.assignToID)
//         ? newTask.assignToID.join(",")
//         : newTask.assignToID;

//       const response = await axios.post(
//         "/server/time_entry_management_application_function/tasks",
//         {
//           Status: newTask.status,
//           Description: newTask.description,
//           Assign_To: newTask.assignTo, // Already comma-separated string of names
//           Assign_To_ID: assignToID, // Ensure it's a comma-separated string of IDs
//           ProjectID: newTask.projectId,
//           Project_Name: newTask.project_name,
//           Task_Name: newTask.name,
//           Start_Date: newTask.startDate,
//           End_Date: newTask.endDate,
//         }
//       );

//       const updateData = {
//         id: response.data.data.ROWID,
//         taskid:
//           "TASK " +
//           response.data.data.ROWID.substr(response.data.data.ROWID.length - 4),
//         name: response.data.data.Task_Name,
//         projectId: response.data.data.ProjectID,
//         project_name: response.data.data.Project_Name,
//         assignTo: response.data.data.Assign_To,
//         assignToID: response.data.data.Assign_To_ID,
//         status: response.data.data.Status,
//         startDate: response.data.data.Start_Date,
//         endDate: response.data.data.End_Date,
//         description: response.data.data.Description,
//       };

//       const newTaskData = [...tasks, updateData];
//       setTasks(newTaskData);
//       handleCancel();
//       handleAlert("success", "Task added successfully");
//     } catch (error) {
//       handleAlert("error", error.message || "Error adding task");
//     }
//   };

//   const handleCancel = () => {
//     setNewTask({
//       project: "",
//       name: "",
//       assignTo: "",
//       status: "",
//       startDate: "",
//       endDate: "",
//       description: "",
//     });
//     toggleDrawer(false);
//   };

//   const handleEdit = (task) => {
//     setCurrentTask(task);
//     setEditModalOpen(true);
//   };

//   const handleDelete = async (ROWID) => {
//     const response = await axios.delete(
//       `/server/time_entry_management_application_function/tasks/${ROWID}`
//     );

//     const newTasksData = tasks.filter((item) => item.id !== ROWID);
//     setTasks(newTasksData);
//   };

//   const handleUpdateTask = async () => {
//     //console.log(currentTask);
//     try {
//       const ROWID = currentTask.id;
//       // Ensure assignToID is properly formatted as a string
//       const assignToID = Array.isArray(currentTask.assignToID)
//         ? currentTask.assignToID.join(",")
//         : currentTask.assignToID;

//       const updateResponse = await axios.post(
//         `/server/time_entry_management_application_function/tasks/${ROWID}`,
//         {
//           Status: currentTask.status,
//           Description: currentTask.description,
//           Assign_To: currentTask.assignTo, // Already comma-separated string of names
//           Assign_To_ID: assignToID, // Ensure it's a comma-separated string of IDs
//           ProjectID: currentTask.projectId,
//           Project_Name: currentTask.project_name,
//           Task_Name: currentTask.name,
//           Start_Date: currentTask.startDate,
//           End_Date: currentTask.endDate,
//         }
//       );

//       if (updateResponse.status === 200) {
//         setTasks((prev) =>
//           prev.map((task) =>
//             task.id === currentTask.id
//               ? {
//                   ...currentTask,
//                   assignToID: assignToID, // Ensure the updated task has the correct format
//                 }
//               : task
//           )
//         );
//         setCurrentTask(null);
//         setEditModalOpen(false);
//         handleAlert("success", "Task updated successfully");
//       } else {
//         handleAlert("error", "Failed to update task");
//       }
//     } catch (error) {
//       handleAlert("error", error.message || "Error updating task");
//     }
//   };

//   const handleEditInputChange = (event) => {
//     const { name, value } = event.target;

//     if (name === "project") {
//       const selectedOption = projects.find((option) => option.ROWID === value);

//       if (selectedOption) {
//         setCurrentTask((prev) => ({
//           ...prev,
//           project_name: selectedOption.Project_Name,
//           projectId: selectedOption.ROWID,
//         }));
//       }
//     } else if (name === "associated") {
//       // Handle multiple selections
//       const selectedValues = event.target.value;
//       const selectedUsernames = selectedValues
//         .map((id) => {
//           const user = assignOptions.find((option) => option.userID === id);
//           return user ? user.username : "";
//         })
//         .filter((name) => name)
//         .join(", ");

//       setCurrentTask((prev) => ({
//         ...prev,
//         assignTo: selectedUsernames,
//         assignToID: selectedValues.join(","),
//       }));
//     } else {
//       setCurrentTask((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleCloseEditModal = () => {
//     setEditModalOpen(false);
//   };

//   const handleViewTask = (task) => {
//     setViewTask(task);
//     setViewModalOpen(true);
//   };

//   const handleCloseViewModal = () => {
//     setViewTask(null);
//     setViewModalOpen(false);
//   };

//   const handleAssigneeClick = (event, assignees) => {
//     setSelectedAssignees(assignees.split(",").map((name) => name.trim()));
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClosePopover = () => {
//     setAnchorEl(null);
//   };

//   const handleDeleteClick = (task) => {
//     setTaskToDelete(task);
//     setDeleteConfirmOpen(true);
//   };

//   const handleDeleteConfirm = async () => {
//     if (taskToDelete) {
//       try {
//         const response = await axios.delete(
//           `/server/time_entry_management_application_function/tasks/${taskToDelete.id}`
//         );
//         if (response.status === 200) {
//           setTasks((prevTasks) =>
//             prevTasks.filter((task) => task.id !== taskToDelete.id)
//           );
//           handleAlert("success", "Task deleted successfully");
//         } else {
//           handleAlert("error", "Failed to delete task");
//         }
//       } catch (error) {
//         handleAlert("error", error.message || "Error deleting task");
//       } finally {
//         setDeleteConfirmOpen(false);
//         setTaskToDelete(null);
//       }
//     }
//   };

//   const handleDeleteCancel = () => {
//     setDeleteConfirmOpen(false);
//     setTaskToDelete(null);
//   };

//   return (
//     <Box sx={{ padding: 3 }}>
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: 3,
//         }}
//       >
//         <Typography variant="h4">Tasks</Typography>
//       </Box>

//       <Grid container spacing={3}>
//         <Grid item xs={12}>
//           <Card>
//             <CardContent
//               sx={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <TextField
//                 label="Search Tasks"
//                 variant="outlined"
//                 size="small"
//                 value={searchQuery}
//                 onChange={handleSearch}
//                 sx={{ width: "40%" }}
//               />
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={() => toggleDrawer(true)}
//               >
//                 Add Task
//               </Button>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12}>
//           {loading ? (
//             <Table>
//               <TableHead>
//                 <TableRow
//                   sx={{
//                     backgroundColor: theme.palette.primary.main,
//                   }}
//                 >
//                   <TableCell
//                     sx={{
//                       color: theme.palette.primary.contrastText,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Task ID
//                   </TableCell>
//                   <TableCell
//                     sx={{
//                       color: theme.palette.primary.contrastText,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Task Name
//                   </TableCell>
//                   <TableCell
//                     sx={{
//                       color: theme.palette.primary.contrastText,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Project Name
//                   </TableCell>
//                   <TableCell
//                     sx={{
//                       color: theme.palette.primary.contrastText,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Status
//                   </TableCell>
//                   <TableCell
//                     sx={{
//                       color: theme.palette.primary.contrastText,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Start Date
//                   </TableCell>
//                   <TableCell
//                     sx={{
//                       color: theme.palette.primary.contrastText,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     End Date
//                   </TableCell>
//                   <TableCell
//                     sx={{
//                       color: theme.palette.primary.contrastText,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Description
//                   </TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 <TableRow>
//                   <TableCell colSpan={7}>
//                     <Box
//                       sx={{
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         height: "300px",
//                         gap: 2,
//                       }}
//                     >
//                       {[...Array(6)].map((_, index) => (
//                         <Box
//                           key={index}
//                           sx={{
//                             display: "flex",
//                             width: "100%",
//                             height: "40px",
//                             alignItems: "center",
//                             gap: 2,
//                           }}
//                         >
//                           <Skeleton variant="text" width="8%" />
//                           <Skeleton variant="text" width="15%" />
//                           <Skeleton variant="text" width="10%" />
//                           <Skeleton variant="text" width="12%" />
//                           <Skeleton variant="text" width="15%" />
//                           <Skeleton variant="text" width="12%" />
//                           <Skeleton variant="text" width="12%" />
//                           <Skeleton variant="text" width="8%" />
//                           <Skeleton variant="text" width="8%" />
//                         </Box>
//                       ))}
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               </TableBody>
//             </Table>
//           ) : tasks.length === 0 ? (
//             <Table>
//               <TableHead>
//                 <TableRow
//                   sx={{
//                     backgroundColor: theme.palette.primary.main,
//                   }}
//                 >
//                   <TableCell
//                     sx={{
//                       color: theme.palette.primary.contrastText,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Task ID
//                   </TableCell>
//                   <TableCell
//                     sx={{
//                       color: theme.palette.primary.contrastText,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Task Name
//                   </TableCell>
//                   <TableCell
//                     sx={{
//                       color: theme.palette.primary.contrastText,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Project Name
//                   </TableCell>
//                   <TableCell
//                     sx={{
//                       color: theme.palette.primary.contrastText,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Associated
//                   </TableCell>
//                   <TableCell
//                     sx={{
//                       color: theme.palette.primary.contrastText,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Status
//                   </TableCell>
//                   <TableCell
//                     sx={{
//                       color: theme.palette.primary.contrastText,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Start Date
//                   </TableCell>
//                   <TableCell
//                     sx={{
//                       color: theme.palette.primary.contrastText,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     End Date
//                   </TableCell>
//                   <TableCell
//                     sx={{
//                       color: theme.palette.primary.contrastText,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Action
//                   </TableCell>
//                   <TableCell
//                     sx={{
//                       color: theme.palette.primary.contrastText,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Time
//                   </TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 <TableRow>
//                   <TableCell colSpan={8}>
//                     <Box
//                       sx={{
//                         p: 3,
//                         textAlign: "center",
//                         minHeight: "200px",
//                         display: "flex",
//                         flexDirection: "column",
//                         justifyContent: "center",
//                         alignItems: "center",
//                         gap: 2,
//                       }}
//                     >
//                       <FaTasks size={50} color={theme.palette.text.secondary} />
//                       <Typography variant="h5" color="text.secondary">
//                         No Tasks Found
//                       </Typography>
//                       <Typography variant="body1" color="text.secondary">
//                         There are no tasks to display.
//                       </Typography>
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               </TableBody>
//             </Table>
//           ) : (
//             <TableContainer component={Paper}>
//               <Table>
//                 <TableHead>
//                   <TableRow
//                     sx={{
//                       backgroundColor: theme.palette.primary.main,
//                     }}
//                   >
//                     <TableCell
//                       sx={{
//                         color: theme.palette.primary.contrastText,
//                         fontWeight: "bold",
//                       }}
//                     >
//                       Task ID
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         color: theme.palette.primary.contrastText,
//                         fontWeight: "bold",
//                       }}
//                     >
//                       Task Name
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         color: theme.palette.primary.contrastText,
//                         fontWeight: "bold",
//                       }}
//                     >
//                       Project Name
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         color: theme.palette.primary.contrastText,
//                         fontWeight: "bold",
//                       }}
//                     >
//                       Associated
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         color: theme.palette.primary.contrastText,
//                         fontWeight: "bold",
//                       }}
//                     >
//                       Status
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         color: theme.palette.primary.contrastText,
//                         fontWeight: "bold",
//                       }}
//                     >
//                       Start Date
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         color: theme.palette.primary.contrastText,
//                         fontWeight: "bold",
//                       }}
//                     >
//                       End Date
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         color: theme.palette.primary.contrastText,
//                         fontWeight: "bold",
//                       }}
//                     >
//                       Action
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         color: theme.palette.primary.contrastText,
//                         fontWeight: "bold",
//                       }}
//                     >
//                       Time Entry
//                     </TableCell>
//                   </TableRow>
//                 </TableHead>
//                 {loading ? (
//                   <TableBody>
//                     <TableRow>
//                       <TableCell colSpan={7}>
//                         <Box
//                           sx={{
//                             display: "flex",
//                             flexDirection: "column",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             height: "300px",
//                             gap: 2,
//                           }}
//                         >
//                           {[...Array(6)].map((_, index) => (
//                             <Box
//                               key={index}
//                               sx={{
//                                 display: "flex",
//                                 width: "100%",
//                                 height: "40px",
//                                 alignItems: "center",
//                                 gap: 2,
//                               }}
//                             >
//                               <Skeleton variant="text" width="8%" />
//                               <Skeleton variant="text" width="15%" />
//                               <Skeleton variant="text" width="10%" />
//                               <Skeleton variant="text" width="12%" />
//                               <Skeleton variant="text" width="15%" />
//                               <Skeleton variant="text" width="12%" />
//                               <Skeleton variant="text" width="12%" />
//                               <Skeleton variant="text" width="8%" />
//                               <Skeleton variant="text" width="8%" />
//                             </Box>
//                           ))}
//                         </Box>
//                       </TableCell>
//                     </TableRow>
//                   </TableBody>
//                 ) : tasks.length === 0 ? (
//                   <TableBody>
//                     <TableRow>
//                       <TableCell colSpan={9} sx={{ p: 0 }}>
//                         <Box
//                           sx={{
//                             width: "100%",
//                             display: "flex",
//                             flexDirection: "column",
//                             gap: 1,
//                             p: 2,
//                           }}
//                         >
//                           {[...Array(6)].map((_, index) => (
//                             <Box
//                               key={index}
//                               sx={{
//                                 display: "flex",
//                                 width: "100%",
//                                 height: "40px",
//                                 alignItems: "center",
//                                 gap: 2,
//                               }}
//                             >
//                               <Skeleton variant="text" width="8%" />{" "}
//                               {/* Task ID */}
//                               <Skeleton variant="text" width="15%" />{" "}
//                               {/* Task Name */}
//                               <Skeleton variant="text" width="15%" />{" "}
//                               {/* Project Name */}
//                               <Skeleton variant="text" width="12%" />{" "}
//                               {/* Associated */}
//                               <Skeleton variant="text" width="10%" />{" "}
//                               {/* Status */}
//                               <Skeleton variant="text" width="12%" />{" "}
//                               {/* Start Date */}
//                               <Skeleton variant="text" width="12%" />{" "}
//                               {/* End Date */}
//                               <Skeleton variant="text" width="8%" />{" "}
//                               {/* Actions */}
//                               <Skeleton variant="text" width="8%" />{" "}
//                               {/* Time Entry */}
//                             </Box>
//                           ))}
//                         </Box>
//                       </TableCell>
//                     </TableRow>
//                   </TableBody>
//                 ) : (
//                   <TableBody>
//                     {paginatedTasks.map((task) => (
//                       <TableRow key={task.id}>
//                         <TableCell>
//                           {"T" + task.id.substr(task.id.length - 4)}
//                         </TableCell>
//                         <TableCell>{task.name}</TableCell>
//                         <TableCell>{task.project_name}</TableCell>
//                         <TableCell>
//                           <Tooltip title="View Assignees">
//                             <IconButton
//                               size="small"
//                               onClick={(e) =>
//                                 handleAssigneeClick(e, task.assignTo)
//                               }
//                               sx={{ color: theme.palette.primary.main }}
//                             >
//                               <FaUsers />
//                               <Typography variant="body2" sx={{ ml: 1 }}>
//                                 {task.assignTo.split(",").length}
//                               </Typography>
//                             </IconButton>
//                           </Tooltip>

//                           <Popover
//                             open={Boolean(anchorEl)}
//                             anchorEl={anchorEl}
//                             onClose={handleClosePopover}
//                             anchorOrigin={{
//                               vertical: "bottom",
//                               horizontal: "left",
//                             }}
//                             transformOrigin={{
//                               vertical: "top",
//                               horizontal: "left",
//                             }}
//                           >
//                             <List
//                               sx={{
//                                 minWidth: 200,
//                                 maxWidth: 300,
//                                 p: 1,
//                                 bgcolor: theme.palette.background.paper,
//                                 boxShadow: theme.shadows[2],
//                                 borderRadius: 1,
//                               }}
//                             >
//                               <Typography
//                                 variant="subtitle2"
//                                 sx={{
//                                   px: 2,
//                                   py: 1,
//                                   color: theme.palette.text.secondary,
//                                   borderBottom: `1px solid ${theme.palette.divider}`,
//                                 }}
//                               >
//                                 Assigned Users
//                               </Typography>
//                               {selectedAssignees.map((assignee, index) => (
//                                 <ListItem key={index} sx={{ py: 0.5 }}>
//                                   <ListItemText
//                                     primary={assignee}
//                                     primaryTypographyProps={{
//                                       variant: "body2",
//                                     }}
//                                   />
//                                 </ListItem>
//                               ))}
//                             </List>
//                           </Popover>
//                         </TableCell>
//                         <TableCell>
//                           <Chip
//                             icon={
//                               <Box
//                                 component={
//                                   statusConfig[task.status]?.icon ||
//                                   FaHourglassHalf
//                                 }
//                                 sx={{
//                                   fontSize: "1rem !important",
//                                   mr: "4px !important",
//                                   ml: "4px !important",
//                                   color:
//                                     statusConfig[task.status]?.color ||
//                                     "#757575",
//                                 }}
//                               />
//                             }
//                             label={task.status}
//                             sx={{
//                               backgroundColor:
//                                 statusConfig[task.status]?.backgroundColor ||
//                                 "#f5f5f5",
//                               color:
//                                 statusConfig[task.status]?.color || "#757575",
//                               border: `1px solid ${statusConfig[task.status]?.borderColor || "#e0e0e0"}`,
//                               fontWeight: 500,
//                               "& .MuiChip-label": {
//                                 px: 1,
//                               },
//                               minWidth: 110,
//                               height: 28,
//                               borderRadius: "14px",
//                               "&:hover": {
//                                 backgroundColor:
//                                   statusConfig[task.status]?.backgroundColor ||
//                                   "#f5f5f5",
//                                 opacity: 0.9,
//                               },
//                             }}
//                             size="small"
//                           />
//                         </TableCell>
//                         <TableCell>{task.startDate}</TableCell>
//                         <TableCell>{task.endDate}</TableCell>
//                         <TableCell>
//                           <IconButton
//                             color="primary"
//                             onClick={() => handleEdit(task)}
//                           >
//                             <EditIcon />
//                           </IconButton>
//                           <IconButton
//                             color="error"
//                             onClick={() => handleDeleteClick(task)}
//                           >
//                             <DeleteIcon />
//                           </IconButton>
//                         </TableCell>
//                         <TableCell>
//                           <Button
//                             variant="outlined"
//                             size="small"
//                             color="primary"
//                             onClick={() => handleViewTask(task)}
//                           >
//                             View
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 )}
//                 <TableFooter>
//                   <TableRow>
//                     <TablePagination
//                       rowsPerPageOptions={[5, 10, 20]}
//                       count={filteredTasks.length}
//                       rowsPerPage={rowsPerPage}
//                       page={page}
//                       onPageChange={handleChangePage}
//                       onRowsPerPageChange={handleChangeRowsPerPage}
//                     />
//                   </TableRow>
//                 </TableFooter>
//               </Table>
//             </TableContainer>
//           )}
//         </Grid>
//       </Grid>

//       {/* Add Task Drawer */}
//       <Drawer
//         anchor="right"
//         open={drawerOpen}
//         onClose={() => toggleDrawer(false)}
//       >
//         <Box
//           sx={{
//             width: 400,
//             padding: 2,
//             position: "relative",
//             maxHeight: "90vh",
//             overflowY: "auto",
//             marginTop: "70px",
//           }}
//         >
//           <Typography variant="h5" sx={{ marginBottom: 3 }}>
//             Add Task
//           </Typography>

//           <TextField
//             label="Add Project"
//             name="project"
//             fullWidth
//             select
//             value={newTask.projectId}
//             onChange={handleInputChange}
//             sx={{ marginBottom: 2 }}
//           >
//             {projects.map((option) => (
//               <MenuItem key={option.ROWID} value={option.ROWID}>
//                 {option.Project_Name}
//               </MenuItem>
//             ))}
//           </TextField>

//           <TextField
//             label="Add Task"
//             name="name"
//             fullWidth
//             value={newTask.name}
//             onChange={handleInputChange}
//             sx={{ marginBottom: 2 }}
//           />

//           <TextField
//             label="Associated"
//             name="associated"
//             fullWidth
//             select
//             SelectProps={{ multiple: true }}
//             value={newTask.assignToID ? newTask.assignToID.split(",") : []}
//             onChange={handleInputChange}
//             sx={{ marginBottom: 2 }}
//           >
//             {assignOptions.map((option) => (
//               <MenuItem key={option.userID} value={option.userID}>
//                 {option.username}
//               </MenuItem>
//             ))}
//           </TextField>

//           <TextField
//             select
//             fullWidth
//             label="Status"
//             name="status"
//             value={newTask.status}
//             onChange={handleInputChange}
//             sx={{ mb: 2 }}
//           >
//             {Object.keys(statusConfig).map((status) => (
//               <MenuItem
//                 key={status}
//                 value={status}
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 1,
//                   py: 1,
//                 }}
//               >
//                 <Box
//                   component={statusConfig[status].icon}
//                   sx={{
//                     color: statusConfig[status].color,
//                     fontSize: "1.1rem",
//                   }}
//                 />
//                 <Typography
//                   sx={{
//                     color: statusConfig[status].color,
//                     fontWeight: 500,
//                   }}
//                 >
//                   {status}
//                 </Typography>
//               </MenuItem>
//             ))}
//           </TextField>

//           <TextField
//             label="Start Date"
//             name="startDate"
//             fullWidth
//             type="date"
//             value={newTask.startDate}
//             onChange={handleInputChange}
//             InputLabelProps={{ shrink: true }}
//             sx={{ marginBottom: 2 }}
//           />

//           <TextField
//             label="End Date"
//             name="endDate"
//             fullWidth
//             type="date"
//             value={newTask.endDate}
//             onChange={handleInputChange}
//             InputLabelProps={{ shrink: true }}
//             sx={{ marginBottom: 2 }}
//           />

//           <TextField
//             label="Add Description"
//             name="description"
//             fullWidth
//             multiline
//             rows={4}
//             value={newTask.description}
//             onChange={handleInputChange}
//             sx={{ marginBottom: 3 }}
//           />

//           <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//             <Button variant="contained" color="primary" onClick={handleAddTask}>
//               Add
//             </Button>
//             <Button variant="outlined" color="error" onClick={handleCancel}>
//               Cancel
//             </Button>
//           </Box>
//         </Box>
//       </Drawer>

//       {/* Edit Task */}
//       <Modal
//         open={editModalOpen}
//         onClose={handleCloseEditModal}
//         aria-labelledby="edit-task-modal"
//         aria-describedby="modal-for-editing-task"
//       >
//         <Box
//           sx={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             width: 400,
//             bgcolor: theme.palette.background.paper,
//             boxShadow: 24,
//             p: 4,
//             borderRadius: 2,
//           }}
//         >
//           <Typography id="edit-task-modal" variant="h6" sx={{ mb: 2 }}>
//             Edit Task
//           </Typography>

//           {currentTask && (
//             <>
//               <TextField
//                 label="Task Name"
//                 name="name"
//                 fullWidth
//                 value={currentTask.name}
//                 onChange={handleEditInputChange}
//                 sx={{ mb: 2 }}
//               />

//               <TextField
//                 label="Project"
//                 name="project"
//                 fullWidth
//                 select
//                 value={currentTask.projectId || ""}
//                 onChange={handleEditInputChange}
//                 sx={{ mb: 2 }}
//               >
//                 {projects.map((option) => (
//                   <MenuItem key={option.ROWID} value={option.ROWID}>
//                     {option.Project_Name}
//                   </MenuItem>
//                 ))}
//               </TextField>

//               <TextField
//                 label="Associated"
//                 name="associated"
//                 fullWidth
//                 select
//                 SelectProps={{ multiple: true }}
//                 value={
//                   currentTask.assignToID
//                     ? currentTask.assignToID.split(",")
//                     : []
//                 }
//                 onChange={handleEditInputChange}
//                 sx={{ mb: 2 }}
//               >
//                 {assignOptions.map((option) => (
//                   <MenuItem key={option.userID} value={option.userID}>
//                     {option.username}
//                   </MenuItem>
//                 ))}
//               </TextField>

//               <TextField
//                 select
//                 fullWidth
//                 label="Status"
//                 name="status"
//                 value={currentTask.status}
//                 onChange={handleEditInputChange}
//                 sx={{ mb: 2 }}
//               >
//                 {Object.keys(statusConfig).map((status) => (
//                   <MenuItem
//                     key={status}
//                     value={status}
//                     sx={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 1,
//                       py: 1,
//                     }}
//                   >
//                     <Box
//                       component={statusConfig[status].icon}
//                       sx={{
//                         color: statusConfig[status].color,
//                         fontSize: "1.1rem",
//                       }}
//                     />
//                     <Typography
//                       sx={{
//                         color: statusConfig[status].color,
//                         fontWeight: 500,
//                       }}
//                     >
//                       {status}
//                     </Typography>
//                   </MenuItem>
//                 ))}
//               </TextField>

//               <TextField
//                 label="Start Date"
//                 name="startDate"
//                 fullWidth
//                 type="date"
//                 value={currentTask.startDate}
//                 onChange={handleEditInputChange}
//                 InputLabelProps={{ shrink: true }}
//                 sx={{ mb: 2 }}
//               />

//               <TextField
//                 label="End Date"
//                 name="endDate"
//                 fullWidth
//                 type="date"
//                 value={currentTask.endDate}
//                 onChange={handleEditInputChange}
//                 InputLabelProps={{ shrink: true }}
//                 sx={{ mb: 2 }}
//               />

//               <TextField
//                 label="Add Description"
//                 name="description"
//                 fullWidth
//                 multiline
//                 rows={4}
//                 value={currentTask.description}
//                 onChange={handleEditInputChange}
//                 sx={{ marginBottom: 3 }}
//               />

//               <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   onClick={handleUpdateTask}
//                 >
//                   Update
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   color="error"
//                   onClick={handleCloseEditModal}
//                 >
//                   Cancel
//                 </Button>
//               </Box>
//             </>
//           )}
//         </Box>
//       </Modal>

//       {/* time entry */}
//       {viewTask ? (
//         <TimeEntry
//           theme={theme}
//           handleEditInputChange={handleEditInputChange}
//           projects={projects}
//           statusOptions={statusOptions}
//           handleUpdateTask={handleUpdateTask}
//           viewModalOpen={viewModalOpen}
//           viewTask={viewTask}
//           setViewTask={setViewTask}
//           handleCloseViewModal={handleCloseViewModal}
//         />
//       ) : (
//         <div></div>
//       )}

//       {/* Delete Confirmation Dialog */}
//       <Dialog
//         open={deleteConfirmOpen}
//         onClose={handleDeleteCancel}
//         aria-labelledby="delete-dialog-title"
//         aria-describedby="delete-dialog-description"
//       >
//         <DialogTitle id="delete-dialog-title">{"Confirm Delete"}</DialogTitle>
//         <DialogContent>
//           <DialogContentText id="delete-dialog-description">
//             Are you sure you want to delete task "{taskToDelete?.name}"? This
//             action cannot be undone.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleDeleteCancel} color="primary">
//             Cancel
//           </Button>
//           <Button
//             onClick={handleDeleteConfirm}
//             color="error"
//             variant="contained"
//             autoFocus
//           >
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: "top", horizontal: "center" }}
//         TransitionComponent={SlideTransition}
//       >
//         <Alert
//           onClose={handleCloseSnackbar}
//           severity={snackbar.severity}
//           variant="filled"
//           sx={{
//             width: "100%",
//             "&.MuiAlert-standardSuccess": {
//               backgroundColor: "#4caf50",
//               color: "#fff",
//             },
//             "&.MuiAlert-standardError": {
//               backgroundColor: "#f44336",
//               color: "#fff",
//             },
//             "& .MuiAlert-icon": {
//               color: "#fff",
//             },
//           }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }

// export default Task;
