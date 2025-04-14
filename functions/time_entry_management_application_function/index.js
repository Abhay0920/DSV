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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const catalyst = require("zcatalyst-sdk-node");

app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Get a stratus instance
// const stratus = catalyst.stratus();
// console.log(stratus);

// Initialize Catalyst app
app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});

const {
  getAllProjects,
  getProjectsByUserId,
  createProject,
  updateProject,
  deleteProject,
} = require("./controller/projectController");
const {
  getAllTasks,
  getTasksByEmployee,
  createTask,
  updateTask,
  deleteTask,
} = require("./controller/taskController");

const {
  getTimeEntryByTaskId,
  createTimeEntry,
  deleteTimeEntry,
  updateTimeEntry,
  getTimeEntryByProjectId,
} = require("./controller/timeEntryController");

const {
  getAllUsers,
  deleteUser,
  updateUserStatus,
  addUser,
  getUserTasks,
  getUserProfile,
  updateUser,
} = require("./controller/employeeController");
const {
  updateProfile,
  updateCover,
  getProfile,
  getCover,
  updateProfileData,
  getProfileData,
} = require("./controller/profileController");
const { getResume, updateResume } = require("./controller/resumeController");
const { getFeedback, addFeedback } = require("./controller/feedbackController");

const {
  getAllIssues,
  createIssue,
  updateIssue,
  deleteIssue,
  getAllAssignIssues,
  getAllClientIssues,
} = require("./controller/issueController");

const {
  getClientProjects,
  getOrgContact,
  updateClient,
  createClient,
  getClientOrg,
  addContact,
  getContact,
  getClientTasks,
  getClientData,
  deleteORG,
  deleteClient,
} = require("./controller/clientController");

// Project Api..---------------------------------------------------------------------------------------------
app.get("/projects", getAllProjects);
app.get("/projects/:userid", getProjectsByUserId);
app.post("/projects", createProject);
app.post("/projects/:ROWID", updateProject);
app.delete("/delete/:ROWID", deleteProject);

// Tasks Api..---------------------------------------------------------------------------------------------
app.get("/tasks", getAllTasks);
app.get("/tasks/employee/:userid", getTasksByEmployee);
app.post("/tasks", createTask);
app.post("/tasks/:ROWID", updateTask);
app.delete("/tasks/:ROWID", deleteTask);

// TimeEntry Api..---------------------------------------------------------------------------------------------
app.get("/timeentry/:taskid", getTimeEntryByTaskId);
app.post("/timeentry", createTimeEntry);
app.delete("/timeentry/:ROWID", deleteTimeEntry);
app.post("/timeentry/:id", updateTimeEntry);
app.get("/time_entry/project/:id", getTimeEntryByProjectId);

//Employee Api...-------------------------------------------------------------------------------------------------
app.get("/employee", getAllUsers);
app.post("/employee/:user_ID", deleteUser);
app.post("/employee/:active/:user_ID", updateUserStatus);
app.post("/AddEmployees", addUser);
app.post("/UpdateEmployee/:userId", updateUser);
app.get("/employees/:User_Id", getUserTasks);
app.get("/emp/:User_Id", getUserProfile);

//Profile Api....-------------------------------------------------------------------
app.post("/userprofile/:user_ID", updateProfile);
app.post("/usercover/:user_ID", updateCover);
app.get("/userprofile/:user_ID", getProfile);
app.get("/usercover/:user_ID", getCover);
app.post("/profile/update/:id", updateProfileData);
app.get("/profile/data/:id", getProfileData);

// resume api..----------------------------------------------
app.get("/resume/:user_ID", getResume);
app.post("/resume/:user_ID", updateResume);

// Feedback Api..---------------------------------------------------------------------------------------------
app.get("/feedback", getFeedback);
app.post("/feedback", addFeedback);

//Issue  Api..---------------------------------------------------------------------------------------------
app.get("/issue", getAllIssues);
app.get("/assignissue/:userID", getAllAssignIssues);
app.get("/clientissue/:userID", getAllClientIssues);
app.post("/issue", createIssue);
app.post("/issue/:ROWID", updateIssue);
app.delete("/issue/:ROWID", deleteIssue);

//Client Api..---------------------------------------------------------------------------------------------
app.get("/contactData/:userID", getClientData);
app.post("/addContact", addContact);
app.get("/contact", getContact);
app.get("/contact/:id", getOrgContact);
app.get("/clientOrg", getClientOrg);
app.get("/clientProject/:id", getClientProjects);
app.get("/contact/tasks/:id", getClientTasks);
app.post("/createClient", createClient);
app.post("/updateClient/:ROWID", updateClient);
app.delete("/contact", deleteClient);
app.delete("/org", deleteORG);

app.use((req, res) => {
  res.status(404).send("The page you are looking for does not exist.");
});

module.exports = app;
