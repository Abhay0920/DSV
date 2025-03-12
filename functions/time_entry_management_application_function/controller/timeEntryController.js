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

const getTimeEntryByTaskId = async (req, res) => {
  const taskId = req.params.taskid;

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // Fetch grouped data by entry date with the sum of total time, but filtered by Task_ID
    const query = `SELECT Time_Entries.Entry_Date, SUM(Time_Entries.Total_time) 
                   FROM Time_Entries 
                   WHERE Time_Entries.Task_ID = '${taskId}' 
                   GROUP BY Time_Entries.Entry_Date 
                   ORDER BY Time_Entries.Entry_Date DESC`;
    const queryResp = await zcql.executeZCQLQuery(query);

    const response = [];

    // Loop through each grouped entry and fetch detailed data
    for (const item of queryResp) {
      const queryAll = `SELECT * FROM Time_Entries 
                        WHERE Time_Entries.Entry_Date = '${item.Time_Entries.Entry_Date}' 
                        AND Time_Entries.Task_ID = '${taskId}' 
                        ORDER BY Time_Entries.CREATEDTIME ASC`; // Sorting by Start_Time
      const queryRespAll = await zcql.executeZCQLQuery(queryAll);

      queryRespAll.sort((a, b) => {
        const startTimeA = to24HourFormat(a.Time_Entries.Start_time);
        const startTimeB = to24HourFormat(b.Time_Entries.Start_time);
        return startTimeA.localeCompare(startTimeB);
      });

      console.log("data at backend", queryRespAll);

      response.push({
        entryDate: item.Time_Entries.Entry_Date,
        totalTime: item.Time_Entries.Total_time,
        details: queryRespAll,
      });
    }

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
const createTimeEntry = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Time_Entries");
    //console.log("ok");
    const taskData = req.body;
    const createdRecord = await table.insertRow(taskData);
    res.status(200).json({
      success: true,
      data: createdRecord,
    });
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

const getTimeEntryByProjectId = async (req, res) => {
  const id = req.params.id;
  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    const query = `SELECT Time_Entries.Task_ID, Time_Entries.Task_Name 
                   FROM Time_Entries 
                   WHERE Project_ID = '${id}' 
                   GROUP BY Time_Entries.Task_ID`;

    const queryResp = await zcql.executeZCQLQuery(query);

    const response = await Promise.all(
      queryResp.map(async (item) => {
        const queryAll = `SELECT * FROM Time_Entries WHERE Task_ID ='${item.Time_Entries.Task_ID}'`;
        const queryRespAll = await zcql.executeZCQLQuery(queryAll);

        queryRespAll.sort((a, b) => {
          const startTimeA = to24HourFormat(a.Time_Entries.Start_time);
          const startTimeB = to24HourFormat(b.Time_Entries.Start_time);
          return startTimeA.localeCompare(startTimeB);
        });

        return {
          Task_Id: item.Time_Entries.Task_ID,
          Task_Name: item.Time_Entries.Task_Name,
          details: queryRespAll,
        };
      })
    );

    console.log("response", response);

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
};
