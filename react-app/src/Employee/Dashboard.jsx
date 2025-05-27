import React, { useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Skeleton,
  Drawer,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  IconButton,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
// import { PieChart } from '@mui/x-charts/PieChart';
import { useTheme } from "@mui/material/styles";
// import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import CloseIcon from "@mui/icons-material/Close";
import { BackHand, ColorLens } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmpProject } from "../redux/EmpProject/EmpProjectSlice";
import { fetchEmpTask } from "../redux/EmpTask/EmpTaskSlice";
import { fetchEmployees } from "../redux/Employee/EmployeeSlice";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);



const barChartData = {
  labels: ["Fristine", "FI Digital"],
  datasets: [
    {
      label: "Sales",
      data: [120000, 150000],
      backgroundColor: "rgba(135, 206, 250, 0.6)", // Sky blue color
      borderColor: "rgba(70, 130, 180, 1)", // Steel blue for contrast
      borderWidth: 2,
      borderRadius: 10, // Rounded edges for bars
      barPercentage: 0.8, // Adjust bar width
      hoverBackgroundColor: "rgba(135, 206, 250, 1)", // Full opacity on hover
      hoverBorderColor: "rgba(0, 102, 204, 1)", // Slightly darker border on hover
    },
  ],
};

const barChartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        font: {
          size: 14,
          weight: "bold",
        },
        color: "#4f4f4f", // Text color
      },
    },
    tooltip: {
      backgroundColor: "rgba(0,0,0,0.8)",
      titleFont: { size: 14 },
      bodyFont: { size: 12 },
      borderColor: "#fff",
      borderWidth: 1,
      cornerRadius: 4, // Rounded corners for tooltips
    },
  },
  scales: {
    x: {
      grid: {
        display: false, // Remove vertical grid lines
      },
      ticks: {
        font: {
          size: 12,
          weight: "bold",
        },
        color: "#4f4f4f", // Label color
      },
    },
    y: {
      grid: {
        display: false, // Remove horizontal grid lines
      },
      ticks: {
        font: {
          size: 12,
          weight: "bold",
        },
        color: "#4f4f4f", // Label color
        beginAtZero: true,
      },
    },
  },
  elements: {
    bar: {
      borderRadius: 8, // Rounded corners for bars
    },
  },
};

