import React, { useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  createTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Skeleton,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
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
import AssignmentIcon from "@mui/icons-material/Assignment";
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
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventIcon from "@mui/icons-material/Event";
import BusinessIcon from "@mui/icons-material/Business";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  const [year, setYear] = useState(new Date().getFullYear());
  const [allProjects, setAllProjects] = useState([]);


  const [currentUserProjects, setCurrentUserProjects] = useState([]);
  const [employeeDrawerOpen, setEmployeeDrawerOpen] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);
  const [projectList, setProjectList] = useState([]);
  const [completedProjectDrawerOpen, setCompletedProjectDrawerOpen] =
    useState(false);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [internDrawerOpen, setInternDrawerOpen] = useState(false);
  const [internList, setInternList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const[projectLength,setProjectLength] = useState(0);

  useEffect(() => {
    const fetchTotalEmployees = async () => {
      try {
        setIsLoading(true);
  
        // Fetching the data from the server
        const { data } = await axios.get("/server/time_entry_management_application_function/employee");
        const projects = await axios.get("/server/time_entry_management_application_function/projects");
        const tasks = await axios.get("/server/time_entry_management_application_function/tasks");
  
       
        setProjectLength(projects.data.data.length);

        const allProjects = projects.data.data;
        const allTasks = tasks.data.data;
  
        // Filter projects based on the selected year
        const filteredProjects = allProjects.filter((project) => {
          const startDate = new Date(project.Start_Date);
          return startDate.getFullYear() === year;  // Only include projects that match the selected year
        });
  
        setAllProjects(filteredProjects);
        setCurrentUserProjects(filteredProjects);
  
        const interns = data.users.filter((user) => user.role_details.role_name === "Interns");
  
        setTotalEmployees(data.users.length);
        settotalIntern(interns.length);
        settTotalTask(allTasks.length);
        settTotalProject(filteredProjects.length);
  
        const closeCount = allTasks.filter((task) => task.Status === "Completed").length;
        const openCount = allTasks.filter((task) => task.Status === "Pending").length;
        const workingCount = allTasks.filter((task) => task.Status === "In Progress").length;
  
        const projectCloseCount = filteredProjects.filter((project) => project.Status === "Close").length;
        const projectOpenCount = filteredProjects.filter((project) => project.Status === "Open").length;
        const projectWorkingCount = filteredProjects.filter((project) => project.Status === "Work In Process").length;
  
        setTotalClose(closeCount);
        setTotalopen(openCount);
        setTotalWorking(workingCount);
        setProjectcloseCount(projectCloseCount);
        setProjectopenCount(projectOpenCount);
        setProjectworkingCount(projectWorkingCount);
  
        // Prepare monthly data for the selected year
        const monthlyData = {
          total: Array(12).fill(0),
          open: Array(12).fill(0),
          working: Array(12).fill(0),
          closed: Array(12).fill(0),
        };
  
        filteredProjects.forEach((project) => {
          const startDate = new Date(project.Start_Date);
          const month = startDate.getMonth();
  
          monthlyData.total[month]++;
  
          switch (project.Status) {
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
  
        setEmployeeList(
          data.users.map((user) => ({
            name: `${user.first_name} ${user.last_name}`,
            role: user.role_details.role_name,
            email: user.email_id,
          }))
        );
  
        const formattedProjects = filteredProjects.map((project) => ({
          name: project.Project_Name,
          status: project.Status,
          startDate: new Date(project.Start_Date).toLocaleDateString(),
          endDate: new Date(project.End_Date).toLocaleDateString(),
          owner: project.Owner,
          description: project.Description || "No description available",
        }));
  
        setProjectList(formattedProjects);
  
        const completedProjectsList = filteredProjects
          .filter((project) => project.Status === "Close")
          .map((project) => ({
            name: project.Project_Name,
            status: project.Status,
            startDate: new Date(project.Start_Date).toLocaleDateString(),
            endDate: new Date(project.End_Date).toLocaleDateString(),
            owner: project.Owner,
            description: project.Description || "No description available",
            completedDate: new Date(project.End_Date).toLocaleDateString(),
          }));
  
        setCompletedProjects(completedProjectsList);
  
        const internsList = data.users
          .filter((user) => user.role_details.role_name === "Interns")
          .map((user) => ({
            name: `${user.first_name} ${user.last_name}`,
            email: user.email_id,
            department: user.department || "Not Assigned",
            joiningDate: new Date(user.created_at).toLocaleDateString(),
          }));
  
        setInternList(internsList);
  
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchTotalEmployees();
  
  }, [year]);  // Refetch data whenever the year changes
  
 

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
      icon: <PeopleAltIcon fontSize="large" sx={{ color: "green" }} />,
      
      
    },
    {
      title: "Total Interns",
      value: totalIntern,
      description: "",
      icon: <PeopleAltIcon fontSize="large" sx={{ color: "green" }} />,
    },
    {
      title: "Total Projects",
      value: projectLength,
      description: "",
      icon: <AssignmentIcon fontSize="large" sx={{ color: "gold" }} />,
    },
    {
      title: "Completed Projects",
      value: ProjectcloseCount,
      description: "",
      icon: <PersonOutlineIcon fontSize="large" sx={{ color: "blue" }} />,
    },
  ];

  const PiechartValue = [
    { id: 0, value: Number(totaltask) || 0, label: "Total", color: "#2196f3" },
    {
      id: 1,
      value: Number(totalClose) || 0,
      label: "Completed",
      color: "#4caf50",
    },
    {
      id: 2,
      value: Number(totalopen) || 0,
      label: "Pending",
      color: "#ff9800",
    },
    {
      id: 3,
      value: Number(totalworking) || 0,
      label: "In Progress",
      color: "#f44336",
    },
  ];

  const theme = createTheme();

  const handleEmployeeCardClick = () => {
    setEmployeeDrawerOpen(true);
  };

  const handleProjectCardClick = () => {
    setProjectDrawerOpen(true);
  };

  const handleCompletedProjectsClick = () => {
    setCompletedProjectDrawerOpen(true);
  };

  const handleInternCardClick = () => {
    setInternDrawerOpen(true);
  };


  const handleYearChange = (event) => {
    setYear(event.target.value);
  };
  return (
   
   
      <Box sx={styles.dashboardContainer} >
        <Typography variant="h4" gutterBottom sx={{ mb: {  xs: 2, sm: 3 } }} >
          Dashboard
        </Typography>
       
        {isLoading ? (
  <Grid container spacing={{ xs: 2, sm: 3 }} sx={styles.cardGrid}>
    {[...Array(4)].map((_, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <Card sx={styles.statsCard}>
          <CardContent>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Skeleton variant="circular" width={40} height={40} />
              </Grid>
              <Grid item xs>
                <Skeleton variant="text" width="80%" height={30} animation="wave" />
                <Skeleton variant="text" width="60%" height={40} animation="wave" />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
) : (
  <Grid container spacing={{ xs: 2, sm: 3 }} sx={styles.cardGrid}>
    {cardData.map((card, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <Card
          sx={{
            ...styles.statsCard,
            cursor:
              ["Total Employees", "Total Projects", "Completed Projects", "Total Interns"].includes(card.title)
                ? "pointer"
                : "default",
          }}
          onClick={() => {
            if (card.title === "Total Employees") {
              handleEmployeeCardClick();
            } else if (card.title === "Total Projects") {
              handleProjectCardClick();
            } else if (card.title === "Completed Projects") {
              handleCompletedProjectsClick();
            } else if (card.title === "Total Interns") {
              handleInternCardClick();
            }
          }}
        >
          <CardActionArea>
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
)}



<Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: { xs: 2, sm: 4 } }}>
  {/* Project Analytics Chart */}
  
  <Grid item xs={12} md={8}>
  <Card sx={{ boxShadow: 3 }}>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
          Project Analytics ({year})
        </Typography>
        <FormControl sx={{ minWidth: 100 }}>
  <InputLabel>Year</InputLabel>
  <Select
    value={year}
    label="Year"
    onChange={handleYearChange}
    size="small"
  >
    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((yr) => (
      <MenuItem key={yr} value={yr}>
        {yr}
      </MenuItem>
    ))}
  </Select>
</FormControl>

      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ position: "relative", height: 280 }}>
        {isLoading ? (
          <Skeleton variant="rectangular" width="100%" height={280} animation="wave" />
        ) : (
          <BarChart
            xAxis={[
              {
                scaleType: "band",
                data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                tickLabelStyle: { fontSize: 11 },
              },
            ]}
            yAxis={[
              {
                scaleType: "linear",
                tickMinStep: 1,
                min: 0,
                max: Math.max(Math.ceil(Math.max(...monthlyProjectData.total))),
                ticks: [0, 1, 2, 3, 4].concat(
                  Array.from({
                    length: Math.ceil(Math.max(...monthlyProjectData.total)) - 4,
                  }, (_, i) => i + 5)
                ),
                tickLabelStyle: { fontSize: 11 },
              },
            ]}
            series={[
              { data: monthlyProjectData.total, label: "Total Projects", color: "#2196f3" },
              { data: monthlyProjectData.open, label: "Open Projects", color: "#4caf50" },
              { data: monthlyProjectData.working, label: "Working Projects", color: "#ff9800" },
              { data: monthlyProjectData.closed, label: "Closed Projects", color: "#f44336" },
            ]}
            height={280}
            margin={{ left: 40, right: 40, top: 40, bottom: 40 }}
            legend={{
              hidden: false,
              position: "top",
              padding: { xs: 10, sm: 20 },
            }}
          />
        )}
      </Box>
    </CardContent>
  </Card>
</Grid>


  {/* Task Report Pie Chart */}
  <Grid item xs={12} md={4}>
    <Card sx={styles.chartCard}>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
        >
          Task Report Status
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={styles.pieChartContainer} style={{ position: "relative", height: 280 }}>
          {isLoading ? (
            <Skeleton variant="circular" width={200} height={200} animation="wave" sx={{ mx: "auto" }} />
          ) : (
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
                  // hidden:true
                  direction: "row",
                  position: { vertical: "bottom", horizontal: "middle" },
                  padding: { xs: 10, sm: 20 },
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
                bottom: 40,
              }}
            />
          )}

          {/* Centered Text for Total Tasks */}
          {!isLoading && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "18px",
                fontWeight: "bold",
                color: "text.secondary",
              }}
            >
              {totaltask} Tasks
            </div>
          )}
        </Box>
      </CardContent>
    </Card>
  </Grid>
</Grid>


        <Drawer
          anchor="right"
          open={employeeDrawerOpen}
          onClose={() => setEmployeeDrawerOpen(false)}
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
                    Total Employees: {employeeList.length}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => setEmployeeDrawerOpen(false)}
                  sx={styles.closeButton}
                  aria-label="close drawer"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            <Box sx={styles.drawerContent}>
              <List sx={styles.drawerList}>
                {employeeList.map((employee, index) => (
                  <ListItem key={index} sx={styles.drawerItem}>
                    <ListItemAvatar>
                      <Avatar sx={styles.itemAvatar}>
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography sx={styles.itemTitle}>
                          {employee.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography component="span" sx={styles.itemStatus}>
                            {employee.role}
                          </Typography>
                          <Typography sx={styles.itemInfo}>
                            <EmailIcon sx={{ fontSize: 16 }} />
                            {employee.email}
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
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "text.primary" }}
                  >
                    Project List
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Projects: {projectList.length}
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
              <List sx={styles.drawerList}>
                {projectList.map((project, index) => (
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
                          {project.name}
                        </Typography>
                        <Typography
                          sx={{
                            ...styles.itemStatus,
                            backgroundColor: (theme) =>
                              project.status === "Open"
                                ? theme.palette.info.light
                                : project.status === "Work In Process"
                                  ? theme.palette.warning.light
                                  : theme.palette.success.light,
                            color: "white",
                          }}
                        >
                          {project.status}
                        </Typography>
                      </Box>

                      <Typography sx={{ ...styles.itemInfo, mt: 1 }}>
                        {project.description}
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
                            Start: {project.startDate}
                          </Typography>
                          <Typography sx={styles.itemInfo}>
                            <EventIcon sx={{ fontSize: 16 }} />
                            End: {project.endDate}
                          </Typography>
                        </Box>
                        <Typography sx={styles.itemInfo}>
                          <PersonIcon sx={{ fontSize: 16 }} />
                          Owner: {project.owner}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Box>
                ))}
              </List>
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
                    Total Completed: {completedProjects.length}
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
              <List sx={styles.drawerList}>
                {completedProjects.map((project, index) => (
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
                          {project.name}
                        </Typography>
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
                        {project.description}
                      </Typography>

                      <Box sx={styles.infoSection}>
                        <Typography sx={styles.itemInfo}>
                          <CalendarTodayIcon sx={{ fontSize: 16 }} />
                          Started: {project.startDate}
                        </Typography>
                        <Typography sx={styles.itemInfo}>
                          <EventIcon sx={{ fontSize: 16 }} />
                          Completed: {project.completedDate}
                        </Typography>
                        <Typography sx={styles.itemInfo}>
                          <PersonIcon sx={{ fontSize: 16 }} />
                          Owner: {project.owner}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Box>
                ))}
              </List>
            </Box>
          </Box>
        </Drawer>
        <Drawer
          anchor="right"
          open={internDrawerOpen}
          onClose={() => setInternDrawerOpen(false)}
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
                    Interns List
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Interns: {internList.length}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => setInternDrawerOpen(false)}
                  sx={styles.closeButton}
                  aria-label="close drawer"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            <Box sx={styles.drawerContent}>
              <List sx={styles.drawerList}>
                {internList.map((intern, index) => (
                  <ListItem key={index} sx={styles.internDrawerItem}>
                    <ListItemAvatar>
                      <Avatar sx={styles.internAvatar}>
                        {intern.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography sx={styles.internName}>
                          {intern.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography component="span" sx={styles.internBadge}>
                            Intern
                          </Typography>
                          <Box sx={styles.internInfoSection}>
                            <Typography sx={styles.internInfo}>
                              <EmailIcon sx={{ fontSize: 16 }} />
                              {intern.email}
                            </Typography>
                            {/* <Typography sx={styles.internInfo}>
                            <BusinessIcon sx={{ fontSize: 16 }} />
                            {intern.department}
                          </Typography>
                          <Typography sx={styles.internInfo}>
                            <CalendarTodayIcon sx={{ fontSize: 16 }} />
                            Joined: {intern.joiningDate}
                          </Typography> */}
                          </Box>
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
