"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const os = require("os");

const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
app.use(fileUpload());
app.use(express.json()); // To handle text data if sent as JSON
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data
app.use(cors());

const catalyst = require("zcatalyst-sdk-node");
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Catalyst app
app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});

function to24HourFormat(time) {
  const [hour, minute] = time.split(":");
  const [minutePart, period] = minute.split(" ");
  let hour24 = parseInt(hour, 10);
  if (period === "PM" && hour24 !== 12) {
    hour24 += 12;
  } else if (period === "AM" && hour24 === 12) {
    hour24 = 0;
  }
  return `${String(hour24).padStart(2, "0")}:${minutePart.padStart(2, "0")}`;
}

// const getTimeEntryByTaskId = async (req, res) => {
//   const taskId = req.params.taskid;

//   try {
//     const catalystApp = req.catalystApp;
//     const zcql = catalystApp.zcql();

//     // Fetch grouped data by entry date with the sum of total time, but filtered by Task_ID
//     const query = `SELECT Time_Entries.Entry_Date, SUM(Time_Entries.Total_time) as Total_time
//                    FROM Time_Entries 
//                    WHERE Time_Entries.Task_ID = '${taskId}' 
//                    GROUP BY Time_Entries.Entry_Date 
//                    ORDER BY Time_Entries.Entry_Date DESC`;
//     const queryResp = await zcql.executeZCQLQuery(query);
//     const response = [];

//     // console.log("hihi", queryResp);

//     // Loop through each grouped entry and fetch detailed data
//     for (const item of queryResp) {
//       const queryAll = `SELECT * FROM Time_Entries 
//                         WHERE Time_Entries.Entry_Date = '${item.Time_Entries.Entry_Date}' 
//                         AND Time_Entries.Task_ID = '${taskId}' 
//                         ORDER BY Time_Entries.CREATEDTIME ASC`; // Sorting by Start_Time
//       const queryRespAll = await zcql.executeZCQLQuery(queryAll);

//       queryRespAll.sort((a, b) => {
//         const startTimeA = to24HourFormat(a.Time_Entries.Start_time);
//         const startTimeB = to24HourFormat(b.Time_Entries.Start_time);
//         return startTimeA.localeCompare(startTimeB);
//       });

//       console.log(item.Time_Entries.Total_time);

//       console.log("hiohi", {
//         entryDate: item.Time_Entries.Entry_Date,
//         totalTime: item.Time_Entries["SUM(Total_time)"],
//         details: queryRespAll,
//       });

//       response.push({
//         entryDate: item.Time_Entries.Entry_Date,
//         totalTime: item.Time_Entries["SUM(Total_time)"],
//         details: queryRespAll,
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: response,
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch project",
//       error: error.message,
//     });
//   }
// };

// const getTimeEntryByTaskId = async (req, res) => {
//   const taskId = req.params.taskid;

//   try {
//     const catalystApp = req.catalystApp;
//     const zcql = catalystApp.zcql();

//     // Step 1: Fetch all Time Entries for this Task_ID at once
//     const query = `SELECT * FROM Time_Entries WHERE Time_Entries.Task_ID = '${taskId}'`;
//     const queryResp = await zcql.executeZCQLQuery(query);

//     // Step 2: Group entries by Entry_Date
//     const groupedData = {};

//     for (const item of queryResp) {
//       const entryDate = item.Time_Entries.Entry_Date;
//       if (!groupedData[entryDate]) {
//         groupedData[entryDate] = {
//           totalTime: 0,
//           details: [],
//         };
//       }

//       groupedData[entryDate].totalTime += Number(item.Time_Entries.Total_time )|| 0;
//       groupedData[entryDate].details.push(item);
//     }

//     // Step 3: Sort each group's details by Start_time
//     const response = Object.entries(groupedData)
//       .sort((a, b) => new Date(b[0]) - new Date(a[0])) // Sort Entry_Date descending
//       .map(([entryDate, group]) => {
//         group.details.sort((a, b) => {
//           const startTimeA = to24HourFormat(a.Time_Entries.Start_time);
//           const startTimeB = to24HourFormat(b.Time_Entries.Start_time);
//           return startTimeA.localeCompare(startTimeB);
//         });

//         return {
//           entryDate,
//           totalTime: group.totalTime,
//           details: group.details,
//         };
//       });

//     res.status(200).json({
//       success: true,
//       data: response,
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch project",
//       error: error.message,
//     });
//   }
// };



//Time Entried for specific date and and time 