// Add these styles at the top of the component
const styles = {
  dashboardContainer: {
    padding: { xs: 2, sm: 3 },
    minHeight: "100vh",
  },
  cardGrid: {
    marginBottom: { xs: 2, sm: 3 },
  },
  statsCard: {
    borderRadius: 4,
    boxShadow: 3,

    transition: "box-shadow 0.3s",
    height: "100%",
    "&:hover": {
      boxShadow: 6,
      transform: "translateY(-2px)",
    },
  },
  chartCard: {
    borderRadius: 4,
    boxShadow: 3,
    "&:hover": { boxShadow: 6 },
    height: { xs: "auto", md: 400 },
    minHeight: 400,
  },
  chartContainer: {
    height: { xs: 250, sm: 300 },
    width: "100%",
    overflow: "hidden",
  },
  pieChartContainer: {
    width: "100%",
    height: { xs: 250, sm: 300 },
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  drawer: {
    "& .MuiDrawer-paper": {
      width: { xs: "100%", sm: 400 },
      padding: 0,
      background: "background.default",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    },
  },
  drawerHeader: {
    paddingTop: "80px",
    paddingLeft: "24px",
    paddingRight: "24px",
    paddingBottom: "16px",
    background: "background.paper",
    boxShadow: (theme) =>
      `0 2px 4px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)"}`,
    position: "sticky",
    top: 0,
    zIndex: 1200,
    backdropFilter: "blur(5px)",
  },
  drawerHeaderContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  drawerTitle: {
    flex: 1,
  },
  closeButton: {
    marginLeft: 2,
    color: "text.secondary",
    "&:hover": {
      backgroundColor: "action.hover",
    },
  },
  drawerContent: {
    flex: 1,
    overflowY: "auto",
  },
  drawerList: {
    padding: "16px",
    "& .MuiListItem-root": {
      background: "background.paper",
      mb: 2,
      borderRadius: 2,
      boxShadow: (theme) =>
        `0 2px 4px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)"}`,
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: (theme) =>
          `0 4px 8px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)"}`,
      },
    },
  },
  employeeAvatar: {
    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  employeeName: {
    fontWeight: 600,
    color: "text.primary",
  },
  employeeRole: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: 500,
    backgroundColor: "primary.light",
    color: "primary.main",
    marginTop: 0.5,
  },
  employeeEmail: {
    color: "text.secondary",
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    marginTop: 0.5,
  },
  projectDrawer: {
    "& .MuiDrawer-paper": {
      width: { xs: "100%", sm: 450 },
      padding: 0,
      background: "background.default",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    },
  },
  projectCard: {
    background: "background.paper",
    mb: 1,
    borderRadius: 2,
    boxShadow: (theme) =>
      `0 2px 4px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)"}`,
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: (theme) =>
        `0 4px 8px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)"}`,
    },
  },
  projectStatus: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  projectDate: {
    color: "text.secondary",
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    fontSize: "0.875rem",
  },
  projectTitle: {
    fontWeight: 600,
    color: "text.primary",
    fontSize: "1.1rem",
  },
  projectDescription: {
    color: "text.secondary",
    marginBottom: 2,
  },
  drawerItem: {
    p: 2,
    bgcolor: "background.paper",
    borderRadius: 2,
    mb: 2,
    transition: "all 0.3s ease",
    "&:hover": {
      bgcolor: "action.hover",
      transform: "translateY(-2px)",
      boxShadow: (theme) =>
        `0 4px 8px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)"}`,
    },
  },
  itemAvatar: {
    background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  itemTitle: {
    fontWeight: 600,
    color: "text.primary",
    fontSize: "1rem",
  },
  itemStatus: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: 500,
    backgroundColor: "primary.light",
    color: "black",
  },
  itemInfo: {
    color: "text.secondary",
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    mt: 0.5,
    fontSize: "0.875rem",
  },
  infoSection: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    mt: 1,
    p: 1.5,
    borderRadius: 1,
    backgroundColor: "action.hover",
  },
  internDrawerItem: {
    p: 2,
    bgcolor: "background.paper",
    borderRadius: 2,
    mb: 2,
    transition: "all 0.3s ease",
    "&:hover": {
      bgcolor: "action.hover",
      transform: "translateY(-2px)",
      boxShadow: (theme) =>
        `0 4px 8px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)"}`,
    },
  },
  internAvatar: {
    background: (theme) =>
      theme.palette.mode === "dark"
        ? "linear-gradient(45deg, #FF9800 30%, #FF5722 90%)"
        : "linear-gradient(45deg, #FFB74D 30%, #FF8A65 90%)",
    boxShadow: (theme) =>
      `0 2px 4px ${theme.palette.mode === "dark" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.2)"}`,
  },
  internName: {
    fontWeight: 600,
    color: "text.primary",
    fontSize: "1rem",
  },
  internBadge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: 500,
    backgroundColor: (theme) =>
      theme.palette.mode === "dark"
        ? "rgba(255, 152, 0, 0.2)"
        : "rgba(255, 152, 0, 0.1)",
    color: (theme) => (theme.palette.mode === "dark" ? "#FFB74D" : "#F57C00"),
    marginTop: 0.5,
  },
  internInfoSection: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    mt: 1,
    p: 1.5,
    borderRadius: 1,
    backgroundColor: (theme) =>
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.03)",
  },


};

