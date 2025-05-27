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
  alpha,
  IconButton,
  TableFooter,
  TablePagination,
  Drawer,
  MenuItem,
  Modal,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import TaskIcon from "@mui/icons-material/Task";
import InfoIcon from "@mui/icons-material/Info";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import EventIcon from "@mui/icons-material/Event";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { BugReport } from "@mui/icons-material";

import Skeleton from "@mui/material/Skeleton";
import { FaProjectDiagram } from "react-icons/fa";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Avatar } from "@mui/material";
import { fetchEmpProject } from "../redux/EmpProject/EmpProjectSlice";
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
  const [assignOptions, setAssignOptions] = useState([]);
  // const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditProject, setCurrentEditProject] = useState(null);
  const [currUser, setCurrUser] = useState({});
  const [open, setOpen] = useState(false);
    const [projectDetail, setprojectdetail] = useState(null);
  
  // const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const {data :projects,isLoading} = useSelector((state) => state.empProjectReducer);
  //const employeeState = useSelector((state) => state.employeeReducer);

  const dispatch = useDispatch();
  // Drawer State
  const [newProject, setNewProject] = useState({
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

  const theme = useTheme();
  useEffect(()=>{
    const fetchAllData = async () => {
      if (!Array.isArray(projects) || projects.length === 0) {
      dispatch(fetchEmpProject())
      };
    }
    fetchAllData();
  },[dispatch]);

  

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

  const filteredProjects = projects.filter(
    (project) =>
      project.Projects.Project_Name &&
      project.Projects.Project_Name.toLowerCase().includes(searchQuery.toLowerCase())
  );
 
  const paginatedProjects = filteredProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Drawer Handlers
  const handleEditChange = (event) => {
    const { name, value } = event.target;
    //console.log("Value changed:", name, value);
    setCurrentEditProject((prev) => ({ ...prev, [name]: value }));

    if (name === "assignedTo") {
      const selectedOption = assignOptions.find(
        (option) => option.userID === value
      );

      // //console.log(selectedOption);

      if (selectedOption) {
        // Update the state with username and userID
        setCurrentEditProject((prev) => ({
          ...prev,
          assignedTo: selectedOption.username,
          assignedToID: selectedOption.userID,
        }));
      }
    } else {
      setNewProject((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlefiltetActive = (project) => {
    console.log("Project = ", project);

    navigate("/task", {
      state: { projectId: project.Projects.ROWID, projectName: project.Projects.Project_Name},
    });
    const pathname = "/tasks";
  };

  const handleShowIssue = (project)=>{
    navigate("/bug", {
      state: { projectId: project.Projects.ROWID,},
    });
  }
  const handleCloseDrawer = () => {
    setOpen(false);
  };
  const colors = {
    primary: theme.palette.primary.main,
    primaryLight: theme.palette.primary.light,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    successLight: theme.palette.success.light,
    warning: theme.palette.warning.main,
    warningLight: theme.palette.warning.light,
    error: theme.palette.error.main,
    errorLight: theme.palette.error.light,
    info: theme.palette.info.main,
    infoLight: theme.palette.info.light,
  };
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
      projectDetail?.Client_Name ?? "Internal Project",
      <BusinessIcon color="primary" />,
    ]
    ,
    ["Start Date", projectDetail?.Start_Date, <EventIcon color="primary" />],
    ["End Date", projectDetail?.End_Date, <ScheduleIcon color="primary" />],
    ["Status", projectDetail?.Status, <TrackChangesIcon color="primary" />],
    ["Owner", projectDetail?.Owner, <EmojiEventsIcon color="primary" />],
  ];
  const handleDetailDrwaer = (e, project) => {
    setOpen(true);
    console.log("name of the project", project);
    setprojectdetail(project);
  };
  return (
    <Box sx={{ padding: 3 }}>
    
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: "16px",
          background: `linear-gradient(135deg, ${colors.primary}88, ${colors.info}88)`,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="1" fill-rule="evenodd"/%3E%3C/svg%3E")',
            backgroundSize: "15px",
          }}
        />
        <CardContent sx={{ py: 4, px: 3, position: "relative" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  bgcolor: colors.primary,
                  width: 60,
                  height: 60,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <AssignmentIcon fontSize="large" />
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  Projects
                </Typography>
              </Box>
            </Box>

            <TextField
              label="Search Projects"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearch}
              sx={{ width: "40%" }}
            />
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Table */}
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
                    Project ID
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
                    Description
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
                    Action
                  </TableCell>

                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Tasks
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontWeight: "bold",
                    }}
                  >
                    Issues
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
          ) : paginatedProjects.length === 0 ? (
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
                    Project ID
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
                    Description
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
                    Action
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
                      <FaProjectDiagram
                        size={50}
                        color={theme.palette.text.secondary}
                      />
                      <Typography variant="h6" color="text.secondary">
                        No projects found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You currently don't have any projects assigned
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
                      Project Name
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Owner
                    </TableCell>

                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Start Date
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      End Date
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Tasks
                    </TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                      Issues
                    </TableCell>
                  </TableRow>
                </TableHead>

                {isLoading ? (
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
                    {paginatedProjects.map((project) => (
                      <TableRow key={project.Projects.ROWID}
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
                      onClick={(e) => handleDetailDrwaer(e, project.Projects)}
                      >
                        <TableCell>
                          {"P" + project.Projects.ROWID.substr(project.Projects.ROWID.length - 4)}
                        </TableCell>
                        <TableCell>{project.Projects.Project_Name}</TableCell>
                        <TableCell>
                          <Chip
                            label={project.Projects.Status}
                            size="small"
                            sx={{
                              backgroundColor:
                                statusConfig[project.Projects.Status]?.backgroundColor ||
                                "#f5f5f5",
                              color:
                                statusConfig[project.Projects.Status]?.color ||
                                "#757575",
                              border: `1px solid ${statusConfig[project.Projects.Status]?.borderColor || "#e0e0e0"}`,
                              fontWeight: 500,
                              fontSize: "0.75rem",
                              height: "24px",
                              "& .MuiChip-label": {
                                px: 1,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>{project.Projects.Owner}</TableCell>
                        <TableCell>{project.Projects.Start_Date}</TableCell>
                        <TableCell>{project.Projects.End_Date}</TableCell>
                        <TableCell>
                        <TaskIcon
                           fontSize="large"
                           sx={{
                             color: theme.palette.primary.main,
                             fontSize: 30,
                             cursor: "pointer",
                           }}
                            onClick={(e) => 
                            {  e.stopPropagation();
                              handlefiltetActive(project)}}
                          />
                         
                        </TableCell>
                        <TableCell>
                        <BugReport
                           fontSize="large"
                           sx={{
                             color: theme.palette.primary.main,
                             fontSize: 30,
                             cursor: "pointer",
                           }}
                            onClick={(e) => 
                            {  e.stopPropagation();
                               handleShowIssue(project)}
                              }
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
          )}
        </Grid>
      </Grid>


      <Drawer anchor="right" open={open} onClose={handleCloseDrawer}>
        <Box
          sx={{
            width: 420,
            mt: "65px",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Paper
            elevation={4}
            sx={{
              borderRadius: 0,
              height: "100%",
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
                            <Typography color="text.secondary">
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
          </Paper>
        </Box>
      </Drawer>
    </Box>
  );
}

export default Project;
