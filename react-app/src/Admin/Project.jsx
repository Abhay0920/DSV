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

import { useDispatch, useSelector } from "react-redux";
import { fetchProjects, addProject } from "../redux/Project/ProjectSlice";
import { fetchEmployees } from "../redux/Employee/EmployeeSlice";
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

function Project({ fun }) {
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

  const [errors, setErrors] = useState({});

  // start
  const state = useSelector((state) => state.projectReducer);

  const employeeState = useSelector((state) => state.employeeReducer);
  //  console.log("employee",employeeState.data.users)
  const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(fetchEmployees())
  // }, [dispatch]);

  useEffect(() => {
    if (state && state.data) {
      // console.log("employeeState",employeeState.data)

      setProjects(state.data.data);
      const formattedAssignTo = employeeState.data.users
        .filter(
          (employee) =>
            // employee.role_details.role_name !== "Admin" &&
            employee.role_details.role_name !== "Super Admin"
        )
        .map((employee) => ({
          username: `${employee.first_name} ${employee.last_name}`,
          userID: employee.user_id,
          role: employee.role_details.role_name,
        }));

      ////console.log(formattedAssignTo);
      setAssignOptions(formattedAssignTo);
    }
  }, [state]); // Dependency array ensures effect runs when 'state' changes

  // end

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const ProjectResponse = await axios.get(
  //         "/server/time_entry_management_application_function/projects"
  //       );

  //       const EmployeeResponse = await axios.get(
  //         "/server/time_entry_management_application_function/employee"
  //       );
  //       // ////console.log("employess => ", EmployeeResponse.data.users);
  //       // ////console.log("project => ", ProjectResponse.data.data);

  //       if (EmployeeResponse.status === 200) {
  //         const formattedAssignTo = EmployeeResponse.data.users
  //           .filter(
  //             (employee) =>
  //               // employee.role_details.role_name !== "Admin" &&
  //               employee.role_details.role_name !== "Super Admin"
  //           )
  //           .map((employee) => ({
  //             username: `${employee.first_name} ${employee.last_name}`,
  //             userID: employee.user_id,
  //           }));

  //         ////console.log(formattedAssignTo);
  //         setAssignOptions(formattedAssignTo);
  //       }

  //       if (ProjectResponse.status === 200) {
  //         const formattedProjects = ProjectResponse.data.data.map(
  //           (project, index) => ({
  //             id: project.ROWID,
  //             name: project.Project_Name,
  //             status: project.Status,
  //             owner: project.Owner,
  //             ownerID: project.Owner_ID,
  //             startDate: project.Start_Date,
  //             endDate: project.End_Date,
  //             description: project.Description,
  //             assignedTo: project.Assigned_To,
  //             assignedToID: project.Assigned_To_Id,
  //           })
  //         );
  //         setProjects(formattedProjects);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching projects:", error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleEdit = (project) => {
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
        console.log("project",projectToDelete);
        const response = await axios.delete(
          `/server/time_entry_management_application_function/delete/${projectToDelete.ROWID}`
        );
        if (response.status === 200) {
          // Remove the project from the local state
        
          setProjects((prevProjects) =>
            prevProjects.filter((project) => project.ROWID !== projectToDelete.ROWID)
          );
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

  const filteredProjects = projects.filter(
    (project) =>
      // return(
      project.Project_Name &&
      project.Project_Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedProjects = filteredProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // console.log("paginatedProjects",paginatedProjects);
  // console.log("filteredProjects",filteredProjects);

  // Drawer Handlers
  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };

  const validate = () => {
    let tempErrors = {};
    if (!newProject.name || newProject.name.length < 3)
      tempErrors.name = "Project Name must be at least 3 characters.";
    if (!newProject.client_name)
      tempErrors.client_name = "Client name is Requird";
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
      const selectedClient = assignOptions.find(
        (option) => option.userID === value && option.role === "Client"
      );
      console.log("selelelele", selectedClient);
      if (selectedClient) {
        setNewProject((prev) => ({
          ...prev,
          client_name: selectedClient.username,
          clientID: selectedClient.userID,
        }));
      }
    } else {
      setNewProject((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProject = async () => {
    // try {
    //   console.log("abhay singh", newProject);

    //   const response = await axios.post(
    //     "/server/time_entry_management_application_function/projects",
    //     {
    //       Project_Name: newProject.name,
    //       Description: newProject.description,
    //       Start_Date: newProject.startDate,
    //       End_Date: newProject.endDate,
    //       Status: newProject.status,
    //       Owner: currUser.firstName + " " + currUser.lastName,
    //       Owner_Id: currUser.userid,
    //       Assigned_To: newProject.assignedTo,
    //       Assigned_To_Id: newProject.assignedToID,
    //     }
    //   );

    //   const result = response.data;
    //   ////console.log(response.data.data);

    //   if (result.success) {
    //     // Update the local state with the new project
    //     const newProjectData = {
    //       ...newProject,
    //       owner: result.data.Owner,
    //       ownerID: result.data.ownerID,
    //       id: result.data.ROWID,
    //       rowid: result.data.ROWID,
    //     };

    //     ////console.log("wqe", newProjectData);
    //     setProjects((prev) => [...prev, newProjectData]);

    //     // Reset the form
    //     setNewProject({
    //       id: "",
    //       name: "",
    //       status: "",
    //       owner: "",
    //       ownerID: "",
    //       startDate: "",
    //       endDate: "",
    //       description: "",
    //       assignedTo: "",
    //       assignedToID: "",
    //     });
    //     toggleDrawer(false);
    //     handleAlert("success", "Project added successfully");
    //   } else {
    //     handleAlert("error", result.message || "Failed to add project");
    //   }
    // } catch (error) {
    //   handleAlert("error", error.message || "Error adding project");
    // }

    try {
      console.log("Adding new project:", newProject);
      console.log("abhayproject");

      // Dispatch the AddProject action to add a new project
      await dispatch(addProject(newProject));
      // Reset new project form after adding
      setNewProject({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "",
        assignedTo: "",
        client_name: "",
      });
      await dispatch(fetchProjects());
    } catch (error) {
      console.error("Failed to add project:", error);
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
    } 
    else if (name === "Client_ID") {
      console.log("jeee");
      const selectedClient = assignOptions.find(
        (option) => option.userID === value && option.role === "Client"
      );
      console.log("selected cliend",selectedClient);
      
      if (selectedClient) {
        setCurrentEditProject((prev) => ({
          ...prev,
          client_name: selectedClient.username,
          clientID: selectedClient.userID,
        }));
      }
    }
    else {
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
          Client_Name:currentEditProject.Client_Name,
          Client_ID:currentEditProject.Client_ID
        }
      );
      if (response.status === 200) {
        const updateProject = response.data;
        setProjects((prev) =>
          prev.map((project) =>
            project.ROWID === currentEditProject.ROWID
              ? currentEditProject
              : project
          )
        );
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
    ////console.log("asd", project);
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

  const handleTaskModel = (project) => {
    console.log("hello", project);
    setTaskModelOpen(true);
  };

  const handleCloseTaskModel = () => {
    setViewproject(null);
    setTaskModelOpen(false);
  };

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
    if (validate()) {
      handleAddProject(newProject);
      toggleDrawer(false);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3,
        }}
      >
        <Typography variant="h4">Projects</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Header with Search and New Project Button */}
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
                label="Search Projects"
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
                New Project
              </Button>
            </CardContent>
          </Card>
        </Grid>

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
                    Owner
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                    Client Name
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                    AssignedTo
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

              {paginatedProjects.length === 0 ? (
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
              ) : (
                <TableBody>
                  {paginatedProjects.map((project) => (
                    <TableRow key={project.id}>
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
                      <TableCell>{project.Owner}</TableCell>
                      <TableCell>{project.Client_Name}</TableCell>
                      <TableCell>{project.Assigned_To}</TableCell>
                      <TableCell>{project.Start_Date}</TableCell>
                      <TableCell>{project.End_Date}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(project)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(project)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={() => handlefiltetActive(project)}
                        >
                          Tasks
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={() => handleViewproject(project)}
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
              marginBottom: 2,
            }}
          >
            <Typography variant="h5">Add New Project</Typography>
            <IconButton onClick={() => toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
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
            options={assignOptions.filter((option) => option.role === "Client")} // Filter clients
            getOptionLabel={(option) => option.username} // Display username in options
            isOptionEqualToValue={(option, value) =>
              option.userID === value.userID
            } // Ensure correct selection
            onChange={(event, newValue) => {
              handleInputChange({
                target: {
                  name: "client_name", // Update the client_name in the state
                  value: newValue ? newValue.username : "", // Display username
                },
              });
              handleInputChange({
                target: {
                  name: "clientID", // Assuming you need the client ID too
                  value: newValue ? newValue.userID : "",
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
                error={!!errors.client_name}
                helperText={errors.client_name}
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
            <Button variant="contained" color="primary" onClick={handleSubmit}>
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

          {console.log("current project", currentEditProject)}
          <Autocomplete
            value={
              assignOptions.find(
                (option) => option.userID === currentEditProject?.Client_ID
              ) || null
            }
            onChange={(event, newValue) => {
              handleEditChange({
                target: {
                  name: "Client_Name", // Update the client_name in the state
                  value: newValue ? newValue.username : "", // Display username
                },
              });
              handleEditChange({
                target: {
                  name: "Client_ID", // Assuming you need the client ID too
                  value: newValue ? newValue.userID : "",
                },
              });
            }}
            options={assignOptions.filter((option) => option.role === "Client")} // Filter only clients
            getOptionLabel={(option) => option.username} // Display username in the dropdown
            isOptionEqualToValue={(option, value) =>
              option.userID === value?.userID
            } // Correct comparison
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

      {viewproject ? (
        <ProjectTimeEntry
          theme={theme}
          handleEditInputChange={handleInputChange}
          projects={projects}
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
