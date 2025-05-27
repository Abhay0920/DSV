import React, { useState, useEffect } from "react";
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
  Avatar,
  alpha,
  useTheme,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Autocomplete,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Skeleton from "@mui/material/Skeleton";
import { TimeEntry } from "./TimeEntry";
import Slide from "@mui/material/Slide";
import { ProjectTimeEntry } from "./ProjectTimeEntry";
import { useDemoRouter } from "@toolpad/core/internal";
import Task from "./Task";
import { useNavigate } from "react-router-dom";
import { FaProjectDiagram } from "react-icons/fa";
import InfoIcon from "@mui/icons-material/Info";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import EventIcon from "@mui/icons-material/Event";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import TaskIcon from "@mui/icons-material/Task";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects, addProject } from "../redux/Project/ProjectSlice";
import { fetchEmployees } from "../redux/Employee/EmployeeSlice";
import { fetchClientData } from "../redux/Client/clientSlice";
import { projectActions } from "../redux/Project/ProjectSlice";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { pink } from "@mui/material/colors";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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

const getStatusColor = (status) => {
  switch (status) {
    case "Close":
      return "success";
    case "Work In Process":
      return "warning";
    case "Open":
      return "error";
    default:
      return "default";
  }
};

function Project() {
  const navigate = useNavigate();
  const theme = useTheme();
  const router = useDemoRouter();
  const currUser = JSON.parse(localStorage.getItem("currUser"));
  const [assignOptions, setAssignOptions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditProject, setCurrentEditProject] = useState(null);
  const [viewproject, setViewproject] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const statusOptions = ["Open", "In Progress", "Completed"];
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [open, setOpen] = useState(false);
  const [taskModelOpen, setTaskModelOpen] = useState(false);

  const [filterActive, setFilterActive] = useState(false);

  const [newProject, setNewProject] = useState({
    id: "",
    name: "",
    client_name: "",
    clientID: "",
    status: "",
    owner: currUser.firstName + " " + currUser.lastName,
    ownerID: currUser.userid,
    startDate: "",
    endDate: "",
    description: "",
    assignedTo: "",
    assignedToID: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [projectDetail, setprojectdetail] = useState(null);
  const [errors, setErrors] = useState({});

  // start
  const dispatch = useDispatch();
  const { data, isLoading } = useSelector((state) => state.projectReducer);
  const { data: employeedata } = useSelector((state) => state.employeeReducer);
  const { data: client } = useSelector((state) => state.clientReducer);

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      dispatch(fetchProjects());
    }
    if (!Array.isArray(client) || client.length === 0) {
      dispatch(fetchClientData());
    }
    if (!Array.isArray(employeedata) || employeedata.length === 0) {
      dispatch(fetchEmployees());
    }
  }, []);

  useEffect(() => {
    if (employeedata) {
      // Check if employeedata is available before filtering
      const employee = employeedata
        .filter(
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
    }
  }, [employeedata]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleEdit = (project) => {
    console.log("edit project", project);
    setCurrentEditProject({ ...project });
    setEditModalOpen(true);
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      try {
        console.log("project", projectToDelete);
        const response = await axios.delete(
          `/server/time_entry_management_application_function/delete/${projectToDelete.ROWID}`
        );
        console.log("deleted project", response);
        if (response.status === 200) {
          // Remove the project from the local state
          dispatch(projectActions.deleteProjecttData(projectToDelete.ROWID));
          handleAlert("success", "Project deleted successfully");
        } else {
          handleAlert("error", "Failed to delete project");
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        handleAlert("error", error.message || "Error deleting project");
      } finally {
        setDeleteConfirmOpen(false);
        setProjectToDelete(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setProjectToDelete(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredProjects = data?.filter(
    (project) =>
      // return(
      project.Project_Name &&
      project.Project_Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedProjects = filteredProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Drawer Handlers
  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const validate = () => {
    let tempErrors = {};
    if (!newProject.name || newProject.name.length < 3)
      tempErrors.name = "Project Name must be at least 3 characters.";

    if (!newProject.status) tempErrors.status = "Status is required.";
    if (!newProject.startDate) tempErrors.startDate = "Start Date is required.";
    if (!newProject.endDate) tempErrors.endDate = "End Date is required.";
    if (
      newProject.startDate &&
      newProject.endDate &&
      newProject.startDate > newProject.endDate
    )
      tempErrors.endDate = "End Date must be after Start Date.";
    if (!newProject.assignedToID)
      tempErrors.assignedToID = "Assign To is required.";
    if (!newProject.description || newProject.description.length < 10)
      tempErrors.description = "Description must be at least 10 characters.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    console.log("name", name);
    console.log("value", value);
    if (name === "assignedToID") {
      // Find the selected option by matching userID
      const selectedOption = assignOptions.find(
        (option) => option.userID === value
      );

      if (selectedOption) {
        // Update the state with username and userID
        setNewProject((prev) => ({
          ...prev,
          assignedTo: selectedOption.username, // Display the username in the field
          assignedToID: selectedOption.userID, // Use the userID for the backend logic
        }));
      }
    } else if (name === "clientID") {
      const selectedClient = client?.find((option) => option.ROWID === value);
      console.log("selected client", selectedClient);

      if (selectedClient) {
        setNewProject((prev) => ({
          ...prev,
          client_name: selectedClient.Org_Name,
          clientID: selectedClient.ROWID,
        }));
      }
    } else {
      setNewProject((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProject = async () => {
    try {
      console.log("abhay singh", newProject);

      const response = await axios.post(
        "/server/time_entry_management_application_function/projects",
        {
          Project_Name: newProject.name,
          Description: newProject.description,
          Start_Date: newProject.startDate,
          End_Date: newProject.endDate,
          Status: newProject.status,
          Owner: currUser.firstName + " " + currUser.lastName,
          Owner_Id: currUser.userid,
          Assigned_To: newProject.assignedTo,
          Assigned_To_Id: newProject.assignedToID,
          Client_ID: newProject.clientID,
          Client_Name: newProject.client_name,
        }
      );

      const result = response.data;
      //console.log(response.data.data);

      if (result.success) {
        // Update the local state with the new project
        const newProjectData = {
          ...newProject,
          owner: result.data.Owner,
          ownerID: result.data.ownerID,
          id: result.data.ROWID,
          rowid: result.data.ROWID,
        };

        ////console.log("wqe", newProjectData);

        dispatch(projectActions.addProjectData(response.data.data));
        // Reset the form
        setNewProject({
          id: "",
          name: "",
          status: "",
          owner: "",
          ownerID: "",
          startDate: "",
          endDate: "",
          description: "",
          assignedTo: "",
          assignedToID: "",
        });
        toggleDrawer(false);
        handleAlert("success", "Project added successfully");
      } else {
        handleAlert("error", result.message || "Failed to add project");
      }
    } catch (error) {
      handleAlert("error", error.message || "Error adding project");
    }
  };

  const handleCancel = () => {
    setNewProject({
      name: "",
      status: "",
      startDate: "",
      endDate: "",
      description: "",
      assignedTo: "",
    });
    toggleDrawer(false);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    ////console.log("Value changed:", name, value);
    console.log("heelo", name, value);
    setCurrentEditProject((prev) => ({ ...prev, [name]: value }));

    if (name === "assignedTo") {
      const selectedOption = assignOptions.find(
        (option) => option.userID === value
      );

      // ////console.log(selectedOption);

      if (selectedOption) {
        // Update the state with username and userID
        setCurrentEditProject((prev) => ({
          ...prev,
          Assigned_To: selectedOption.username,
          Assigned_To_Id: selectedOption.userID,
        }));
      }
    } else if (name === "Client_ID") {
      console.log("jeee");
      const selectedClient = assignOptions.find(
        (option) => option.userID === value && option.role === "Client"
      );
      console.log("selected cliend", selectedClient);

      if (selectedClient) {
        setCurrentEditProject((prev) => ({
          ...prev,
          client_name: selectedClient.username,
          clientID: selectedClient.userID,
        }));
      }
    } else {
      setNewProject((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateProject = async (rowid) => {
    console.log("projects", currentEditProject);
    //console.log("currUser", currUser);

    try {
      const response = await axios.post(
        `/server/time_entry_management_application_function/projects/${rowid}`,
        {
          Project_Name: currentEditProject.Project_Name,
          Description: currentEditProject.Description,
          Start_Date: currentEditProject.Start_Date,
          End_Date: currentEditProject.End_Date,
          Status: currentEditProject.Status,
          Owner: currUser.firstName + " " + currUser.lastName,
          Owner_Id: currUser.user_id,
          Assigned_To: currentEditProject.Assigned_To,
          Assigned_To_Id: currentEditProject.Assigned_To_Id,
          Client_Name: currentEditProject.Client_Name,
          Client_ID: currentEditProject.Client_ID,
        }
      );
      console.log(response);
      if (response.status === 200) {
        const updateProject = response.data;
        dispatch(projectActions.updateProjectData(response.data.data));
        handleAlert("success", "Project updated successfully");
        setEditModalOpen(false);
        currentEditProject("");
      } else {
        handleAlert("error", "Failed to update project");
      }
    } catch (error) {
      //console.log("err", error.message);
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setCurrentEditProject(null);
  };

  const handleViewproject = (project) => {
    console.log("asd", project);
    setViewproject(project);
    setViewModalOpen(true);
  };

  const handleViewTask = (project) => {
    setViewproject(project);
    setTaskModelOpen(true);
  };
  const handleCloseViewModal = () => {
    setViewproject(null);
    setViewModalOpen(false);
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

  const handlefiltetActive = (project) => {
    console.log("Project = ", project);

    navigate("/task", {
      state: { projectId: project.ROWID, projectName: project.Project_Name },
    });
    const pathname = "/tasks";

    setViewproject(project);
    // setFilterActive(true);
  };

  const handleSubmit = () => {
    console.log("new", newProject);
    if (validate()) {
      handleAddProject(newProject);
      toggleDrawer(false);
    }
  };

  const handleCloseDrawer = () => {
    setOpen(false);
  };

  const handleDownloadTimeEntries = async (ROWID)=>{
    console.log("ROWID",ROWID);
    const TimeEntryResponse = await axios.get(
      `/server/time_entry_management_application_function/dowloadExcel/${ROWID}`
    );
    
    
    console.log("Time Entres",TimeEntryResponse);
    
    const flattened = [];
    TimeEntryResponse.data.data.forEach(task => {
      const taskName = task.Task_Name;
      task.details.forEach(detail => {
        const entry = detail.Time_Entries;
        flattened.push({
          'Task Name': taskName,
          'Entry Date': entry.Entry_Date,
          'Start Time': entry.Start_time,
          'End Time': entry.End_time,
          'Total Time (hrs)': (parseInt(entry.Total_time) / 60).toFixed(2),
          'Username': entry.Username,
          'Note': entry.Note,
          'Project Name': entry.Project_Name
        });
      });
    });

    console.log("flattened",flattened);
    const worksheet = XLSX.utils.json_to_sheet(flattened);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Task Time Entries');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(fileData, 'Task_Time_Entries.xlsx');
 

  }

  const fields = [
    [
      "Project ID",
      "P" + projectDetail?.ROWID?.slice(-4),
      <InfoIcon color="primary" />,
    ],
    [
      "Project Name",
      projectDetail?.Project_Name,
      <AssignmentIcon color="primary" />,
    ],
    ["Assigned To", projectDetail?.Assigned_To, <PersonIcon color="primary" />],
    [
      "Client Name",
      projectDetail?.Client_Name?.trim()
        ? projectDetail.Client_Name
        : "Internal",
      <BusinessIcon color="primary" />,
    ],
    ["Start Date", projectDetail?.Start_Date, <EventIcon color="primary" />],
    ["End Date", projectDetail?.End_Date, <ScheduleIcon color="primary" />],
    ["Status", projectDetail?.Status, <TrackChangesIcon color="primary" />],
    ["Owner", projectDetail?.Owner, <EmojiEventsIcon color="primary" />],
    ["Description", projectDetail?.Description,<DescriptionIcon color="primary" />],
    [
      "Time Entries",
      <Button
        variant="contained"
         color="primary"
        // startIcon={<DownloadIcon />}
        onClick={() => handleDownloadTimeEntries(projectDetail?.ROWID)}
        >
        Download Time Sheet
      </Button>,
      <DownloadIcon color="primary" />,
    ],
  ];

  const handleDetailDrwaer = (e, project) => {
    setOpen(true);
    console.log("name of the project", project);
    setprojectdetail(project);
    
  };


  return (
    <Box sx={{ padding: 3 }}>
      {/* Header */}
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
            Projects
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
            label="Search Projects"
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
            New Project
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Header with Search and New Project Button */}

        {/* Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#1976d2" }}>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                    Project Name
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                    Client
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                    Start Date
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                    End Date
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                    Actions
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                    Tasks
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                    Time Entries
                  </TableCell>
                </TableRow>
              </TableHead>

              {isLoading ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={10} sx={{ p: 0 }}>
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
                              display: "grid",
                              gridTemplateColumns:
                                "8% 15% 10% 12% 15% 12% 12% 8% 8%",
                              alignItems: "center",
                              gap: 2,
                              height: "40px",
                              width: "100%",
                            }}
                          >
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="100%" />
                            <Skeleton variant="text" width="100%" />
                            {/* <Skeleton variant="text" width="100%" /> */}
                          </Box>
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : paginatedProjects.length === 0 ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={15}>
                      <Box
                        sx={{
                          p: 2,
                          textAlign: "center",
                          minHeight: "200px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <FaProjectDiagram
                          size={50}
                          color={theme.palette.text.secondary}
                        />
                        <Typography variant="h5" color="text.secondary">
                          No Project Found
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          There are no Project to display.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {paginatedProjects.map((project) => (
                    <TableRow
                      key={project.id}
                      onClick={(e) => handleDetailDrwaer(e, project)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor:
                            theme.palette.mode === "light"
                              ? "#e3f2fd"
                              : theme.palette.primary.dark,
                          color: theme.palette.primary.contrastText,
                        },
                      }}
                    >
                      <TableCell>
                        {"P" + project.ROWID.substr(project.ROWID.length - 4)}
                      </TableCell>
                      <TableCell>{project.Project_Name}</TableCell>
                      <TableCell>
                        <Chip
                          label={project.Status}
                          size="small"
                          sx={{
                            backgroundColor:
                              statusConfig[project.Status]?.backgroundColor ||
                              "#f5f5f5",
                            color:
                              statusConfig[project.Status]?.color || "#757575",
                            border: `1px solid ${statusConfig[project.Status]?.borderColor || "#e0e0e0"}`,
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
                        {project?.Client_Name
                          ? project.Client_Name
                          : "Internal"}
                      </TableCell>
                      <TableCell>{project.Start_Date}</TableCell>
                      <TableCell>{project.End_Date}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(project);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(project);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <TaskIcon
                          fontSize="large"
                          sx={{
                            color: theme.palette.primary.main,
                            fontSize: 30,
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlefiltetActive(project);
                          }}
                        />
                      </TableCell>

                      <TableCell
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <AccessTimeIcon
                          fontSize="large" // Use 'small', 'medium', 'large', or set via style
                          style={{
                            color: theme.palette.primary.main,
                            fontSize: 30, // You can increase this number as needed (e.g., 36, 40)
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewproject(project);
                          }}
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
                    count={filteredProjects.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
      >
        <Box
          sx={{
            width: 400,
            padding: 2,
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
              mb: 2,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              marginBottom: 2,
              background: "linear-gradient(135deg, #1976d2, #42a5f5)",
              boxShadow: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", color: "#fff" }}>
              <WorkOutlineIcon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Add New Project
              </Typography>
            </Box>
            <Tooltip title="Close">
              <IconButton
                onClick={() => toggleDrawer(false)}
                sx={{
                  color: "#fff",
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.2)",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <TextField
            label="Project Name"
            name="name"
            fullWidth
            variant="outlined"
            value={newProject.name}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ marginBottom: 2 }}
          />

          <Autocomplete
            options={client}
            getOptionLabel={(option) => option.Org_Name} // Display username in options
            isOptionEqualToValue={(option, value) =>
              option.ROWID === value.ROWID
            } // Ensure correct selection
            onChange={(event, newValue) => {
              handleInputChange({
                target: {
                  name: "client_name", // Update the client_name in the state
                  value: newValue ? newValue.Org_Name : "", // Display username
                },
              });
              handleInputChange({
                target: {
                  name: "clientID", // Assuming you need the client ID too
                  value: newValue ? newValue.ROWID : "",
                },
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Client Name"
                name="client_name"
                fullWidth
                variant="outlined"
                sx={{ marginBottom: 2 }}
              />
            )}
            noOptionsText="No clients available" // Custom message when no options are found
          />

          <TextField
            label="Status"
            name="status"
            fullWidth
            variant="outlined"
            select
            value={newProject.status}
            onChange={handleInputChange}
            error={!!errors.status}
            helperText={errors.status}
            sx={{ marginBottom: 2 }}
          >
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="Work In Process">Work In Process</MenuItem>
            <MenuItem value="Close">Close</MenuItem>
          </TextField>

          <TextField
            label="Start Date"
            name="startDate"
            fullWidth
            variant="outlined"
            type="date"
            value={newProject.startDate}
            onChange={handleInputChange}
            error={!!errors.startDate}
            helperText={errors.startDate}
            InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="End Date"
            name="endDate"
            fullWidth
            variant="outlined"
            type="date"
            value={newProject.endDate}
            onChange={handleInputChange}
            error={!!errors.endDate}
            helperText={errors.endDate}
            InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
          />

          <Autocomplete
            options={assignOptions}
            getOptionLabel={(option) => option.username} // Display username in options
            isOptionEqualToValue={(option, value) =>
              option.userID === value.userID
            } // Ensure correct selection
            onChange={(event, newValue) => {
              handleInputChange({
                target: {
                  name: "assignedToID",
                  value: newValue ? newValue.userID : "",
                },
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assign To"
                name="assignedToID"
                fullWidth
                variant="outlined"
                error={!!errors.assignedToID}
                helperText={errors.assignedToID}
                sx={{ marginBottom: 2 }}
              />
            )}
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newProject.description}
            onChange={handleInputChange}
            error={!!errors.description}
            helperText={errors.description}
            sx={{ marginBottom: 2 }}
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
              sx={{ width: 100 }}
            >
              Add
            </Button>
            <Button variant="outlined" color="error" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Edit Modal */}
      <Modal open={editModalOpen} onClose={handleEditCancel}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%", // Reduced width to 60%
            maxHeight: "80vh", // Set max height to 80% of viewport height
            overflowY: "auto", // Add scroll if content exceeds max height
            padding: 4,
            backgroundColor: (theme) => theme.palette.background.paper,
            boxShadow: 24,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            Edit Project
          </Typography>
          <TextField
            label="Project Name"
            name="Project_Name"
            fullWidth
            variant="outlined"
            value={currentEditProject?.Project_Name || ""}
            onChange={handleEditChange}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Status"
            name="Status"
            fullWidth
            variant="outlined"
            select
            value={currentEditProject?.Status || ""}
            onChange={handleEditChange}
            sx={{ marginBottom: 2 }}
          >
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="Work In Process">Work In Process</MenuItem>
            <MenuItem value="Close">Close</MenuItem>
          </TextField>

          <Autocomplete
            value={
              client.find(
                (option) => option.ROWID === currentEditProject?.Client_ID
              ) || null
            }
            onChange={(event, newValue) => {
              handleEditChange({
                target: {
                  name: "Client_Name",
                  value: newValue ? newValue.Org_Name : "",
                },
              });
              handleEditChange({
                target: {
                  name: "Client_ID",
                  value: newValue ? newValue.ROWID : "",
                },
              });
            }}
            options={client}
            getOptionLabel={(option) => option?.Org_Name || ""}
            isOptionEqualToValue={(option, value) =>
              option.ROWID === value?.ROWID
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Client Name"
                name="client_name"
                fullWidth
                variant="outlined"
                sx={{ marginBottom: 2 }}
              />
            )}
            noOptionsText="No clients available"
          />

          <TextField
            label="Start Date"
            name="Start_Date"
            fullWidth
            variant="outlined"
            type="date"
            value={currentEditProject?.Start_Date || ""}
            onChange={handleEditChange}
            InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="End Date"
            name="End_Date"
            fullWidth
            variant="outlined"
            type="date"
            value={currentEditProject?.End_Date || ""}
            onChange={handleEditChange}
            InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
          />

          <Autocomplete
            value={
              assignOptions.find(
                (option) => option.userID === currentEditProject?.Assigned_To_Id
              ) || null
            }
            onChange={(event, newValue) => {
              // Handle the change correctly, and ensure the newValue is not null
              handleEditChange({
                target: {
                  name: "assignedTo",
                  value: newValue?.userID || "", // Handle the case where newValue might be null
                },
              });
            }}
            options={assignOptions}
            getOptionLabel={(option) => option.username} // This will display the username in the autocomplete dropdown
            isOptionEqualToValue={(option, value) =>
              option.userID === value?.userID
            } // Avoid comparing undefined values
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assign To"
                name="assignedTo"
                fullWidth
                variant="outlined"
                sx={{ marginBottom: 2 }}
              />
            )}
          />

          <TextField
            label="Description"
            name="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={currentEditProject?.Description || ""}
            onChange={handleEditChange}
            sx={{ marginBottom: 2 }}
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
              onClick={() => handleUpdateProject(currentEditProject.ROWID)}
            >
              Submit
            </Button>
            <Button variant="outlined" color="error" onClick={handleEditCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
      <Drawer anchor="right" open={open} onClose={handleCloseDrawer}>
        <Box
          sx={{
            width: 420,
            mt: "65px",
            maxHeight: "90vh",
            overflowY: "auto",
           
          }}
        >
        
            <Box
              sx={{
                 backgroundColor: "primary.main",
                color: "#fff",
                px: 3,
                py: 2,
                display: "flex",
                justifyContent: "space-between",

                alignItems: "center",
                position: "sticky", // Sticky position for header
                top: 0, // Stick to the top
                zIndex: 1, // Ensure it stays above content
              }}
            >
              <Typography variant="h6">Project Details</Typography>
              <IconButton onClick={handleCloseDrawer} sx={{ color: "#fff" }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {isLoading ? (
              <Box px={3} py={2}>
                <Typography>Loading project details...</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {fields.map(([label, value, icon], index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 3, py: 1.5 }}>
                      <ListItemIcon sx={{ color: "primary.main" }}>
                        {icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight="bold">
                            {label}
                          </Typography>
                        }
                        secondary={
                          label === "Status" ? (
                            <Chip
                              label={value}
                              color={getStatusColor(value)}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          ) : (
                            <Typography
                              color="text.secondary"
                              sx={{
                                 whiteSpace: "pre-wrap", // allow line breaks
                                wordBreak: "break-word", // break long words
                                overflowWrap: "break-word", // fallback for older browsers
                              }}
                            >
                              {value}
                            </Typography>
                          )
                        }
                      />
                    </ListItem>
                    {index !== fields.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
        
        </Box>
      </Drawer>
      {viewproject ? (
        <ProjectTimeEntry
          theme={theme}
          handleEditInputChange={handleInputChange}
          statusOptions={statusOptions}
          handleUpdateproject={handleUpdateProject}
          viewModalOpen={viewModalOpen}
          viewproject={viewproject}
          setViewproject={setViewproject}
          handleCloseViewModal={handleCloseViewModal}
        />
      ) : (
        <div></div>
      )}

      {/* {viewproject ? (
       <ProjectTask
       theme={theme}
       viewproject={viewproject}
       taskModelOpen={taskModelOpen}
       handleCloseTaskModel={handleCloseTaskModel}  
       />
      ):(
        <div></div>
      )} */}
      {viewproject ? (
        <Task
          projectId={filterActive ? viewproject.ROWID : undefined}
          projectName={filterActive ? viewproject.Project_Name : undefined}
        />
      ) : (
        <div></div>
      )}

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
          {"Delete Project"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete project{" "}
            <strong>{projectToDelete?.name}</strong>?
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

export default Project;