const years = [2022, 2023, 2024, 2025];
function Dashboard() {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totaltask, settTotalTask] = useState(0);
  const [totalopen, setTotalopen] = useState(0);
  const [totalClose, setTotalClose] = useState(0);
  const [totalworking, setTotalWorking] = useState(0);
  const [totalIntern, settotalIntern] = useState(0);
  const [totalProject, settTotalProject] = useState(0);
  const [ProjectcloseCount, setProjectcloseCount] = useState(0);
  const [ProjectopenCount, setProjectopenCount] = useState(0);
  const [ProjectworkingCount, setProjectworkingCount] = useState(0);
  const [monthlyProjectData, setMonthlyProjectData] = useState({
    total: Array(12).fill(0),
    open: Array(12).fill(0),
    working: Array(12).fill(0),
    closed: Array(12).fill(0),
  });

  const [currentUserProjects, setCurrentUserProjects] = useState([]);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [taskYear,setTaskYear] = useState(new Date().getFullYear());
    const [allProjects, setAllProjects] = useState([]);
    const [userTasksByYear, setUserTasksByYear] = useState({});


  // Add loading state
  const [loading, setLoading] = useState(true);

  // Add new state for drawer and employees
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [employees, setEmployees] = useState([]);

  // Add new state for project drawer
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);

  // Add new states for active and completed project drawers
  const [activeProjectDrawerOpen, setActiveProjectDrawerOpen] = useState(false);
  const [completedProjectDrawerOpen, setCompletedProjectDrawerOpen] =
    useState(false);

    // const empProjectState = useSelector((state) => state.empProjectReducer);
  
  // const employeeState = useSelector((state) => state.employeeReducer);
  // const taskState = useSelector((state) => state.taskReducer);
  // console.log("Redux State:", taskState);
  // console.log("Project  State:", empProjectState);
   const dispatch = useDispatch();


   useEffect(()=>{
    const currentUserId = JSON.parse(localStorage.getItem("currUser"));
    const id = currentUserId.userid
     console.log("id ", id);
    dispatch(fetchEmpProject());
    dispatch(fetchEmpTask());
    dispatch(fetchEmployees());
    console.log("hellow world")
   },[dispatch])
   
   const empProjectState = useSelector((state) => state.empProjectReducer);
  
   const employeeState = useSelector((state) => state.employeeReducer);
   const taskState = useSelector((state) => state.taskReducer);
   console.log("Redux State:", taskState);
   console.log("Project  State:", empProjectState);
  
    useEffect(() => {
     

      const fetchTotalEmployees = async () => {
        const currentUserId = JSON.parse(localStorage.getItem("currUser"));
          const id = currentUserId.userid
        try {
          setLoading(true);
          
           

          const { data } = employeeState
          const projects = empProjectState;
    
          console.log("projects", projects);
          const tasks = taskState;
    
          const userProjects = projects.data.data;
    
          const userTasks = tasks.data.data.filter((task) => {
            const assignedIds = task.Assign_To_ID.split(",").map((id) =>
              id.trim()
            );
            return assignedIds.includes(currentUserId.userid.toString());
          });
    
          console.log("userProjects", userProjects);
          console.log("task", userTasks);
    
          setCurrentUserProjects(userProjects);
          settTotalTask(userTasks.length);
          settTotalProject(userProjects.length);
    
          const closeCount = userTasks.filter(
            (task) => task.Status === "Completed"
          ).length;
          const openCount = userTasks.filter(
            (task) => task.Status === "Pending"
          ).length;
          const workingCount = userTasks.filter(
            (task) => task.Status === "In Progress"
          ).length;
    
          const ProjectcloseCount = userProjects.filter(
            (project) => project.Projects.Status === "Close"
          ).length;
          const ProjectopenCount = userProjects.filter(
            (project) => project.Projects.Status === "Open"
          ).length;
          const ProjectworkingCount = userProjects.filter(
            (project) => project.Projects.Status === "Work In Process"
          ).length;
    
          setTotalClose(closeCount);
          setTotalopen(openCount);
          setTotalWorking(workingCount);
          setProjectcloseCount(ProjectcloseCount);
          setProjectopenCount(ProjectopenCount);
          setProjectworkingCount(ProjectworkingCount);
    
          const monthlyData = {
            total: Array(12).fill(0),
            open: Array(12).fill(0),
            working: Array(12).fill(0),
            closed: Array(12).fill(0),
          };
    
          userProjects.forEach((project) => {
            const startDate = new Date(project.Projects.Start_Date);
            const month = startDate.getMonth();
    
            monthlyData.total[month]++;
    
            switch (project.Projects.Status) {
              case "Open":
                monthlyData.open[month]++;
                break;
              case "Work In Process":
                monthlyData.working[month]++;
                break;
              case "Close":
                monthlyData.closed[month]++;
                break;
            }
          });
    
          setMonthlyProjectData(monthlyData);
    
          const appUsers = data?.users?.filter(
            (user) => user.role_details.role_name !== "Super Admin"
          );
    
          const interns = data?.users?.filter(
            (user) => user.role_details.role_name === "Interns"
          );
    
          setEmployees(appUsers);
          setTotalEmployees(appUsers.length);
          settotalIntern(interns.length);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };
    
      fetchTotalEmployees();
    }, [employeeState,taskState,empProjectState]); // Re-run effect when selectedYear changes
    
     console.log("Redux State:", empProjectState);
    useEffect(()=>{
      const userProject = empProjectState?.data?.data;
      console.log("userProject",userProject)
      const userProjects = userProject?.filter((project) => {
        const startDate = new Date(project.Projects.Start_Date);
        return startDate.getFullYear() === selectedYear; // Filter by selected year
      });

    

      const monthlyData = {
        total: Array(12).fill(0),
        open: Array(12).fill(0),
        working: Array(12).fill(0),
        closed: Array(12).fill(0),
      };

      userProjects?.forEach((project) => {
        const startDate = new Date(project.Projects.Start_Date);
        const month = startDate.getMonth();

        monthlyData.total[month]++;

        switch (project.Projects.Status) {
          case "Open":
            monthlyData.open[month]++;
            break;
          case "Work In Process":
            monthlyData.working[month]++;
            break;
          case "Close":
            monthlyData.closed[month]++;
            break;
        }
      });

      setMonthlyProjectData(monthlyData);

    },[selectedYear])

    useEffect(() => {
      const currentUserId = JSON.parse(localStorage.getItem("currUser"));
    
      try {
        if (!taskState?.data?.data) return;
    
        const tasks = taskState.data.data;
    
        // Filter tasks assigned to the current user
        const userTasks = tasks.filter((task) => {
          const assignedIds = task.Assign_To_ID.split(",").map((id) => id.trim());
          return assignedIds.includes(currentUserId.userid.toString());
        });
     
    
        // Group tasks by year
        const groupedTasks = {};
        userTasks.forEach((task) => {
          // if (!task.Due_Date) return; // Skip if Due_Date is missing
    
          const taskYear = new Date(task.End_Date).getFullYear();
         console.log("bbe",taskYear);
          // if (isNaN(taskYear)) {
          //   console.error("Invalid Due_Date found:", task.Due_Date, "in task:", task);
          //   return; // Skip invalid dates
          // }
    
          if (!groupedTasks[taskYear]) {
            groupedTasks[taskYear] = { close: 0, open: 0, working: 0, total: 0 };
          }
    
          if (task.Status === "Completed") groupedTasks[taskYear].close++;
          else if (task.Status === "Pending") groupedTasks[taskYear].open++;
          else if (task.Status === "In Progress") groupedTasks[taskYear].working++;
    
          groupedTasks[taskYear].total++;
        });
    
        console.log("Available Years in userTasksByYear:", Object.keys(groupedTasks).map(Number));
        setUserTasksByYear(groupedTasks);
      } catch (error) {
        console.log("Error found", error);
      }
    }, [taskState]);
     // Runs when `taskState` changes
    
    useEffect(() => {
    
    
      if (userTasksByYear[taskYear]) {
        setTotalClose(userTasksByYear[taskYear].close || 0);
        setTotalopen(userTasksByYear[taskYear].open || 0);
        setTotalWorking(userTasksByYear[taskYear].working || 0);
        settTotalTask(userTasksByYear[taskYear].total || 0);
      } else {
        setTotalClose(0);
        setTotalopen(0);
        settTotalTask(0);
        
      }
    }, [taskYear, userTasksByYear]);
    
    
    
    
  // const theme = createTheme({
  //   palette: {
  //     mode: "light", // Set light mode by default
  //   },
  // });

  const cardData = [
    {
      title: "Total Employees",
      value: totalEmployees,
      description: "",
      icon: <PeopleAltIcon fontSize="large" sx={{ color: "green",paddingBottom: '50px'
       }} />,
    },
    {
      title: "My Total Projects",
      value: totalProject,
      description: "",
      icon: <AssignmentIcon fontSize="large" sx={{ color: "gold" ,paddingBottom: '50px'}} />,
    },
    {
      title: "My Active Projects",
      value: ProjectworkingCount,
      description: "",
      icon: <PersonAddAltIcon fontSize="large" sx={{ color: "orange" ,paddingBottom: '50px'}} />,
    },
    {
      title: "My Completed Projects",
      value: ProjectcloseCount,
      description: "",
      icon: <PersonOutlineIcon fontSize="large" sx={{ color: "blue" ,paddingBottom: '50px'}} />,
    },
  ];

  const PiechartValue = [
    { id: 0, value: Number(totaltask) || 0, label: "Total", color: "#2196f3" },
    { id: 1, value: Number(totalClose) || 0, label: "Completed", color: "#4caf50" },
    { id: 2, value: Number(totalopen) || 0, label: "Pending", color: "#ff9800" },
    { id: 3, value: Number(totalworking) || 0, label: "In Progress", color: "#f44336" },
  ];
  

  const theme = createTheme();

  // Update handleCardClick to handle all drawer cases
  const handleCardClick = (title) => {
    if (title === "Total Employees") {
      setDrawerOpen(true);
    } else if (title === "My Total Projects") {
      setProjectDrawerOpen(true);
    } else if (title === "My Active Projects") {
      setActiveProjectDrawerOpen(true);
    } else if (title === "My Completed Projects") {
      setCompletedProjectDrawerOpen(true);
    }
  };

  // const handleYearChange = (event) => {
  //   setYear(event.target.value);
  // };

  return (
    <Box sx={styles.dashboardContainer}>
      <Typography variant="h4" gutterBottom sx={{ mb: { xs: 2, sm: 3 } }}>
        Dashboard
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={styles.cardGrid}>
        {loading
          ? // Skeleton for cards
            [...Array(4)].map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={styles.statsCard}>
                  <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item>
                        <Skeleton variant="circular" width={40} height={40} />
                      </Grid>
                      <Grid item xs>
                        <Skeleton variant="text" width="80%" height={24} />
                        <Skeleton variant="text" width="60%" height={36} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))
          : cardData.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={styles.statsCard}>
                  <CardActionArea onClick={() => handleCardClick(card.title)}>
                    <CardContent>
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item>{card.icon}</Grid>
                        <Grid item xs>
                          <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                          >
                            {card.title}
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: "bold",
                              my: 1,
                              fontSize: { xs: "1.5rem", sm: "2rem" },
                            }}
                          >
                            {card.value}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
      </Grid>

      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: { xs: 2, sm: 4 } }}>
      <Grid item xs={12} md={8}>
      <Card sx={{ padding: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
              My Project Analytics ({selectedYear})
            </Typography>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                label="Year"
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {loading ? (
            <Box sx={{ height: 280 }}>
              <Skeleton variant="rectangular" width="100%" height={280} animation="wave" />
            </Box>
          ) : (
            <Box sx={{ height: 280 }}>
              <BarChart
                xAxis={[
                  { scaleType: "band", data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] },
                ]}
                yAxis={[
                  { scaleType: "linear", min: 0, max: Math.max(...monthlyProjectData.total, 5) },
                ]}
                series={[
                  { data: monthlyProjectData.total, label: "Total Projects", color: "#2196f3" },
                  { data: monthlyProjectData.open, label: "Open Projects", color: "#4caf50" },
                  { data: monthlyProjectData.working, label: "Working Projects", color: "#ff9800" },
                  { data: monthlyProjectData.closed, label: "Closed Projects", color: "#f44336" },
                ]}
                height={280}
                legend={{ position: "top" }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={styles.chartCard}>
            <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
              My Task Report 
            </Typography>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={taskYear}
                onChange={(e) => {
                  console.log("Selected Year:", e.target.value); // Debug log
                  setTaskYear(Number(e.target.value))
                }}
                label="Year"
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
              
              <Divider sx={{ mb: 2 }} />
              {loading ? (
                <Box sx={styles.pieChartContainer}>
                  <Skeleton
                    variant="circular"
                    width={280}
                    height={280}
                    animation="wave"
                    sx={{
                      animation: "pulse 1.5s ease-in-out infinite",
                      "@keyframes pulse": {
                        "0%": { opacity: 1 },
                        "50%": { opacity: 0.4 },
                        "100%": { opacity: 1 },
                      },
                    }}
                  />
                </Box>
              ) : (
                <Box
                  sx={styles.pieChartContainer}
                  style={{ position: "relative", height: 280 }}
                >
                  <PieChart
                    series={[
                      {
                        data: PiechartValue,
                        highlightScope: { fade: "global", highlight: "item" },
                        innerRadius: 60,
                        paddingAngle: 2,
                        cornerRadius: 5,
                        startAngle: -90,
                        endAngle: 270,
                      },
                    ]}
                    slotProps={{
                      legend: {
                        direction: "row",
                        position: {
                          vertical: "bottom",
                          horizontal: "middle",
                        },
                        padding: { xs: 10, sm: 20 , top: 20},
                        itemMarkWidth: 10,
                        itemMarkHeight: 10,
                        markGap: 5,
                        itemGap: 10,
                        
                      },
                    }}
                    height={280}
                    margin={{
                      left: 20,
                      right: 20,
                      top: 20,
                      bottom: 55,
                    }}
                  />
                  {/* Centered Text for Total Tasks */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontSize: "18px",
                      fontWeight: "bold",
                    }}
                  >
                    <Typography>{totaltask} Tasks</Typography>
                  </div>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Project Drawer */}
     <Drawer
  anchor="right"
  open={projectDrawerOpen}
  onClose={() => setProjectDrawerOpen(false)}
  sx={styles.projectDrawer}
>
  <Box
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      bgcolor: "background.default",
      position: "relative",
    }}
  >
    <Box sx={styles.drawerHeader}>
      <Box sx={styles.drawerHeaderContent}>
        <Box sx={styles.drawerTitle}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
            My Project Details 
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Projects: {currentUserProjects.length}
          </Typography>
        </Box>
        <IconButton
          onClick={() => setProjectDrawerOpen(false)}
          sx={styles.closeButton}
          aria-label="close drawer"
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>

    <Box sx={styles.drawerContent}>
      {currentUserProjects.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: "center", mt: 3 }}>
          No projects available
        </Typography>
      ) : (
        <List sx={styles.drawerList}>
          {currentUserProjects.map((project, index) => (
            <Box key={index} sx={styles.drawerItem}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography sx={styles.itemTitle}>
                    {project.Projects.Project_Name}
                  </Typography>
                  <Typography
                    sx={{
                      ...styles.itemStatus,
                      backgroundColor: (theme) =>
                        project.Projects.Status === "Open"
                          ? theme.palette.info.light
                          : project.Projects.Status === "Work In Process"
                          ? theme.palette.warning.light
                          : theme.palette.success.light,
                      color: "white",
                    }}
                  >
                    {project.Projects.Status}
                  </Typography>
                </Box>

                <Typography sx={{ ...styles.itemInfo, mt: 1 }}>
                  {project.Projects.Description || "No description available"}
                </Typography>

                <Box sx={styles.infoSection}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={styles.itemInfo}>
                      <CalendarTodayIcon sx={{ fontSize: 16 }} />
                      Start: {new Date(project.Projects.Start_Date).toLocaleDateString()}
                    </Typography>
                    <Typography sx={styles.itemInfo}>
                      <EventIcon sx={{ fontSize: 16 }} />
                      End: {new Date(project.Projects.End_Date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography sx={styles.itemInfo}>
                    <PersonIcon sx={{ fontSize: 16 }} />
                    Owner: {project.Projects.Owner || "N/A"}
                  </Typography>
                </Box>
              </CardContent>
            </Box>
          ))}
        </List>
      )}
    </Box>
  </Box>
</Drawer>


     

<Drawer
  anchor="right"
  open={activeProjectDrawerOpen}
  onClose={() => setActiveProjectDrawerOpen(false)}
  sx={styles.projectDrawer}
>
  <Box
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      bgcolor: "background.default",
      position: "relative",
    }}
  >
    <Box sx={styles.drawerHeader}>
      <Box sx={styles.drawerHeaderContent}>
        <Box sx={styles.drawerTitle}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            My Active Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Projects: {ProjectworkingCount}
            
          </Typography>
        </Box>
        <IconButton
          onClick={() => setActiveProjectDrawerOpen(false)}
          sx={styles.closeButton}
          aria-label="close drawer"
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>

    <Box sx={styles.drawerContent}>
      {currentUserProjects.filter((project) => project.Projects.Status === "Work In Process").length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: "center", mt: 3 }}>
          No active task
        </Typography>
      ) : (
        <List sx={styles.drawerList}>
          {currentUserProjects
            .filter((project) => project.Projects.Status === "Work In Process")
            .map((project, index) => (
              <Box key={index} sx={styles.drawerItem}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography sx={styles.itemTitle}>
                      {project.Projects.Project_Name}
                    </Typography>
                    <Typography
                      sx={{
                        ...styles.itemStatus,
                        backgroundColor: (theme) =>
                          project.Projects.Status === "Open"
                            ? theme.palette.info.light
                            : project.Projects.Status === "Work In Process"
                              ? theme.palette.warning.light
                              : theme.palette.success.light,
                        color: "white",
                      }}
                    >
                      {project.Projects.Status}
                    </Typography>
                  </Box>

                  <Typography sx={{ ...styles.itemInfo, mt: 1 }}>
                    {project.Projects.Description || "No description available"}
                  </Typography>

                  <Box sx={styles.infoSection}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography sx={styles.itemInfo}>
                        <CalendarTodayIcon sx={{ fontSize: 16 }} />
                        Start: {new Date(project.Projects.Start_Date).toLocaleDateString()}
                      </Typography>
                      <Typography sx={styles.itemInfo}>
                        <EventIcon sx={{ fontSize: 16 }} />
                        End: {new Date(project.Projects.End_Date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography sx={styles.itemInfo}>
                      <PersonIcon sx={{ fontSize: 16 }} />
                      Owner: {project.Projects.Owner || "N/A"}
                    </Typography>
                  </Box>
                </CardContent>
              </Box>
            ))}
        </List>
      )}
    </Box>
  </Box>
</Drawer>


    <Drawer
  anchor="right"
  open={completedProjectDrawerOpen}
  onClose={() => setCompletedProjectDrawerOpen(false)}
  sx={styles.projectDrawer}
>
  <Box
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      bgcolor: "background.default",
      position: "relative",
    }}
  >
    <Box sx={styles.drawerHeader}>
      <Box sx={styles.drawerHeaderContent}>
        <Box sx={styles.drawerTitle}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            Completed Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Completed: {ProjectcloseCount}
          </Typography>
        </Box>
        <IconButton
          onClick={() => setCompletedProjectDrawerOpen(false)}
          sx={styles.closeButton}
          aria-label="close drawer"
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>

    <Box sx={styles.drawerContent}>
      {currentUserProjects.filter(project => project.Projects.Status === "Close").length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: "center", mt: 3 }}>
          No completed task
        </Typography>
      ) : (
        <List sx={styles.drawerList}>
          {currentUserProjects
            .filter(project => project.Projects.Status === "Close")
            .map((project, index) => (
              <Box key={index} sx={styles.drawerItem}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography sx={styles.itemTitle}>{project.Projects.Project_Name}</Typography>
                    <Typography
                      sx={{
                        ...styles.itemStatus,
                        backgroundColor: "success.light",
                        color: "white",
                      }}
                    >
                      Completed
                    </Typography>
                  </Box>

                  <Typography sx={{ ...styles.itemInfo, mt: 1 }}>
                    {project.Projects.Description}
                  </Typography>

                  <Box sx={styles.infoSection}>
                    <Typography sx={styles.itemInfo}>
                      <CalendarTodayIcon sx={{ fontSize: 16 }} />
                      Started: {new Date(project.Projects.Start_Date).toLocaleDateString()}
                    </Typography>
                    <Typography sx={styles.itemInfo}>
                      <EventIcon sx={{ fontSize: 16 }} />
                      Completed: {new Date(project.Projects.End_Date).toLocaleDateString()}
                    </Typography>
                    <Typography sx={styles.itemInfo}>
                      <PersonIcon sx={{ fontSize: 16 }} />
                      Owner: {project.Projects.Owner}
                    </Typography>
                  </Box>
                </CardContent>
              </Box>
            ))}
        </List>
      )}
    </Box>
  </Box>
