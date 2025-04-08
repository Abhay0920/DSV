import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Modal,
  DialogContentText,
  CircularProgress,
 
} from "@mui/material";
import { IoTimeSharp } from "react-icons/io5";
import Avatar from "@mui/material/Avatar";
import Skeleton from "@mui/material/Skeleton";
import { FaClock } from "react-icons/fa6";
import { MdDateRange } from "react-icons/md";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import axios from "axios";
import { useRef } from "react";

export const TimeEntry = ({
  theme,
  viewModalOpen,
  viewTask,
  setViewTask,
  handleCloseViewModal,
}) => {
// Create a ref for the TextField component
  const [loading, setLoading] = useState(false);

 

  const handleFocus = (id) => {
    document.getElementById(id).showPicker();
  };
  const [show, setShow] = useState(false);
  const [alertLabel, setAlertLabel] = useState("");
  const [alerttype, setalerttype] = useState("");
  const [timeEntry, setTimeEntry] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userImage, setuserImage] = useState({});
  const [currUser, setCurrUser] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [errors, setErrors] = useState({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [todayTimeEntry,setTodayTimeEntry] = useState([]);

  const dateInputRef = useRef(null);

  const handleDateClick = () => {
    dateInputRef.current?.showPicker();
  };
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  const handleTimeClick = (ref) => {
    ref.current?.showPicker();
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!newTimesheetEntry.date) tempErrors.date = "Date is required";
    if (!newTimesheetEntry.startTime) tempErrors.startTime = "Start time is required";
    if (!newTimesheetEntry.endTime) tempErrors.endTime = "End time is required";
    if (newTimesheetEntry.startTime && newTimesheetEntry.endTime && newTimesheetEntry.startTime >= newTimesheetEntry.endTime) {
      tempErrors.endTime = "End time must be after start time";
    }
    if (!newTimesheetEntry.note) tempErrors.note = "Note is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; // Returns true if no errors
  };

  const handleSubmit = () => {
    if (validateForm()) {
      handleAddTimesheetEntry();
    }
  };

  const handleOpenModal = (note) => {
    setSelectedNote(note);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedNote("");
  };
  const [currentEditTimeEntry, setcurrentEditTimeEntry] = useState({
    ROWID: "",
    name: "",
    date: "",
    startTime: "",
    endTime: "",
    note: "",
  });
  const [editModalOpen, setEditModalOpen] = useState(false);

  const MAX_NOTE_LENGTH = 60;

  useEffect(() => {
    const fetchData = async () => {
      try {
        //console.log("viewTask", viewTask);

        const user = await JSON.parse(localStorage.getItem("currUser"));
        setCurrUser(user);
        // Fetch time entry data
        setIsLoading(true);
        const TimeEntryResponse = await axios.get(
          `/server/time_entry_management_application_function/timeentry/${viewTask.taskid}`
        );

        const userProfile = {};

        // Use for...of loop to properly await async actions
        for (const timeEntry of TimeEntryResponse.data.data) {
          for (const item of timeEntry.details) {
            if (!userProfile.hasOwnProperty(item.Time_Entries.User_ID)) {
              const response = await axios.get(
                `/server/time_entry_management_application_function/userprofile/${item.Time_Entries.User_ID}`
              );

              if (response.data.data != null) {
                userProfile[item.Time_Entries.User_ID] = response.data.data;
              } else {
                userProfile[item.Time_Entries.User_ID] =
                  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";
              }
            }
          }
        }
        setuserImage(userProfile);
        setTimeEntry(TimeEntryResponse.data.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [viewTask]);

  const [newTimesheetEntry, setNewTimesheetEntry] = useState({
    user: currUser.firstName + " " + currUser.lastName,
    userId: currUser.userid,
    date: "",
    startTime: "",
    endTime: "",
    note: "",
    totalTime: "",
  });
  console.log("sdahfjsd",newTimesheetEntry.date);
  const handleAlert = (type, label) => {
    setalerttype(type);
    setAlertLabel(label);
    setShow(true);
    setTimeout(() => {
      setShow(false);
      setAlertLabel("");
    }, 2000);
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



//   const checkValidTimeSlot = (newStartTime, newEndTime, selectedDate) => {
//     const timeEntries = timeEntry.find((item) => selectedDate === item?.entryDate);

//     // Function to parse time including AM/PM format
//     const parseTime = (timeStr) => {
//         let [time, modifier] = timeStr.split(" ");
//         let [hours, minutes] = time.split(":").map(Number);

//         if (modifier === "PM" && hours !== 12) hours += 12;
//         if (modifier === "AM" && hours === 12) hours = 0;

//         return hours * 60 + minutes; // Convert time to minutes
//     };

//     const newStart = parseTime(newStartTime);
//     const newEnd = parseTime(newEndTime);

//     if (newEnd <= newStart) return false; // Invalid time range

//     if (!timeEntries?.details) return true; // No existing entries, valid time slot

//     for (const entry of timeEntries?.details) {
//         const timeEntry = entry.Time_Entries; // Fixing nested structure

//         if (timeEntry.Entry_Date === selectedDate) {
//             const existingStart = parseTime(timeEntry.Start_time);
//             const existingEnd = parseTime(timeEntry.End_time);

//             if (
//                 (newStart >= existingStart && newStart < existingEnd) || // Overlapping start
//                 (newEnd > existingStart && newEnd <= existingEnd) || // Overlapping end
//                 (newStart <= existingStart && newEnd >= existingEnd) // Complete overlap
//             ) {
//                 return false; // Overlapping time slot
//             }
//         }
//     }
//     return true; // Valid time slot
// };

// Test Cases
//console.log("1",checkValidTimeSlot("08:00 AM", "11:46 AM", "2025-02-25")); // true
// console.log(checkValidTimeSlot("01:32 PM", "02:00 PM", "2025-02-25")); // false
// console.log(checkValidTimeSlot("02:30 PM", "01:00 PM", "2025-03-24")); // false (invalid range)
// console.log("2",checkValidTimeSlot("06:30 PM", "07:00 PM", "2025-02-25")); // false (invalid range)



  const handleTimesheetInputChange = (event) => {
    const { name, value } = event.target;
    console.log("[name]", name ,value);
    
    setNewTimesheetEntry((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddTimesheetEntry = async () => {
    if (!viewTask) return;
  
    const start = new Date(`1970-01-01T${newTimesheetEntry.startTime}`);
    const end = new Date(`1970-01-01T${newTimesheetEntry.endTime}`);
    const diffMs = (end - start) / (1000 * 60); // Total time in minutes
  
    if (diffMs <= 0) {
      handleAlert("Error", "End time must be greater than Start Time");
      return;
    }
  
    setLoading(true);
    setIsLoading(true);
  
    try {
      // Check if the time slot is valid before proceeding
      // const validTimeSlot = checkValidTimeSlot(
      //   formatTimeToAMPM(start),
      //   formatTimeToAMPM(end),
      //   newTimesheetEntry.date
      // );
  
      // if (!validTimeSlot) {
      //   handleAlert("error", "Already have a Time Entry for this time slot");
        // Fetch the previous data (even if the time entry is invalid)
      //   const TimeEntryResponse = await axios.get(
      //     `/server/time_entry_management_application_function/timeentry/${viewTask.taskid}`
      //   );
      //   setTimeEntry(TimeEntryResponse.data.data);
      //   return; // Don't proceed with posting if the time is invalid
      // }
  
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
          Task_ID: viewTask.id,
          Task_Name: viewTask.name,
          Project_ID: viewTask.projectId,
          Project_Name: viewTask.project_name,
        }
      );
  
      // After successfully posting, fetch the updated data
      const TimeEntryResponse = await axios.get(
        `/server/time_entry_management_application_function/timeentry/${viewTask.taskid}`
      );

      
  
      // Update the state with the new data
      setTimeEntry(TimeEntryResponse.data.data);
      handleAlert("success", "Time Entry has been successfully submitted");
  
      // Reset the new timesheet entry fields
      setNewTimesheetEntry({
        user: "",
        date: "",
        startTime: "",
        endTime: "",
        note: "",
        totalTime: "",
      });
  
    } catch (error) {
      
     
      handleAlert("error", "Time Entry is Already Added ");
    } finally {
      setLoading(false);
      setIsLoading(false); // Ensure isLoading is set back to false after completion
    }
  };
  

 
  // const handleAddTimesheetEntry = async () => {
  //   if (!viewTask) return;
  
  //   const start = new Date(`1970-01-01T${newTimesheetEntry.startTime}`);
  //   const end = new Date(`1970-01-01T${newTimesheetEntry.endTime}`);
  //   const diffMs = (end - start) / (1000 * 60); // Total time in minutes
  
  //   if (diffMs <= 0) {
  //     handleAlert("Error", "End time must be greater than Start Time");
  //     return;
  //   }
  //   setLoading(true);
  //   setIsLoading(true);
  //   try {
  //     // Post the new timesheet entry to the server
  //     const response = await axios.post(
  //       "/server/time_entry_management_application_function/timeentry",
  //       {
  //         Username: currUser.firstName + currUser.lastName,
  //         User_ID: currUser.userid,
  //         Entry_Date: newTimesheetEntry.date,
  //         Note: newTimesheetEntry.note,
  //         Start_time: formatTimeToAMPM(start),
  //         End_time: formatTimeToAMPM(end),
  //         Total_time: diffMs,
  //         Task_ID: viewTask.id,
  //         Task_Name: viewTask.name,
  //         Project_ID: viewTask.projectId,
  //         Project_Name: viewTask.project_name,
  //       }
  //     );
  
  //     // Handle success
  //     const TimeEntryResponse = await axios.get(
  //       `/server/time_entry_management_application_function/timeentry/${viewTask.taskid}`
  //     );
  //     setTimeEntry(TimeEntryResponse.data.data);
  //     setIsLoading(false);
  //     handleAlert("success", "Time Entry has been successfully submitted");
  
  //     setNewTimesheetEntry({
  //       user: "",
  //       date: "",
  //       startTime: "",
  //       endTime: "",
  //       note: "",
  //       totalTime: "",
  //     });
  
  //   } catch (error) {
  //     if (error.response && error.response.status === 400) {
  //       // Show alert if the time entry overlaps
  //       handleAlert("Error", error.response.data.message);
  //     } else {
  //       console.error("Error adding timesheet entry:", error);
  //       handleAlert("Error", "Failed to add timesheet entry. Please try again.");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
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
          Task_ID: viewTask.id,
          Task_Name: viewTask.name,
          Project_ID: viewTask.projectId,
          Project_Name: viewTask.project_name,
        }
      );
      setEditModalOpen(false);
      const TimeEntryResponse = await axios.get(
        `/server/time_entry_management_application_function/timeentry/${viewTask.taskid}`
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

  const handleOpenDeleteDialog = (entry) => {
    setEntryToDelete(entry);
    setOpenDeleteDialog(true);
  };

  // Close Dialog Without Deleting
  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setEntryToDelete(null);
  };

  // Confirm Delete
  const handleDeleteConfirm = () => {
    if (entryToDelete) {
      handleDeleteTimeEntry(entryToDelete.Time_Entries.ROWID);
    }
    setOpenDeleteDialog(false);
    setEntryToDelete(null);
  };

  const [expandedDate, setExpandedDate] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  const handleExpand = (date) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  return (
    <div>
      {/* View Task Modal */}
      <Snackbar
        open={show}
        onClose={() => setShow(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={2000}
      >
        <Alert severity={alerttype}>{alertLabel}</Alert>
      </Snackbar>
      <Modal
        open={viewModalOpen}
        onClose={handleCloseViewModal}
        aria-labelledby="view-task-modal"
        aria-describedby="modal-for-viewing-task"
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh", // Full height of the viewport
            bgcolor: theme.palette.background.paper,
            color: theme.palette.mode === "dark" ? "white" : "black",
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
              <Typography id="view-task-modal" variant="h6">
                Task Time Entries
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
            {viewTask && (
              <>
                {/* Add Timesheet Entry Section */}
                 <Box sx={{ mb: 4, ml: 2, mr: 2, position: "relative" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Add Time Entry
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="User"
            name="user"
            fullWidth
            value={`${currUser.firstName} ${currUser.lastName}`}
            sx={{ mb: 2 }}
            disabled
          />
        </Grid>

        {/* <Grid item xs={12} sm={6}>
          <div className="dateInput"  onFocus={() => handleFocus("dateInput")} >
          <TextField
          
            label="Date"
            name="date"
            id="dateInput"
            fullWidth
            type="date"
            value={newTimesheetEntry.date}
            InputLabelProps={{ shrink: true }}
            onChange={handleTimesheetInputChange}
            sx={{ mb: 2 }}
            error={!!errors.date}
            helperText={errors.date}
          />
          </div>
        </Grid> */}
           <Grid item xs={12} sm={6}>
      <div className="dateInput" onClick={handleDateClick}>
        <TextField
          label="Date"
          name="date"
          id="dateInput"
          fullWidth
          type="date"
          inputRef={dateInputRef}
          value={newTimesheetEntry.date}
          InputLabelProps={{ shrink: true }}
          onChange={handleTimesheetInputChange}
          sx={{ mb: 2 }}
          error={!!errors.date}
          helperText={errors.date}
        />
      </div>
    </Grid>


    <Grid item xs={12} sm={6}>
        <div className="timeInput1" onClick={() => handleTimeClick(startTimeRef)}>
          <TextField
            label="Start Time"
            id="timeInput1"
            name="startTime"
            fullWidth
            type="time"
            inputRef={startTimeRef}
            value={newTimesheetEntry.startTime}
            onChange={handleTimesheetInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{
              mb: 2,
              "& input": { color: theme.palette.mode === "dark" ? "white" : "black" },
              "& .MuiSvgIcon-root": { color: theme.palette.mode === "dark" ? "white" : "black" },
            }}
            error={!!errors.startTime}
            helperText={errors.startTime}
          />
        </div>
      </Grid>

      <Grid item xs={12} sm={6}>
        <div className="timeInput2" onClick={() => handleTimeClick(endTimeRef)}>
          <TextField
            label="End Time"
            id="timeInput2"
            name="endTime"
            fullWidth
            type="time"
            inputRef={endTimeRef}
            value={newTimesheetEntry.endTime}
            onChange={handleTimesheetInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
            error={!!errors.endTime}
            helperText={errors.endTime}
          />
        </div>
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Note"
          name="note"
          fullWidth
          multiline
          rows={4}
          value={newTimesheetEntry.note}
          onChange={handleTimesheetInputChange}
          sx={{ mb: 2 }}
          error={!!errors.note}
          helperText={errors.note}
        />
      </Grid>

        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Add"}

          </Button>
        </Grid>
      </Grid>
    </Box>
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

                      {isLoading ? (
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={7} sx={{ height: "300px" }}>
                              <Box sx={{ width: "100%" }}>
                                <Skeleton />
                                <Skeleton animation="wave" />
                                <Skeleton animation={false} />
                                <Skeleton />
                                <Skeleton animation="wave" />
                                <Skeleton animation={false} />
                                <Skeleton />
                                <Skeleton animation="wave" />
                                <Skeleton animation={false} />
                                <Skeleton />
                                <Skeleton animation="wave" />
                                <Skeleton animation={false} />
                              </Box>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      ) : timeEntry.length === 0 ? (
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={8}>
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
                                  There are no time entry to display.
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      ) : (
                        <TableBody>
                          {timeEntry.map((item) => (
                            <React.Fragment key={item.entryDate}>
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
                                    <MdDateRange />
                                    {item.entryDate}
                                  </Button>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outlined"
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <FaClock />
                                    {formatTime(item.totalTime)}
                                  </Button>
                                </TableCell>

                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                              </TableRow>

                              {/* Render task details if 'viewTask' is true */}
                              {viewTask &&
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

                                    {/* Replace Note with an Icon that triggers the Modal */}
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

                                    <TableCell>
                                      <IconButton
                                        color="primary"
                                        onClick={() => handleEdit(entry)}
                                      >
                                        <EditIcon />
                                      </IconButton>
                                      <IconButton
                                        color="error"
                                        onClick={() => handleOpenDeleteDialog(entry)}
                                      >
                                        <DeleteIcon />
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
              <div className="timeInput" onFocus={() => handleFocus("timeInput3")}>
              <TextField
                label="Start Time"
                name="startTime"
                id="timeInput3"
                fullWidth
                type="time"
                value={currentEditTimeEntry?.startTime || ""}
                onChange={handleEditChange}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
              </div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <div className="timeInput" onFocus={() => handleFocus("timeInput4")}>
                <TextField
                  label="End Time"
                  id="timeInput4"
                  name="endTime"
                  fullWidth
                  type="time"
                  value={currentEditTimeEntry?.endTime || ""}
                  onChange={handleEditChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                  inputRef={endTimeRef} // Attach the ref to the TextField
                />
              </div>
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
            inputProps={{ maxLength: MAX_NOTE_LENGTH }}
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

      <Dialog 
      open={openModal} 
      onClose={handleCloseModal} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        style: { 
          borderRadius: "16px", 
          padding: "20px",
          backgroundColor: "#f5f5f5",
        },
      }}
    >
      <DialogTitle 
        sx={{ 
          textAlign: "center", 
          fontWeight: "bold", 
          fontSize: "1.5rem", 
          color: "#3f51b5" 
        }}
      >
          📝 Note
      </DialogTitle>
      <DialogContent 
        dividers 
        sx={{ 
          textAlign: "center", 
          margin: "20px 0", 
          backgroundColor: "#ffffff",
          borderRadius: "8px",
        }}
      >
        <Typography variant="body1" sx={{ color: "#333", fontSize: "1.1rem" }}>
          {selectedNote}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Button 
          onClick={handleCloseModal} 
          variant="contained" 
          color="primary" 
          sx={{ 
            textTransform: "none", 
            borderRadius: "8px", 
            fontWeight: "bold",
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle id="alert-dialog-title">{"Delete Time Entry"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete Time Entry{" "}
            <strong>{entryToDelete?.Time_Entries?.Username}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleDeleteCancel} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
