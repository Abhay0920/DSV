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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Drawer,
  MenuItem,
  alpha,
  useTheme,
  Chip,
  Autocomplete,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,
  Modal,
  Pagination,
  Snackbar,
  Alert,
} from "@mui/material";
import { FaUsers } from "react-icons/fa";
import Slide from "@mui/material/Slide";

import Skeleton from "@mui/material/Skeleton";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import EditIcon from "@mui/icons-material/Edit";
import BugReportIcon from "@mui/icons-material/BugReport";
import { Avatar } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { TimeEntry } from "./TimeEntry";
import { FaBug } from "react-icons/fa6";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmpIssue, issuesActions } from "../redux/EmpTask/EmpIssueSlice";
import { isUnitless } from "@mui/material/styles/cssUtils";
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
  console.log("projectId", projectId);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentIssue, setCurrentIssue] = useState(null);
  const [issues, setIssues] = useState([]);
  const [currUser, setCurrUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [assignModelOpen, setAssignModelOpen] = useState(false);
  const [assignIssue, setAssignIssue] = useState(null);
    const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "success",
    });

  const dispatch = useDispatch();

  const { data } = useSelector((state) => state.empIssuesReducer);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const user = JSON.parse(localStorage.getItem("currUser"));
        const userid = user.userid;
        setCurrUser(user);

        if (projectId) {
          const response = await axios.get(
            `/server/time_entry_management_application_function/projectIssues/${projectId}`
          );
          setIssues(response.data.data);
        } else {
          if (!data || (Array.isArray(data) && data.length === 0)) {
            const result = await dispatch(fetchEmpIssue(userid)).unwrap();
            setIssues(result);
          } else {
            setIssues(data);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchAllData();
  }, [dispatch, projectId, data]);

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

  const filteredissue = issues?.filter((isue) =>
    isue?.Issue_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedissue = filteredissue.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleUpdateIssue = async () => {
    console.log(currentIssue);
    const ROWID = currentIssue.id;

    const updateResponse = await axios.post(
      `/server/time_entry_management_application_function/issue/${ROWID}`,
      currentIssue
    );

    console.log("updateResponse", updateResponse);
    if (updateResponse.status === 200) {
      dispatch(issuesActions.updateIssue(updateResponse.data.data));
      handleAlert("success", "Issue updated successfully");
    }
    setCurrentIssue("");
    setEditModalOpen(false);
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentIssue((prev) => ({ ...prev, [name]: value }));
  };

  const handleAlert = (severity, message) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };


  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleEdit = (isue) => {
    setCurrentIssue(isue);
    setEditModalOpen(true);
  };

  const handleAssignModelOpen = (issue) => {
    setAssignIssue(issue);
    setAssignModelOpen(true);
  };
  function SlideTransition(props) {
     return <Slide {...props} direction="down" />;
   }
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  const handleAssign = async () => {
    console.log("issue", assignIssue);
    console.log("currUser", currUser);
    console.log("issues", issues);

    const response = await axios.post(
      "/server/time_entry_management_application_function/assignIssue/" +
        assignIssue.ROWID,
      {
        Assignee_ID: currUser.userid,
        Assignee_Name: currUser.firstName + " " + currUser.lastName,
      }
    );

    if (response.status === 200) {
      console.log("response", response);
      dispatch(fetchEmpIssue(currUser.userid));

      const updatedIssues = issues.map((item) => {
        if (item.ROWID === assignIssue.ROWID) {
          return {
            ...item,
            Assignee_ID: currUser.userid,
            Assignee_Name: `${currUser.firstName} ${currUser.lastName}`,
          };
        }
        return item;
      });
      setIssues(updatedIssues);
      setAssignModelOpen(false);
      handleAlert("success", "Issue assigned successfully");
    }
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
              flexWrap: "wrap",
              rowGap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: colors.primary,
                  width: 60,
                  height: 60,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <BugReportIcon fontSize="large" />
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  Issues
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                alignItems: "center",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <TextField
                label="Search Issues"
                variant="outlined"
                size="small"
                sx={{ width: { xs: "100%", sm: "250px" } }}
                value={searchQuery}
                onChange={handleSearch}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

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
          ) : issues?.length === 0 ? (
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

                {isLoading ? (
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
                    {paginatedissue?.map((isue) => (
                      <TableRow key={isue.ROWID}>
                        <TableCell>
                          {"I" + isue.ROWID?.substr(isue.ROWID?.length - 4)}
                        </TableCell>
                        <TableCell>{isue.Issue_name || "N/A"}</TableCell>
                        <TableCell>{isue.Reporter_Name || "N/A"}</TableCell>
                        <TableCell>
                          {isue.CREATEDTIME
                            ? isue.CREATEDTIME.split(" ")[0]
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={isue.Status || "Unknown"}
                            size="small"
                            sx={{
                              backgroundColor:
                                statusConfig[isue.Status]?.backgroundColor ||
                                "#f5f5f5",
                              color:
                                statusConfig[isue.Status]?.color || "#757575",
                              border: `1px solid ${statusConfig[isue.Status]?.borderColor || "#e0e0e0"}`,
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
                                handleAssigneeClick(e, isue.Assignee_Name || "")
                              }
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <FaUsers
                                style={{
                                  color: !isue.Assignee_Name?.trim()
                                    ? "red"
                                    : theme.palette.primary.main,
                                }}
                              />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {isue.Assignee_Name?.trim()
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
                                {!selectedAssignees?.some((a) => a.trim())
                                  ? "No Assign User Yet"
                                  : "Assigned User"}
                              </Typography>

                              {selectedAssignees
                                ?.filter((a) => a.trim())
                                .map((assignee, index) => (
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

                        <TableCell>{isue.Due_Date || "N/A"}</TableCell>

                        <TableCell>
                          {!isue.Assignee_Name?.trim() ? (
                            <IconButton
                              color="primary"
                              onClick={() => handleAssignModelOpen(isue)}
                            >
                              <AssignmentIndIcon />
                            </IconButton>
                          ) : (
                            <IconButton
                              color="primary"
                              onClick={() => handleEdit(isue)}
                            >
                              <EditIcon />
                            </IconButton>
                          )}
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

      <Dialog
        open={assignModelOpen}
        onClose={() => setAssignModelOpen(false)}
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
          Assign Issue
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to assign this issue to yourself?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setAssignModelOpen(false)}
            variant="outlined"
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            variant="contained"
            color="primary"
            autoFocus
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};
