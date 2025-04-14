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
const { container } = require("webpack");
const { findPackageJSON } = require("module");
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Catalyst app
app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});

const contactDashBoard = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Client ID is required",
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();

    const projectQuery = `SELECT * FROM Client_Contact WHERE OrgID = ${id}`;
    const response = await catalystApp.zcql().executeZCQLQuery(query);
    const formattedResponse = response.map(
      (contact) => contact?.Client_Contact
    );
    const orgQuery = `SELECT * FROM Client_Org WHERE ROWID = ${id}`;
    const orgResponse = await catalystApp.zcql().executeZCQLQuery(orgQuery);
    const formattedOrgResponse = orgResponse.map(
      (contact) => contact?.Client_Org
    );
    const orgName = formattedOrgResponse[0]?.Org_Name;
    const orgId = formattedOrgResponse[0]?.ROWID;
    const orgContact = formattedResponse.map((contact) => ({
      ...contact,
      Org_Name: orgName,
      OrgID: orgId,
    }));
    res.status(200).json({
      success: true,
      data: orgContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client contacts",
      error: error.message,
    });
  }
};

const getClientData = async (req, res) => {
  try {
    const id = req.params.userID;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }
    const catalystApp = req.catalystApp;
    const query = `SELECT * FROM Client_Contact WHERE UserID = ${id}`;
    const response = await catalystApp.zcql().executeZCQLQuery(query);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client data",
      error: error.message,
    });
  }
};
const getClientOrg = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Client_Org");
    const response = await table.getAllRows();
    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client organizations",
      error: error.message,
    });
  }
};
const getOrgContact = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }
    const catalystApp = req.catalystApp;

    const query = `SELECT * FROM Client_Contact WHERE OrgID = ${id}`;
    const response = await catalystApp.zcql().executeZCQLQuery(query);

    const formattedResponse = response.map(
      (contact) => contact?.Client_Contact
    );

    res.status(200).json({
      success: true,
      data: formattedResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client contacts",
      error: error.message,
    });
  }
};
const getContact = async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Client_Contact");
    const response = await table.getAllRows();

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client contacts",
      error: error.message,
    });
  }
};
const createClient = async (req, res) => {
  try {
    const clientData = req.body;
    if (!clientData) {
      return res.status(400).json({
        success: false,
        message: "Client data is required",
      });
    }

    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Client_Org");
    const record = await table.insertRow(clientData);

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create client",
      error: error.message,
    });
  }
};
const updateClient = async (req, res) => {
  try {
    const clientData = req.body;
    const id = req.params.ROWID;

    if (!clientData || !id) {
      return res.status(400).json({
        success: false,
        message: "Client data and ID are required",
      });
    }

    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();
    const table = datastore.table("Client_Org");
    const record = await table.updateRow({ ROWID: id, ...clientData });

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update client",
      error: error.message,
    });
  }
};
const addContact = async (req, res) => {
  const { first_name, last_name, email_id, org_name, org_id, phone } = req.body;

  // Validate required fields
  if (!first_name || !last_name || !email_id) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  try {
    // Configuration for the welcome email
    const signupConfig = {
      platform_type: "web",
      template_details: {
        senders_mail: "aj637061@gmail.com",
        subject: "Welcome to %APP_NAME%",
        message: `<p>Hello ${first_name},</p> 
                    <p>Follow this link to join %APP_NAME%.</p> 
                    <p><a href='%LINK%'>%LINK%</a></p> 
                    <p>If you didn't request to join the application, you can ignore this email.</p> 
                    <p>Thanks,</p> 
                    <p>Your %APP_NAME% team</p>`,
      },
    };

    // User configuration
    const userConfig = {
      first_name: first_name,
      last_name: last_name,
      email_id: email_id,
      org_id: 10095488403,
      role_id: 1380000001278009,
    };

    // Add user to the system
    const catalystApp = req.catalystApp;
    const userManagement = catalystApp.userManagement();
    const addedUser = await userManagement.addUserToOrg(
      signupConfig,
      userConfig
    );

    // Check if the user was successfully added
    if (
      !addedUser ||
      !addedUser.user_details ||
      !addedUser.user_details.user_id
    ) {
      throw new Error("Failed to retrieve user ID after adding.");
    }

    const newUserID = addedUser.user_details.user_id;
    console.log("New User ID:", newUserID);
    console.log("Added User Details:", {
      First_Name: first_name,
      Last_Name: last_name,
      Org_Name: org_name,
      OrgID: org_id,
      Email: email_id,
      UserID: newUserID,
    });

    const datastore = catalystApp.datastore();
    const table = datastore.table("Client_Contact");
    const response = await table.insertRow({
      First_Name: first_name,
      Last_Name: last_name,
      Org_Name: org_name,
      OrgID: org_id,
      Email: email_id,
      UserID: newUserID,
      Phone: phone,
    });

    // Respond with success message
    res.status(200).json({
      message: "User added successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error adding user:", error);

    // Respond with a proper error message
    res.status(500).json({
      message: "Failed to add user",
      error: error.message || error.toString(),
    });
  }
};

const getClientProjects = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    const catalystApp = req.catalystApp;
    const query = `SELECT * FROM Projects WHERE Client_ID = ${id}`;
    const response = await catalystApp.zcql().executeZCQLQuery(query);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client projects",
      error: error.message,
    });
  }
};