const getTimeEntryByTaskId = async (req, res) => {
  const taskId = req.params.taskid;
  const { startDate, endDate } = req.query;

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // Step 1: Determine the date range
    let start = startDate;
    let end = endDate;

    if (!start || !end) {
      // Default to last 7 days
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);

      start = sevenDaysAgo.toISOString().split("T")[0];
      end = today.toISOString().split("T")[0];
    }

    // Step 2: Fetch Time Entries within the date range
    const query = `
      SELECT * FROM Time_Entries 
      WHERE Time_Entries.Task_ID = '${taskId}' 
      AND Time_Entries.Entry_Date BETWEEN '${start}' AND '${end}'
    `;
    const queryResp = await zcql.executeZCQLQuery(query);

    // Step 3: Group entries by Entry_Date
    const groupedData = {};

    for (const item of queryResp) {
      const entryDate = item.Time_Entries.Entry_Date;
      if (!groupedData[entryDate]) {
        groupedData[entryDate] = {
          totalTime: 0,
          details: [],
        };
      }

      groupedData[entryDate].totalTime += Number(item.Time_Entries.Total_time) || 0;
      groupedData[entryDate].details.push(item);
    }

    // Step 4: Sort each group's details by Start_time
    const response = Object.entries(groupedData)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .map(([entryDate, group]) => {
        group.details.sort((a, b) => {
          const startTimeA = to24HourFormat(a.Time_Entries.Start_time);
          const startTimeB = to24HourFormat(b.Time_Entries.Start_time);
          return startTimeA.localeCompare(startTimeB);
        });

        return {
          entryDate,
          totalTime: group.totalTime,
          details: group.details,
        };
      });

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: error.message,
    });
  }
};




const parseTime = (timeStr) => {
  let [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes; // Convert time to minutes
};

const checkTimeOverlap = (newStart, newEnd, existingEntries) => {
  for (const entry of existingEntries) {
    const timeEntry = entry.Time_Entries || entry; // Fix nested structure
    const existingStart = parseTime(timeEntry.Start_time);
    const existingEnd = parseTime(timeEntry.End_time);

    if (newStart < existingEnd && newEnd > existingStart) {
      return false; // Overlap detected
    }
  }
  return true; // No overlap
};

const createTimeEntry = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();
    const datastore = catalystApp.datastore();
    const table = datastore.table("Time_Entries");
    const taskData = req.body;

    const currDate = taskData.Entry_Date;
    const id = taskData.User_ID;

    const query = `SELECT * FROM Time_Entries WHERE User_ID = '${id}' AND Entry_Date = '${currDate}'`;
    const queryResp = await zcql.executeZCQLQuery(query);

    console.log("queryResp:", JSON.stringify(queryResp, null, 2)); // Debug log

    const newStart = parseTime(taskData.Start_time);
    const newEnd = parseTime(taskData.End_time);
  

    if (newEnd <= newStart || !checkTimeOverlap(newStart, newEnd, queryResp)) {
      return res
        .status(400)
        .json({ success: false, message: "Time slot overlaps or invalid" });
    }

    const createdRecord = await table.insertRow(taskData);
    res.status(200).json({ success: true, data: createdRecord });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add task",
      error: error.message,
    });
  }
};

const deleteTimeEntry = async (req, res) => {
  const ROWID = req.params.ROWID;
  //console.log(ROWID);

  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Time_Entries");

    const response = await table.deleteRow(ROWID);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
};

