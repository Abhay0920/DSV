"use strict";
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

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

const getAllUsers = async (req, res) => {
  try {
    const catalystApp = catalyst.initialize(req);

    const userManagement = catalystApp.userManagement();
    const users = await userManagement.getAllUsers();

    // Respond with the user data
    res.status(200).json({
      message: "Users fetched successfully",
      users: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};
const deleteUser = async (req, res) => {
  const user_ID = req.params.user_ID;
  const reassignments = req.body; // Array of tasks that need reassignment

  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Tasks");
    const zcql = catalystApp.zcql();

    // Fetch all active tasks
    const query = `SELECT * FROM Tasks WHERE Status != 'Completed'`;
    const tasks = await zcql.executeZCQLQuery(query);

    // Process each task that has the user assigned
    await Promise.all(
      tasks.map(async (task) => {
        const assignedIds = task.Tasks.Assign_To_ID.split(",").map((id) =>
          id.trim()
        );

        // Only process if user is actually assigned to this task
        if (assignedIds.includes(user_ID)) {
          const assignedNames = task.Tasks.Assign_To.split(",").map((name) =>
            name.trim()
          );

          // Check if this task needs reassignment (solo task)
          const reassignment = reassignments.find(
            (r) => r.Task_ID === task.Tasks.ROWID
          );

          if (reassignment) {
            // This is a solo task, replace with new assignee
            await table.updateRow({
              ROWID: task.Tasks.ROWID,
              Assign_To: reassignment.assigned_To,
              Assign_To_ID: reassignment.assigned_To_Id,
            });
          } else {
            // This is a group task, just remove the user
            const userIndex = assignedIds.indexOf(user_ID);
            assignedIds.splice(userIndex, 1);
            assignedNames.splice(userIndex, 1);

            await table.updateRow({
              ROWID: task.Tasks.ROWID,
              Assign_To: assignedNames.join(", "),
              Assign_To_ID: assignedIds.join(", "),
            });
          }
        }
      })
    );

    // Delete the user after all tasks are updated
    let userManagement = catalystApp.userManagement();
    const response = await userManagement.deleteUser(user_ID);

    res.status(200).json({
      success: true,
      message: "User and task assignments updated successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error processing user deletion:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process user deletion",
      error: error.message,
    });
  }
};
const { USER_STATUS } = require("zcatalyst-sdk-node/lib/user-management/user-management");

const updateUserStatus = async (req, res) => {
  const user_ID = req.params.user_ID;
  const active = req.params.active !== "ACTIVE";

  console.log("id at backend", user_ID, active);

  if (!user_ID || typeof active !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Invalid parameters",
    });
  }

  try {
    const catalystApp = req.catalystApp;
    let userManagement = catalystApp.userManagement();

    const response = await userManagement.updateUserStatus(
      user_ID,
      active ? "enable" : "disable"
    );

    console.log("response", response);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

const addUser = async (req, res) => {
  const data = req.body;
  console.log("adssad", data);
  if (!data.first_name || !data.last_name || !data.email_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const signupConfig = {
      platform_type: "web",
      template_details: {
        senders_mail: "aj637061@gmail.com",
        subject: "Welcome to %APP_NAME%",
        message: `<p>Hello ,</p> 
                  <p>Follow this link to join in %APP_NAME% .</p> 
                  <p><a href='%LINK%'>%LINK%</a></p> 
                  <p>If you didn't ask to join the application, you can ignore this email.</p> 
                  <p>Thanks,</p> 
                  <p>Your %APP_NAME% team</p>`,
      },
    };

    const userConfig = {
      first_name: data.first_name,
      last_name: data.last_name,
      email_id: data.email_id,
      org_id: 10095488403,
      role_id: data.role_id,
    };
    console.log("userConfig", userConfig);

    const catalystApp = req.catalystApp;
    const userManagement = catalystApp.userManagement();
    const addedUser = await userManagement.addUserToOrg(
      signupConfig,
      userConfig
    );

    if (
      !addedUser ||
      !addedUser.user_details ||
      !addedUser.user_details.user_id
    ) {
      throw new Error("Failed to retrieve user ID after adding.");
    }

    const newUserID = addedUser.user_details.user_id;
    const userName = `${data.first_name} ${data.last_name}`;
    const defaultResume = "123";

    const a = "";

    const zcql = catalystApp.zcql();
    const query = `INSERT INTO Users VALUES (${newUserID}, '${userName}', ${defaultResume}, 
      'Add Your Address', 9999999999, 'Tell About You', 'Your Skills', '', '')`;

    await zcql.executeZCQLQuery(query);

    res.status(200).json({
      message: "User added successfully",
      data: addedUser,
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({
      message: "Failed to add user",
      error: error.message,
    });
  }
};
const updateUser = async (req, res) => {
  const userId = req.params.userId;
  const data = req.body;

  try {
    const catalystApp = req.catalystApp;
    const userManagement = catalystApp.userManagement();
    const updatedUser = await userManagement.updateUserDetails(userId, data);

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
};
const getUserTasks = async (req, res) => {
  const userId = req.params.User_Id;
  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();
    const datastore = catalystApp.datastore();

    const query = `SELECT * FROM Tasks WHERE Assign_To_ID = ${userId} and Status != 'Completed'`;
    const queryResp = await zcql.executeZCQLQuery(query);

    res.status(200).json({
      success: true,
      data: queryResp,
    });
  } catch (error) {
    //console.log(error);
  }
};
const getUserProfile = async (req, res) => {
  const userId = req.params.User_Id;
  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // Fetch all tasks
    const query = `SELECT * FROM Tasks`;
    const queryResp = await zcql.executeZCQLQuery(query);

    // Filter tasks where Assign_To_ID contains this userId
    const filteredTasks = queryResp.filter((task) => {
      const assignedIds = task.Tasks.Assign_To_ID.split(",").map((id) =>
        id.trim()
      );
      return assignedIds.includes(userId.toString()); // Check if userId is present
    });

    res.status(200).json({
      success: true,
      data: filteredTasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  updateUserStatus,
  addUser,
  updateUser,
  getUserTasks,
  getUserProfile,
};
