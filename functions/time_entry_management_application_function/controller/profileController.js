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

// Initialize Catalyst app
app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});


const updateProfile = async (req, res) => {
  const user_ID = req.params.user_ID;
  const profileURL = req.body.profileLink;
  console.log("backend", user_ID, profileURL);

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();
    const query = `UPDATE Users SET Users.Profile_Link = '${profileURL}' WHERE Users.User_Id = '${user_ID}'`;
    const queryResp = await zcql.executeZCQLQuery(query);

    res.status(200).json({
      success: "true",
      data: queryResp,
    });
  } catch (err) {
    res.status(200).json({
      success: "false",
    });
  }
};
const updateCover = async (req, res) => {
  const user_ID = req.params.user_ID;
  const coverURL = req.body.coverLink;
  console.log("backend", user_ID, coverURL);

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();
    const query = `UPDATE Users SET Users.Cover_Link = '${coverURL}' WHERE Users.User_Id = '${user_ID}'`;
    const queryResp = await zcql.executeZCQLQuery(query);

    res.status(200).json({
      success: "true",
      data: queryResp,
    });
  } catch (err) {
    res.status(200).json({
      success: "false",
    });
  }
};
const getProfile = async (req, res) => {
  const user_ID = req.params.user_ID;

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    const query = `SELECT Profile_Link FROM Users where Users.User_Id='${user_ID}'`;
    const queryResp = await zcql.executeZCQLQuery(query);
    const profileURL = queryResp[0].Users.Profile_Link;

    console.log("seew", queryResp);

    res.status(200).json({
      success: "true",
      data: profileURL,
    });
  } catch (err) {
    res.status(200).json({
      success: "false",
    });
  }
};
const getCover = async (req, res) => {
  const user_ID = req.params.user_ID;

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    const query = `SELECT Cover_Link FROM Users where Users.User_Id='${user_ID}'`;
    const queryResp = await zcql.executeZCQLQuery(query);
    const coverURL = queryResp[0].Users.Cover_Link;

    res.status(200).json({
      success: "true",
      data: coverURL,
    });
  } catch (err) {
    res.status(200).json({
      success: "false",
    });
  }
};
const updateProfileData = async (req, res) => {
  const id = req.params.id;
  console.log("Received userId:", id);

  console.log(req.body);
  const { Address, Phone, AboutME, Skills } = req.body;

  console.log("Processing update...");

  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();

    // Step 1: Fetch the user from the Users table
    const query = `SELECT * FROM Users WHERE User_Id = '${id}'`;
    const user = await zcql.executeZCQLQuery(query);

    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Step 2: If the user exists, update their details
    const updateQuery = `UPDATE Users SET Address = '${Address}', Phone = '${Phone}', AboutME = '${AboutME}', Skills = '${Skills}' WHERE User_Id = '${id}'`;

    const updateResponse = await zcql.executeZCQLQuery(updateQuery);

    console.log("Update successful:", updateResponse);

    // Send a success response with the updated data
    res.status(200).json({
      success: true,
      data: updateResponse,
    });
  } catch (error) {
    console.log("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Could not update profile.",
    });
  }
};
const getProfileData = async (req, res) => {
  const id = req.params.id;
  try {
    const catalystApp = req.catalystApp;
    const zcql = catalystApp.zcql();
    const query = `SELECT * FROM Users WHERE User_Id = '${id}'`;
    const user = await zcql.executeZCQLQuery(query);
    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      data: user[0],
    });
  } catch (error) {
    console.log("Error fetching profile data:", error);
  }
};

module.exports = {
  updateProfile,
  updateCover,
  getProfile,
  getCover,
  updateProfileData,
  getProfileData,
};