</Drawer>



<Drawer
  anchor="right"
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  sx={styles.drawer}
>
  <Box
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      bgcolor: "background.default",
      position: "relative",
    }}
  >
    <Box sx={styles.drawerHeader}>
      <Box sx={styles.drawerHeaderContent}>
        <Box sx={styles.drawerTitle}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            Employee List
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Employees: {employees.length}
          </Typography>
        </Box>
        <IconButton
          onClick={() => setDrawerOpen(false)}
          sx={styles.closeButton}
          aria-label="close drawer"
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>

    <Box sx={styles.drawerContent}>
      <List sx={styles.drawerList}>
        {employees.map((employee) => (
          <ListItem key={employee.id} sx={styles.drawerItem}>
            <ListItemAvatar>
              <Avatar sx={styles.itemAvatar}>
                {`${employee.first_name[0]}${employee.last_name[0]}`}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography sx={styles.itemTitle}>
                  {`${employee.first_name} ${employee.last_name}`}
                </Typography>
              }
              secondary={
                <Box>
                  <Typography component="span" sx={styles.itemStatus}>
                    {employee.role_details.role_name}
                  </Typography>
                  <Typography sx={styles.itemInfo}>
                    <EmailIcon sx={{ fontSize: 16 }} />
                    {employee.email_id}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  </Box>
</Drawer>


    </Box>
  );
}

export default Dashboard;
