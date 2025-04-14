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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  IconButton,
  Modal,
} from "@mui/material";
import { IoTimeSharp } from "react-icons/io5";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import { FaClock } from "react-icons/fa6";
import { MdDateRange } from "react-icons/md";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

export const ProjectTimeEntry = ({
  theme,
  viewModalOpen,
  viewproject,
  setViewproject,
  handleCloseViewModal,
}) => {
  const [show, setShow] = useState(false);
  const [alertLabel, setAlertLabel] = useState("");
  const [alerttype, setalerttype] = useState("");
  const [timeEntry, setTimeEntry] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userImage, setuserImage] = useState({});
  const [currUser, setCurrUser] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [currentEditTimeEntry, setcurrentEditTimeEntry] = useState({
    ROWID: "",
    name: "",
    date: "",
    startTime: "",
    endTime: "",
    note: "",
  });
  const [editModalOpen, setEditModalOpen] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("viewproject", viewproject);

        const user = await JSON.parse(localStorage.getItem("currUser"));
        setCurrUser(user);
        // Fetch time entry data
        setIsLoading(true);
        const TimeEntryResponse = await axios.get(
          `/server/time_entry_management_application_function/time_entry/project/${viewproject.ROWID}`
        );

        console.log("timeentry project", TimeEntryResponse.data.data);
        const userProfile = {};

        // Use for...of loop to properly await async actions
        for (const timeEntry of TimeEntryResponse.data.data) {
          for (const item of timeEntry.details) {
            if (!userProfile.hasOwnProperty(item.Time_Entries.User_ID)) {
              const response = await axios.get(
                `/server/time_entry_management_application_function/userprofile/${item.Time_Entries.User_ID}`
              );

              console.log("profile response", response.data.data);

              if (response.data.data != null) {
                userProfile[item.Time_Entries.User_ID] = response.data.data;
              } else {
                userProfile[item.Time_Entries.User_ID] =
                  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";
              }
            }
          }
        }

        console.log("userProfile", userProfile);
        setuserImage(userProfile);
        setTimeEntry(TimeEntryResponse.data.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [viewproject]);

  const [newTimesheetEntry, setNewTimesheetEntry] = useState({
    user: currUser.firstName + " " + currUser.lastName,
    userId: currUser.userid,
    date: "",
    startTime: "",
    endTime: "",
    note: "",
    totalTime: "",
  });
  const handleAlert = (type, label) => {
    setalerttype(type);
    setAlertLabel(label);
    setShow(true);
    setTimeout(() => {
      setShow(false);
      setAlertLabel("");
    }, 2000);
  };
  const handleOpenModal = (note) => {
    setSelectedNote(note);
    setOpenModal(true);
  };

  function formatTimeToAMPM(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesFormatted = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutesFormatted} ${ampm}`;
  }
  function formatTime(minutes) {
    let hrs = Math.floor(minutes / 60);
    let mins = minutes % 60;
    return `${hrs} hr ${mins} min`;
  }
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedNote("");
  };
  const handleTimesheetInputChange = (event) => {
    const { name, value } = event.target;
    setNewTimesheetEntry((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddTimesheetEntry = async () => {
    //console.log("user", currUser);
    //console.log("timeEntry", newTimesheetEntry);
    if (!viewproject) return;

    const start = new Date(`1970-01-01T${newTimesheetEntry.startTime}`);
    const end = new Date(`1970-01-01T${newTimesheetEntry.endTime}`);
    const diffMs = (end - start) / (1000 * 60); // Total time in minutes

    if (diffMs <= 0) {
      handleAlert("Error", "End time must be greater than Start Time");
      return;
    }

    setIsLoading(true);
    try {
      // Post the new timesheet entry to the server
      const response = await axios.post(
        "/server/time_entry_management_application_function/timeentry",
        {
          Username: currUser.firstName + currUser.lastName,
          User_ID: currUser.userid,
          Entry_Date: newTimesheetEntry.date,
          Note: newTimesheetEntry.note,
          Start_time: formatTimeToAMPM(start),
          End_time: formatTimeToAMPM(end),
          Total_time: diffMs,
          project_ID: viewproject.id,
          project_Name: viewproject.name,
          Project_ID: viewproject.projectId,
          Project_Name: viewproject.project_name,
        }
      );
      const TimeEntryResponse = await axios.get(
        `/server/time_entry_management_application_function/timeentry/${viewproject.projectid}`
      );
      setTimeEntry(TimeEntryResponse.data.data);
      setIsLoading(false);
      handleAlert("success", "Time Entry has been successfully submitted");

      setNewTimesheetEntry({
        user: "",
        date: "",
        startTime: "",
        endTime: "",
        note: "",
        totalTime: "",
      });
    } catch (error) {
      console.error("Error adding timesheet entry:", error);
      handleAlert("Error", "Failed to add timesheet entry. Please try again.");
    }
  };
  const handleDeleteTimeEntry = async (ROWID) => {
    try {
      //console.log("id=>", ROWID);

      // Make the DELETE request to the server
      const response = await axios.delete(
        `/server/time_entry_management_application_function/timeentry/${ROWID}`
      );

      if (response.status === 200 || response.status === 204) {
        handleAlert("info", "Time Entry deleted");

        //console.log(timeEntry);

        // Update the timeEntry state
        const updatedTimeEntry = timeEntry
          .map((entry) => {
            // For each entry, check if it has details to filter
            const updatedDetails = entry.details.filter(
              (detail) => detail.Time_Entries.ROWID !== ROWID
            );

            // If the details array is not empty, return the updated entry
            if (updatedDetails.length > 0) {
              return {
                ...entry,
                details: updatedDetails,
                totalTime: updatedDetails.reduce(
                  (total, detail) => total + detail.Time_Entries.Total_time,
                  0
                ), // Recalculate totalTime after removal
              };
            }

            // If there are no details left, return null to remove the entire entry
            return null;
          })
          .filter((entry) => entry !== null); // Filter out null entries

        //console.log("Updated Time Entries:", updatedTimeEntry);

        // Update the state with the new timeEntry array
        setTimeEntry(updatedTimeEntry);
      } else {
        console.error("Failed to remove time entry:", response);
        handleAlert("error", "Failed to delete Time Entry");
      }
    } catch (error) {
      console.error("Error deleting time entry:", error);
      handleAlert("error", "Deleting Time Entry failed");
    }
  };
  const handleEditChange = (event) => {
    //console.log(event);
    const { name, value } = event.target;
    setcurrentEditTimeEntry((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleUpdateTimeEntry = async () => {
    // //console.log("curren TE", currentEditTimeEntry);

    setIsLoading(true);
    const start = new Date(`1970-01-01T${currentEditTimeEntry.startTime}`);
    const end = new Date(`1970-01-01T${currentEditTimeEntry.endTime}`);
    const diffMs = (end - start) / (1000 * 60); // Total time in minutes

    if (diffMs <= 0) {
      handleAlert("Error", "End time must be greater than Start Time");
      return;
    }

    try {
      const response = await axios.post(
        `/server/time_entry_management_application_function/timeentry/${currentEditTimeEntry.ROWID}`,
        {
          Username: currUser.firstName + " " + currUser.lastName,
          User_ID: currUser.userid,
          Entry_Date: currentEditTimeEntry.date,
          Note: currentEditTimeEntry.note,
          Start_time: formatTimeToAMPM(start),
          End_time: formatTimeToAMPM(end),
          Total_time: diffMs,
          project_ID: viewproject.id,
          project_Name: viewproject.name,
          Project_ID: viewproject.projectId,
          Project_Name: viewproject.project_name,
        }
      );
      setEditModalOpen(false);
      const TimeEntryResponse = await axios.get(
        `/server/time_entry_management_application_function/timeentry/${viewproject.projectid}`
      );

      setTimeEntry(TimeEntryResponse.data.data);
      setIsLoading(false);

      handleAlert("success", "Time Entry has been successfully updated");
      //console.log("Response from server:", response.data);
    } catch (err) {
      //console.log(err);
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setcurrentEditTimeEntry({
      name: "",
      date: "",
      startTime: "",
      endTime: "",
      note: "",
    });
  };
  const handleEdit = (entry) => {
    try {
      // Convert AM/PM to 24-hour format
      const convertAMPMto24 = (timeStr) => {
        const [timePart, period] = timeStr.split(" ");
        const [hours, minutes] = timePart
          .split(":")
          .map((num) => parseInt(num, 10));

        if (isNaN(hours) || isNaN(minutes)) {
          throw new Error("Invalid time format");
        }

        let hour = hours;
        if (period === "PM" && hours !== 12) {
          hour += 12;
        } else if (period === "AM" && hours === 12) {
          hour = 0;
        }

        return `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      };

      const startTime = convertAMPMto24(entry.Time_Entries.Start_time);
      const endTime = convertAMPMto24(entry.Time_Entries.End_time);

      setcurrentEditTimeEntry({
        ROWID: entry.Time_Entries.ROWID,
        name: entry.Time_Entries.Username,
        date: entry.Time_Entries.Entry_Date,
        startTime: startTime,
        endTime: endTime,
        note: entry.Time_Entries.Note,
      });

      setEditModalOpen(true);
    } catch (error) {
      console.error("Error in handleEdit:", error);
      handleAlert("error", "Failed to edit time entry: " + error.message);
    }
  };

  // const handleAction = () =>{
  //   setview(true);
  // }

  return (
    <div>
      <Modal
        open={viewModalOpen}
        onClose={handleCloseViewModal}
        aria-labelledby="view-project-modal"
        aria-describedby="modal-for-viewing-project"
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh", // Full height of the viewport
            bgcolor: theme.palette.background.paper,
            boxShadow: 24,
            overflow: "hidden", // Prevent the modal from overflowing
            borderRadius: 0, // No border radius to cover the full screen
          }}
        >
          {/* Header Section (Sticky) */}
          <Card sx={{ position: "sticky", top: 0, zIndex: 1, marginBottom: 2 }}>
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography id="view-project-modal" variant="h6">
                {viewproject.name} Time Entries
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleCloseViewModal}
                >
                  Close
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Scrollable Content Section */}
          <Box sx={{ overflowY: "auto", height: "calc(100vh - 140px)" }}>
            {" "}
            {/* Adjusted height to accommodate the header */}
            {viewproject && (
              <>
                <Box sx={{ mb: 4, ml: 2, mr: 2 }}>
                  <TableContainer component={Paper}>
                    <Table>
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
                            User
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.primary.contrastText,
                              fontWeight: "bold",
                            }}
                          >
                            Date
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.primary.contrastText,
                              fontWeight: "bold",
                            }}
                          >
                            Start Time
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.primary.contrastText,
                              fontWeight: "bold",
                            }}
                          >
                            End Time
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.primary.contrastText,
                              fontWeight: "bold",
                            }}
                          >
                            Total Time
                          </TableCell>
                          <TableCell
                            sx={{
                              color: theme.palette.primary.contrastText,
                              fontWeight: "bold",
                            }}
                          >
                            Note
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      {isLoading ? (
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={7} sx={{ height: "300px" }}>
                              <Box sx={{ width: "100%" }}>
                                <Skeleton variant="text" width="100%" />
                                <Skeleton variant="text" width="100%" />
                                <Skeleton variant="text" width="100%" />
                                <Skeleton variant="text" width="100%" />
                                <Skeleton variant="text" width="100%" />
                                <Skeleton variant="text" width="100%" />
                                <Skeleton variant="text" width="100%" />
                                <Skeleton variant="text" width="100%" />
                              </Box>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      ) : timeEntry.length === 0 ? (
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={7}>
                              <Box
                                sx={{
                                  p: 3,
                                  textAlign: "center",
                                  minHeight: "200px",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <IoTimeSharp
                                  size={50}
                                  color={theme.palette.text.secondary}
                                />
                                <Typography variant="h5" color="text.secondary">
                                  No Time Entries Found
                                </Typography>
                                <Typography
                                  variant="body1"
                                  color="text.secondary"
                                >
                                  There are no time entries to display.
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      ) : (
                        <TableBody>
                          {timeEntry.map((item) => (
                            <React.Fragment key={item.entryDate}>
                              {/* Main row */}
                              <TableRow>
                                <TableCell>
                                  <Button
                                    variant="outlined"
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    {item.Task_Name}
                                  </Button>
                                </TableCell>
                                <TableCell ></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>{" "}
                                {/* Format Total Time */}
                                <TableCell></TableCell>
                              </TableRow>

                              {/* Render project details if 'viewproject' is true */}
                              {  viewproject &&
                                item.details?.map((entry, index) => (
                                  <TableRow key={index}>
                                    <TableCell
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "18px",
                                      }}
                                    >
                                      <Avatar
                                        src={
                                          userImage[entry.Time_Entries.User_ID]
                                        }
                                      />
                                      <span>{entry.Time_Entries.Username}</span>
                                    </TableCell>
                                    <TableCell>
                                      {entry.Time_Entries.Entry_Date}
                                    </TableCell>
                                    <TableCell>
                                      {entry.Time_Entries.Start_time}
                                    </TableCell>
                                    <TableCell>
                                      {entry.Time_Entries.End_time}
                                    </TableCell>
                                    <TableCell>
                                      {formatTime(
                                        entry.Time_Entries.Total_time
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <IconButton
                                        color="primary"
                                        onClick={() =>
                                          handleOpenModal(
                                            entry.Time_Entries.Note
                                          )
                                        }
                                      >
                                        <DescriptionIcon />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </React.Fragment>
                          ))}
                        </TableBody>
                      )}
                    </Table>
                  </TableContainer>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Modal>
      {/* edit time entry model */}
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
            Edit Time Entry
          </Typography>
          <TextField
            label="User"
            name="user"
            fullWidth
            variant="outlined"
            value={currUser.firstName + " " + currUser.lastName}
            onChange={handleEditChange}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Date"
            name="date"
            fullWidth
            variant="outlined"
            type="date"
            value={currentEditTimeEntry?.date || ""}
            onChange={handleEditChange}
            InputLabelProps={{ shrink: true }}
            sx={{ marginBottom: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Time"
                name="startTime"
                fullWidth
                type="time"
                value={currentEditTimeEntry?.startTime || ""}
                onChange={handleEditChange}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Time"
                name="endTime"
                fullWidth
                type="time"
                value={currentEditTimeEntry?.endTime || ""}
                onChange={handleEditChange}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
          <TextField
            label="Note"
            name="note"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={currentEditTimeEntry?.note || ""}
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
              onClick={handleUpdateTimeEntry}
            >
              Save Changes
            </Button>
            <Button variant="outlined" color="error" onClick={handleEditCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Note</DialogTitle>
        <DialogContent>
          <p>{selectedNote}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
