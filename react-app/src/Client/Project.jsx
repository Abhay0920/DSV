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
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Skeleton from "@mui/material/Skeleton";
import { FaProjectDiagram } from "react-icons/fa";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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

function Project() {
  const [assignOptions, setAssignOptions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditProject, setCurrentEditProject] = useState(null);
  const [currUser, setCurrUser] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // const state = useSelector((state) => state.empProjectReducer);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem("currUser");
        if (!storedUser) throw new Error("No user data found in localStorage");
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser?.userid) throw new Error("Invalid user data");

        setCurrUser(parsedUser);
        const userId = parsedUser.userid;

        console.log("User ID:", userId);

        // Fetch contact data
        const contactRes = await axios.get(
          `/server/time_entry_management_application_function/contactData/${userId}`
        );

        console.log("Contact Data:", contactRes.data.data);

        const orgId = contactRes?.data?.data?.[0]?.Client_Contact?.OrgID;
        if (!orgId)
          throw new Error("Organization ID not found in contact data");

        // Fetch project data using the orgId
        const projectRes = await axios.get(
          `/server/time_entry_management_application_function/clientProject/${orgId}`
        );

        const formattedProjects =
          projectRes?.data?.data?.map((project) => ({
            id: project?.Projects?.ROWID ?? "",
            name: project?.Projects?.Project_Name ?? "Untitled Project",
            status: project?.Projects?.Status ?? "Unknown",
            owner: project?.Projects?.Owner ?? "N/A",
            startDate: project?.Projects?.Start_Date ?? "N/A",
            endDate: project?.Projects?.End_Date ?? "N/A",
            assignedToID: project?.Projects?.Assigned_To_Id ?? "N/A",
          })) ?? [];

        console.log("Formatted Projects:", formattedProjects);
        setProjects(formattedProjects);
      } catch (error) {
        console.error("Error fetching data:", error.message || error);
        alert(
          "An error occurred while fetching project data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      project.name &&
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
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
    console.log("Project = ", project.id);

    navigate("/task", {
      state: { projectId: project.id, projectName: project.name },
    });
    const pathname = "/tasks";
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
            </CardContent>
          </Card>
        </Grid>

        {/* Table */}
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
          ) : projects.length === 0 ? (
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
                  </TableRow>
                </TableHead>

                {loading ? (
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
                      <TableRow key={project.id}>
                        <TableCell>
                          {"P" + project.id.substr(project.id.length - 4)}
                        </TableCell>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={project.status}
                            size="small"
                            sx={{
                              backgroundColor:
                                statusConfig[project.status]?.backgroundColor ||
                                "#f5f5f5",
                              color:
                                statusConfig[project.status]?.color ||
                                "#757575",
                              border: `1px solid ${statusConfig[project.status]?.borderColor || "#e0e0e0"}`,
                              fontWeight: 500,
                              fontSize: "0.75rem",
                              height: "24px",
                              "& .MuiChip-label": {
                                px: 1,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>{project.owner}</TableCell>
                        <TableCell>{project.startDate}</TableCell>
                        <TableCell>{project.endDate}</TableCell>
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
    </Box>
  );
}

export default Project;