const updateTimeEntry = async (req, res) => {
  console.log("API hit");

  const ROWID = req.params.id;
  const taskData = req.body;

  if (!ROWID) {
    return res
      .status(400)
      .json({ success: false, message: "ROWID is required" });
  }
  if (!taskData || Object.keys(taskData).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Task data is required" });
  }

  console.log("Data at backend:", ROWID, taskData);

  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Time_Entries");

    const updatedRecord = await table.updateRow({ ROWID, ...taskData });

    res.status(200).json({
      success: true,
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};

// const getTimeEntryByProjectId = async (req, res) => {
//   const id = req.params.id;
//   try {
//     const catalystApp = req.catalystApp;
//     const zcql = catalystApp.zcql();

//     const query = `SELECT Time_Entries.Task_ID, Time_Entries.Task_Name 
//                    FROM Time_Entries 
//                    WHERE Project_ID = '${id}' 
//                    GROUP BY Time_Entries.Task_ID`;

//     const queryResp = await zcql.executeZCQLQuery(query);

//     const response = await Promise.all(
//       queryResp.map(async (item) => {
//         const queryAll = `SELECT * FROM Time_Entries WHERE Task_ID ='${item.Time_Entries.Task_ID}'`;
//         const queryRespAll = await zcql.executeZCQLQuery(queryAll);

//         queryRespAll.sort((a, b) => {
//           const startTimeA = to24HourFormat(a.Time_Entries.Start_time);
//           const startTimeB = to24HourFormat(b.Time_Entries.Start_time);
//           return startTimeA.localeCompare(startTimeB);
//         });

//         return {
//           Task_Id: item.Time_Entries.Task_ID,
//           Task_Name: item.Time_Entries.Task_Name,
//           details: queryRespAll,
//         };
//       })
//     );

//     console.log("response", response);

//     res.status(200).json({
//       message: "Fetch successful",
//       success: true,
//       data: response,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// const getTimeEntryByProjectId = async (req, res) => {
//   const id = req.params.id;

//   try {
//     const catalystApp = req.catalystApp;
//     const zcql = catalystApp.zcql();

//     // Get all time entries for the given project ID
//     const query = `SELECT * FROM Time_Entries WHERE Project_ID = '${id}'`;
//     const allEntries = await zcql.executeZCQLQuery(query);

//     // Group entries by Task_ID and sort details by Start_time
//     const taskMap = allEntries.reduce((acc, entry) => {
//       const taskId = entry.Time_Entries.Task_ID;
//       if (!acc[taskId]) {
//         acc[taskId] = {
//           Task_Id: taskId,
//           Task_Name: entry.Time_Entries.Task_Name,
//           details: [],
//         };
//       }
//       acc[taskId].details.push(entry);
//       return acc;
//     }, {});

//     // Sort details inside each task group by date (descending)
//     const response = Object.values(taskMap).map((task) => {
//       task.details.sort((a, b) => {
//         const dateA = new Date(a.Time_Entries.Entry_Date);
//         const dateB = new Date(b.Time_Entries.Entry_Date);
//         return dateB - dateA; // Descending
//       });
//       return task;
//     });

//     res.status(200).json({
//       message: "Fetch successful",
//       success: true,
//       data: response,
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

const getTimeEntryForExcel = async (req, res) => {
  const id = req.params.ROWID;
console.log("id",id);

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // Get all time entries for the given project
    const query = `SELECT * FROM Time_Entries WHERE Project_ID = '${id}'`;
    const allEntries = await zcql.executeZCQLQuery(query);

    // Group by Task_ID
    const taskMap = allEntries.reduce((acc, entry) => {
      const taskId = entry.Time_Entries.Task_ID;
      if (!acc[taskId]) {
        acc[taskId] = {
          Task_Id: taskId,
          Task_Name: entry.Time_Entries.Task_Name,
          details: [],
        };
      }
      acc[taskId].details.push(entry);
      return acc;
    }, {});

    // Sort by Date and Start_time (both in descending order)
    const response = Object.values(taskMap).map((task) => {
      task.details.sort((a, b) => {
        const dateA = new Date(a.Time_Entries.Entry_Date);
        const dateB = new Date(b.Time_Entries.Entry_Date);

        if (dateA.getTime() === dateB.getTime()) {
          // Convert time string to 24-hour format
          const timeA = to24HourFormat(a.Time_Entries.Start_time);
          const timeB = to24HourFormat(b.Time_Entries.Start_time);
          return timeB.localeCompare(timeA); // Descending
        }

        return dateB - dateA; // Descending by Date
      });
      return task;
    });

    res.status(200).json({
      message: "Fetch successful",
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


//For specific date and time 

const getTimeEntryByProjectId = async (req, res) => {
  const id = req.params.id;
  const { startDate, endDate } = req.query; // expected in YYYY-MM-DD format

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // Handle date filtering
    let fromDate = startDate;
    let toDate = endDate;

    // If dates are not provided, fallback to last 7 days (including today)
    if (!startDate || !endDate) {
      const currentDate = new Date();
      const sevenDaysAgo = new Date(currentDate);
      sevenDaysAgo.setDate(currentDate.getDate() - 6); // includes today

      fromDate = sevenDaysAgo.toISOString().split("T")[0];
      toDate = currentDate.toISOString().split("T")[0];
    }

    const dateCondition = `AND Entry_Date BETWEEN '${fromDate}' AND '${toDate}'`;

    // Fetch all entries for the project ID with date filtering
    const query = `SELECT * FROM Time_Entries WHERE Project_ID = '${id}' ${dateCondition}`;
    const allEntries = await zcql.executeZCQLQuery(query);

    // Group by Task_ID
    const taskMap = allEntries.reduce((acc, entry) => {
      const taskId = entry.Time_Entries.Task_ID;
      if (!acc[taskId]) {
        acc[taskId] = {
          Task_Id: taskId,
          Task_Name: entry.Time_Entries.Task_Name,
          details: [],
        };
      }
      acc[taskId].details.push(entry);
      return acc;
    }, {});

    // Sort each task's entries by Date ↓ and Start_time ↓
    const response = Object.values(taskMap).map((task) => {
      task.details.sort((a, b) => {
        const dateA = new Date(a.Time_Entries.Entry_Date);
        const dateB = new Date(b.Time_Entries.Entry_Date);

        if (dateA.getTime() === dateB.getTime()) {
          const timeA = to24HourFormat(a.Time_Entries.Start_time);
          const timeB = to24HourFormat(b.Time_Entries.Start_time);
          return timeB.localeCompare(timeA); // descending
        }

        return dateB - dateA; // descending by date
      });
      return task;
    });

    res.status(200).json({
      message: "Fetch successful",
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




module.exports = {
  getTimeEntryByTaskId,
  createTimeEntry,
  deleteTimeEntry,
  updateTimeEntry,
  getTimeEntryByProjectId,
  getTimeEntryForExcel,
};
