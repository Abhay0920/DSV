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

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Projects");
    const records = await table.getAllRows();

    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error("Error fetching all projects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};
// Get projects by user ID
const getProjectsByUserId = async (req, res) => {
  try {
    const userID = req.params.userid;
    if (!userID) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // Get all tasks and filter those containing the userID
    const tasksResp = await zcql.executeZCQLQuery(
      `SELECT ProjectID, Assign_To_ID FROM Tasks WHERE Status != 'Completed'`
    );

    if (!tasksResp || tasksResp.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tasks found",
      });
    }

    // Filter tasks where userID exists in the comma-separated string
    const relevantTasks = tasksResp.filter((task) => {
      const assignedIds = task.Tasks.Assign_To_ID.split(",").map((id) =>
        id.trim()
      );
      return assignedIds.includes(userID);
    });

    if (relevantTasks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tasks found for this user",
      });
    }

    // Get unique project IDs
    const projectIds = [
      ...new Set(relevantTasks.map((task) => task.Tasks.ProjectID)),
    ];

    const projectsResp = await zcql.executeZCQLQuery(
      `SELECT * FROM Projects WHERE ROWID IN (${projectIds.join(
        ","
      )}) ORDER BY CREATEDTIME DESC`
    );

    if (!projectsResp || projectsResp.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No projects found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      data: projectsResp,
    });
  } catch (error) {
    console.error("Error fetching projects by user:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching project data",
      error: error.message,
    });
  }
};
// Create new project
const createProject = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Projects");
    const projectData = req.body;

    const createdRecord = await table.insertRow(projectData);

    res.status(201).json({
      success: true,
      data: createdRecord,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add project",
      error: error.message,
    });
  }
};
// Update project
const updateProject = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const { ROWID } = req.params;
    const updateProjectData = req.body;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Projects");

    const updatedRow = await table.updateRow({
      ROWID,
      ...updateProjectData,
    });

    res.status(200).json({
      success: true,
      data: updatedRow,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const { ROWID } = req.params;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Projects");

    await table.deleteRow(ROWID);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message,
    });
  }
};

// Export all functions
module.exports = {
  getAllProjects,
  getProjectsByUserId,
  createProject,
  updateProject,
  deleteProject,
};
