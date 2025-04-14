import React, { useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Skeleton,
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
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import "react-circular-progressbar/dist/styles.css";

import { useState } from "react";

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

export function ContactDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Simulate a network request with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLoading(false);
    };
    fetchData();
  }, []);

  const cardData = [
    {
      title: "Total Employees",
      value: 0,
      description: "",
      icon: (
        <PeopleAltIcon
          fontSize="large"
          sx={{ color: "green", paddingBottom: "50px" }}
        />
      ),
    },
    {
      title: "My Total Projects",
      value: 0,
      description: "",
      icon: (
        <AssignmentIcon
          fontSize="large"
          sx={{ color: "gold", paddingBottom: "50px" }}
        />
      ),
    },
    {
      title: "My Active Projects",
      value: 0,
      description: "",
      icon: (
        <PersonAddAltIcon
          fontSize="large"
          sx={{ color: "orange", paddingBottom: "50px" }}
        />
      ),
    },
    {
      title: "My Completed Projects",
      value: 0,
      description: "",
      icon: (
        <PersonOutlineIcon
          fontSize="large"
          sx={{ color: "blue", paddingBottom: "50px" }}
        />
      ),
    },
  ];

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
    </Box>
  );
}
