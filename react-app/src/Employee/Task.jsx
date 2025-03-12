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
  Modal,
  useTheme,
  Chip,
} from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { TimeEntry } from "./TimeEntry";
import { FaTasks } from "react-icons/fa";

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

function Task() {
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
  const [loading, setLoading] = useState(true);

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
  const [currUser, setCurrUser] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("currUser"));
        setCurrUser(user);
        const userid = user.userid;
        const TaskResponse = await axios.get(
          `/server/time_entry_management_application_function/tasks/employee/${user.userid}`
        );

        //console.log(`TaskResponse`, TaskResponse.data.data);
        const ProjectResponse = await axios.get(
          "/server/time_entry_management_application_function/projects"
        );
        const tasksFromResponse = TaskResponse.data.data.map((item) => ({
          id: item.ROWID,
          taskid: item.ROWID,
          name: item.Task_Name,
          projectId: item.Project_ID,
          project_name: item.Project_Name,
          assignTo: item.Assign_To,
          assignToID: item.Assign_To_ID,
          status: item.Status,
          startDate: item.Start_Date,
          endDate: item.End_Date,
          description: item.Description,
        }));
        setTasks(tasksFromResponse);
        const filteredProjects = ProjectResponse.data.data.filter(
          (project) => project.Assigned_To_Id === userid
        );
        setProjects(filteredProjects);
      } catch (error) {
        console.error("Error fetching data:", error);
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "project") {
      const selectedOption = projects.find((option) => option.ROWID === value);
      //console.log(selectedOption);

      if (selectedOption) {
        setNewTask((prev) => ({
          ...prev,
          project_name: selectedOption.Project_Name,
          projectId: selectedOption.ROWID,
        }));
      }
    } else if (name === "associated") {
      const selectedOption = assignOptions.find(
        (option) => option.userID === value
      );

      if (selectedOption) {
        setNewTask((prev) => ({
          ...prev,
          assignTo: selectedOption.username,
          assignToID: selectedOption.userID,
        }));
      }
    } else {
      setNewTask((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateTask = async () => {
    //console.log(currentTask);
    const ROWID = currentTask.id;
    const updateResponse = await axios.post(
      `/server/time_entry_management_application_function/tasks/${ROWID}`,
      {
        Status: currentTask.status,
        Description: currentTask.description,
        Assign_To: currentTask.assignTo,
        Assign_To_ID: currentTask.assignToID,
        ProjectID: currentTask.project,
        Project_Name: currentTask.project_name,
        Task_Name: currentTask.name,
        Start_Date: currentTask.startDate,
        End_Date: currentTask.endDate,
      }
    );

    setTasks((prev) =>
      prev.map((task) => (task.id === currentTask.id ? currentTask : task))
    );
    setCurrentTask("");
    setEditModalOpen(false);
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
      const selectedOption = assignOptions.find(
        (option) => option.userID === value
      );

      if (selectedOption) {
        setCurrentTask((prev) => ({
          ...prev,
          assignTo: selectedOption.username,
          assignToID: selectedOption.userID,
        }));
      }
    } else {
      setCurrentTask((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleViewTask = (task) => {
    setViewTask(task);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewTask(null);
    setViewModalOpen(false);
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
        <Typography variant="h4">Tasks</Typography>
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
                  label="Search Tasks"
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={handleSearch}
                  sx={{ width: "40%" }}
                />
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
                      <FaTasks size={50} color={theme.palette.text.secondary} />
                      <Typography variant="h6" color="text.secondary">
                        No tasks found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You currently don't have any tasks assigned
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
                      Project
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
                      Time Entry
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
                ) : paginatedTasks.length === 0 ? (
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
                    {paginatedTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          {"T" + task.id.substr(task.id.length - 4)}
                        </TableCell>
                        <TableCell>{task.name}</TableCell>
                        <TableCell>{task.project_name}</TableCell>
                        <TableCell>
                          <Chip
                            label={task.status}
                            size="small"
                            sx={{
                              backgroundColor:
                                statusConfig[task.status]?.backgroundColor ||
                                "#f5f5f5",
                              color:
                                statusConfig[task.status]?.color || "#757575",
                              border: `1px solid ${statusConfig[task.status]?.borderColor || "#e0e0e0"}`,
                              fontWeight: 500,
                              fontSize: "0.75rem",
                              height: "24px",
                              "& .MuiChip-label": {
                                px: 1,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>{task.startDate}</TableCell>
                        <TableCell>{task.endDate}</TableCell>
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
    </Box>
  );
}

export default Task;