const getClientTasks = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      });
    }

    const catalystApp = req.catalystApp;
    const query = `SELECT * FROM Projects WHERE Client_ID= ${id}`;
    const ProjectResponse = await catalystApp.zcql().executeZCQLQuery(query);

    const projectIds = ProjectResponse.map((project) => project.Projects.ROWID);

    const taskResponse = await Promise.all(
      projectIds.map(async (projectId) => {
        const taskQuery = `SELECT * FROM Tasks WHERE ProjectID =  '${projectId}'`;
        return await catalystApp.zcql().executeZCQLQuery(taskQuery);
      })
    );

    const flattenedTasks = taskResponse.flat();
    const formattedResponse = flattenedTasks.map((task) => task.Tasks);

    res.status(200).json({
      success: true,
      data: formattedResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch client tasks",
      error: error.message,
    });
  }
};

const deleteORG = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "ORG ID is required",
    });
  }

  try {
    const catalystApp = req.catalystApp;
    const datastore = catalystApp.datastore();

    const query = `SELECT * FROM Client_Contact WHERE OrgID = ${id}`;
    const response = await catalystApp.zcql().executeZCQLQuery(query);

    if (response.length > 0) {
      return res.status(200).json({
        success: false,
        data: response,
        message: "Cannot delete org with existing contacts",
      });
    }

    const table = datastore.table("Client_Org");
    await table.deleteRow(id);

    res.status(200).json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete client",
      error: error.message,
    });
  }
};

const deleteClient = async (req, res) => {
  try {
    const ROWID = req.body.ROWID;
    const USERID = req.body.USERID;

    console.log("Deleting client with ID:", ROWID);
    console.log("Deleting user with ID:", USERID);

    if (!ROWID || !USERID) {
      return res.status(400).json({
        success: false,
        message: "Client ID and User ID are required",
      });
    }

    const catalystApp = req.catalystApp;
    const userManagement = catalystApp.userManagement();
    await userManagement.deleteUser(USERID);

    const datastore = catalystApp.datastore();
    const table = datastore.table("Client_Contact");
    await table.deleteRow(ROWID);

    res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete client",
      error: error.message,
    });
  }
};

module.exports = {
  getClientData,
  getContact,
  addContact,
  getOrgContact,
  createClient,
  updateClient,
  getClientOrg,
  getClientProjects,
  getClientTasks,
  deleteClient,
  deleteORG,
};
