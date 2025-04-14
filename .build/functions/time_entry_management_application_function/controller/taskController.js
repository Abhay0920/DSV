"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

const getAllTasks = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    try {
      const catalystApp = req.catalystApp;
      const datastore = catalystApp.datastore();
      const table = datastore.table("Tasks");
      const records = await table.getAllRows();

      res.status(200).json({
        success: true,
        data: records,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch tasks",
        error: error.message,
      });
    }
  } else {
    try {
      const catalystApp = req.catalystApp;
      const zcql = catalystApp.zcql();
      const datastore = catalystApp.datastore();

      const query = `SELECT * FROM Projects WHERE ROWID = ${id}`;
      const queryResp = await zcql.executeZCQLQuery(query);

      res.status(200).json({
        success: true,
        data: queryResp,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch project",
        error: error.message,
      });
    }
  }
};

const getTasksByEmployee = async (req, res) => {
  try {
    const userID = req.params.userid;
    if (!userID) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // Get all tasks and filter for the specific user
    const tasksResp = await zcql.executeZCQLQuery(`SELECT * FROM Tasks`);

    if (!tasksResp || tasksResp.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No tasks found" });
    }

    // Filter tasks where userID exists in the comma-separated Assign_To_ID
    const userTasks = tasksResp.filter((task) => {
      const assignedIds = task.Tasks.Assign_To_ID.split(",").map((id) =>
        id.trim()
      );
      return assignedIds.includes(userID);
    });

    if (userTasks.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No tasks found for this user" });
    }

    console.log("tasks at backend", userTasks);

    // Format the response data
    const formattedTasks = userTasks.map((task) => ({
      ROWID: task.Tasks.ROWID,
      Task_Name: task.Tasks.Task_Name,
      Project_Name: task.Tasks.Project_Name,
      Project_ID: task.Tasks.ProjectID,
      Status: task.Tasks.Status,
      Assign_To_ID: task.Tasks.Assign_To_ID,
      Assign_To: task.Tasks.Assign_To,
      Start_Date: task.Tasks.Start_Date,
      End_Date: task.Tasks.End_Date,
      Description: task.Tasks.Description,
    }));

    return res.status(200).json({
      success: true,
      data: formattedTasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching tasks",
      error: error.message,
    });
  }
};
const createTask = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Tasks");
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
const updateTask = async (req, res) => {
  const ROWID = req.params.ROWID;
  const updateData = req.body;

  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Tasks");

    const response = await table.updateRow({
      ROWID,
      ProjectID: updateData.ProjectID,
      Project_Name: updateData.Project_Name,
      Assign_To: updateData.Assign_To,
      Assign_To_ID: updateData.Assign_To_ID,
      Task_Name: updateData.Task_Name,
      UserID: updateData.UserID,
      Status: updateData.Status,
      Start_Date: updateData.Start_Date,
      End_Date: updateData.End_Date,
      Description: updateData.Description,
    });

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  const ROWID = req.params.ROWID;
  //console.log(ROWID);

  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Tasks");

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

module.exports = {
  getAllTasks,
  getTasksByEmployee,
  createTask,
  updateTask,
  deleteTask,
};
