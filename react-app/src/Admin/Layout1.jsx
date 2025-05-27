import * as React from "react";
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import { Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ForumIcon from "@mui/icons-material/Forum";
import GroupIcon from "@mui/icons-material/Group";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import useMediaQuery from "@mui/material/useMediaQuery";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import FI_logo from "../../public/FI_logo.png";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { BugReport } from "@mui/icons-material";
import Person4Icon from "@mui/icons-material/Person4";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";

export default function Layout1() {
  const [open, setOpen] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [anchorEl, setAnchorEl] = React.useState(null); // State to manage dropdown menu anchor
  const [userProfile, setUserProfile] = useState();
  const location = useLocation();
  const navigate = useNavigate(); // Hook for navigation

  // Check if screen size is small (mobile view)
  const isMobile = useMediaQuery("(max-width:600px)");

  const toggleMenu = () => setOpen(!open);
  const toggleTheme = () => {
    localStorage.setItem("darkMode", !darkMode);
    setDarkMode(!darkMode);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#1976d2",
      },
      background: {
        default: darkMode ? "#121212" : "#fafafa", // Dark mode background and light mode background
        paper: darkMode ? "#1d1d1d" : "#fff", // Color for cards, dropdowns, etc.
      },
    },
  });

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Projects", icon: <AssignmentIcon />, path: "/projects" },
    {
      text: "Tasks",
      icon: <FormatListBulletedIcon />,
      path: "/task",
    },
    { text: "Issues", icon: <BugReport />, path: "/bug" },
    { text: "Accounts", icon: <Person4Icon />, path: "/client" },

    {text: "Contacts", icon: <ConnectWithoutContactIcon />,path: "/clientStaff",},
    { text: "Employees", icon: <GroupIcon />, path: "/employees" },
    // { text: "Profile", icon: <AccountCircleIcon />, path: "/profile" },
   

  
    { text: "Feedback", icon: <ForumIcon />, path: "/feedback" },
  ];
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    const profile = localStorage.getItem("profileData");

    console.log("profile", profile);
    setUserProfile(profile);
  });

  const handleLogout = async () => {
    if (window && window.catalyst) {
      let redirectURL = "/__catalyst/auth/login";
      try {
        await window.catalyst.auth.signOut(redirectURL);
        setTimeout(() => {
          navigate("login");
        }, 2000);
        localStorage.clear();
      } catch (error) {
        console.error("Error during logout:", error);
      }
    } else {
      console.error("Catalyst is not initialized. Cannot log out.");
    }
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget); // Set the menu anchor element
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Close the menu by clearing the anchor element
  };

  const handleProfileClick = () => {
    navigate("/profile"); // Navigate to the profile section
    handleMenuClose(); // Close the menu after redirecting
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", height: "100vh", flexDirection: "column" }}>
        {/* Top Navbar */}

        <AppBar
          position="sticky"
          sx={{
            bgcolor: theme.palette.background.default, // Use the same background as content
            color: "primary.main",
            boxShadow: 1,
            zIndex: 1205,
          }}
        >
          <Toolbar>
            {
              <IconButton
                onClick={toggleMenu}
                color="inherit"
                sx={{ mr: 2, fontSize: 32 }}
              >
                {open ? <MenuOpenIcon /> : <MenuIcon />}
              </IconButton>
            }

            <img
              src={FI_logo}
              alt="logo"
              style={{ maxHeight: "40px", marginRight: "10px" }}
            />
            <Typography
              variant="h5"
              sx={{ flexGrow: 1, fontSize: "1.25rem", fontWeight: "700" }}
            >
              DSV-360
            </Typography>
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              sx={{ fontSize: 32, marginRight: "10px" }}
            >
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            {/* Avatar instead of Login Button */}
            <Avatar
              alt="User Avatar"
              src={userProfile} // Path to the avatar image
              sx={{ width: 40, height: 40, cursor: "pointer" }} // Adjust size and make it clickable
              onClick={handleAvatarClick} // Open the menu when clicked
            />

            {/* Avatar Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom", // Changed from "top" to "bottom"
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              sx={{
                mt: 1,
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                "& .MuiPaper-root": {
                  borderRadius: "10px",
                  minWidth: "180px",
                  bgcolor: theme.palette.background.paper,
                },
              }}
            >
              <MenuItem
                onClick={handleProfileClick}
                sx={{
                  fontSize: "1rem",
                  "&:hover": { bgcolor: "rgba(25, 118, 210, 0.1)" },
                }}
              >
                Profile
              </MenuItem>
              <MenuItem
                onClick={() => setLogoutDialogOpen(true)}
                sx={{
                  fontSize: "1rem",
                  color: "red",
                  "&:hover": { bgcolor: "rgba(255, 0, 0, 0.1)" },
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: "flex", overflow: "hidden" }}>
          {/* Sidebar */}

          {!isMobile && (
            <Box
              sx={{
                width: open ? "270px" : "64px",
                bgcolor: theme.palette.background.paper,
                color: "primary.main",
                transition: "width 0.3s ease-in-out",
                boxShadow: open ? "2px 20px 10px rgba(0,0,0,0.1)" : "none",
              }}
            >
              <List>
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Tooltip
                      title={!open ? item.text : ""}
                      placement="right"
                      arrow
                      key={item.text}
                      componentsProps={{
                        tooltip: {
                          sx: {
                            fontSize: "0.8rem", // ⬅️ Increase tooltip text size
                            padding: "6px 10px",
                            fontWeight: 400,
                          },
                        },
                      }}
                    >
                      <ListItem
                        button
                        component={Link}
                        to={item.path}
                        sx={{
                          paddingY: "10px",
                          paddingX: open ? "10px" : "16px", // keeps icon centered when collapsed
                          display: "flex",
                          alignItems: "center",
                          justifyContent: open ? "flex-start" : "center",
                          bgcolor: isActive
                            ? theme.palette.mode === "light"
                              ? "rgb(229, 236, 248)"
                              : "rgb(48, 48, 48)"
                            : "transparent",
                          color: isActive
                            ? theme.palette.mode === "light"
                              ? "black"
                              : "white"
                            : theme.palette.mode === "light"
                              ? "black"
                              : "white",
                          borderRadius: "10px",
                          minHeight: "48px",
                        }}
                      >
                        {React.cloneElement(item.icon, {
                          sx: {
                            width: "1em",
                            height: "1em",
                            display: isMobile ? "none" : "inline-block",
                            flexShrink: 0,
                            color: isActive
                              ? "#1976d2"
                              : theme.palette.mode === "dark"
                                ? "white"
                                : "grey",
                            fontSize: "1.5rem",
                            marginLeft: "10px",
                          },
                        })}
                        {open && (
                          <ListItemText
                            primary={item.text}
                            sx={{ ml: 2, fontSize: "1.2rem" }}
                          />
                        )}
                      </ListItem>
                    </Tooltip>
                  );
                })}
              </List>
            </Box>
          )}

          {/* Main Content */}
          <Box
            sx={{
              flexGrow: 1,
              //   ml: !isMobile ? (open ? "320px" : "64px") : 0,

              transition: "margin-left 0.3s ease-in-out",
              width: "calc(100% - 320px)",
              bgcolor: theme.palette.background.default, // Set content area background to match theme
              color: "text.primary", // Ensure text color adapts
              overflowY: "auto",
              minHeight: "93vh", // Ensure it covers full height
            }}
          >
            <Dialog
              open={logoutDialogOpen}
              onClose={() => setLogoutDialogOpen(false)}
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
                {"Logout "}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Are you sure you want to Logout
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{ p: 2, pt: 1 }}>
                <Button
                  onClick={() => setLogoutDialogOpen(false)}
                  variant="outlined"
                  color="primary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="contained"
                  color="error"
                  autoFocus
                >
                  Logout
                </Button>
              </DialogActions>
            </Dialog>

            {isMobile && (
              <Drawer anchor="left" open={open} onClose={toggleMenu}>
                <List
                  sx={{
                    width: 320,
                    top: "58px",
                  }}
                >
                  {menuItems.map((item) => (
                    <ListItem
                      button
                      key={item.text}
                      component={Link}
                      to={item.path}
                      onClick={toggleMenu}
                      sx={{
                        color:
                          theme.palette.mode === "light"
                            ? "grey" // Black text for light mode
                            : "white", // White text for dark mode
                      }}
                    >
                      {item.icon}
                      <ListItemText
                        primary={item.text}
                        sx={{
                          ml: 2,
                          color:
                            theme.palette.mode === "light"
                              ? "black" // Black text for light mode
                              : "white", // White text for dark mode
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Drawer>
            )}

            <Outlet context={{ setUserProfile }} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
