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


const getResume = async (req, res) => {
    try {
      const user_ID = req.params.user_ID;
      const catalystApp = req.catalystApp;
      const filestore = catalystApp.filestore();
      const zcql = catalystApp.zcql();
      let query = `SELECT * FROM Users WHERE Users.User_Id = ${user_ID}`;
      let queryResp = await zcql.executeZCQLQuery(query);
  
      if (queryResp.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }
      const resumeID = queryResp[0].Users.Resume_id;
      let folder = await filestore.folder("1380000001203716");
      let downloadFile = await folder.downloadFile(resumeID);
      //console.log("file at backend", downloadFile);
  
      // Set response headers to indicate a file attachment (PDF in this case)
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", downloadFile.length);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${user_ID}_Resume.pdf`
      );
  
      // Send the file buffer as the response
      res.end(downloadFile); // Make sure to send the buffer directly
    } catch (error) {
      console.error("Error in downloading files:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  };

  const updateResume = async (req, res) => {
    try {
      const user_ID = req.params.user_ID;
    const catalystApp = req.catalystApp;

    if (!req.files || !req.files.resume) {
    return res
        .status(400)
        .json({ success: false, message: "No file uploaded." });
    }

    const filestore = catalystApp.filestore();
    let resumeID = null;

    // Helper function to upload file
    const uploadFile = async (file, folderId) => {
    const tempFilePath = path.join(os.tmpdir(), file.name);
    await file.mv(tempFilePath);
    const folder = filestore.folder(folderId);
    const uploadResponse = await folder.uploadFile({
        code: fs.createReadStream(tempFilePath),
        name: file.name,
    });
    return uploadResponse?.id || null;
    };

    // Upload profile image if provided
    if (req.files.resume) {
    resumeID = await uploadFile(req.files.resume, "1380000001203716");
    //console.log("resumeID", resumeID);
    if (!resumeID) {
        return res
        .status(400)
        .json({ success: false, message: "Error in profile image upload." });
    }
    }

    const zcql = catalystApp.zcql();
    let query = `SELECT * FROM Users WHERE Users.User_Id = ${user_ID}`;
    let queryResp = await zcql.executeZCQLQuery(query);

    if (queryResp.length === 0) {
    return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    const oldResumeID = queryResp[0].Users.Resume_id;
    //console.log(resumeID, oldResumeID);

    // Helper function to delete old file
    const deleteFile = async (fileId, folderId) => {
    if (fileId) {
        const folder = filestore.folder(folderId);
        try {
        await folder.deleteFile(fileId);
        //console.log(`File ${fileId} deleted successfully.`);
        } catch (error) {
        console.error(`Failed to delete file ${fileId}:`, error);
        }
    }
    };

    // Delete old profile image
    if (oldResumeID) {
    await deleteFile(oldResumeID, "1380000001203716");
    }

    // Build the update query dynamically
    let updateQuery = `UPDATE Users SET `;
    let setFields = [];

    if (resumeID) {
    setFields.push(`Resume_id = '${resumeID}'`);
    }

    updateQuery += setFields.join(", ") + ` WHERE User_Id = '${user_ID}'`;
    await zcql.executeZCQLQuery(updateQuery);

    return res.status(200).json({
    success: true,
    message: "Files uploaded and user profile updated successfully.",
    resumeID,
    });
} catch (error) {
    console.error("Error uploading files:", error);
    return res
    .status(500)
    .json({ success: false, message: "Internal server error." });
}
};

module.exports = {
  getResume,
  updateResume,
};
  