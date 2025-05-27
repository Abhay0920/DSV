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
require("dotenv").config();

const catalyst = require("zcatalyst-sdk-node");

app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));


// … after your other app.post routes …


const env = process.env.CATALYST_USER_ENVIRONMENT;
console.log("Environment = ", env);






// Initialize Catalyst app
app.use((req, res, next) => {
  req.catalystApp = catalyst.initialize(req);
  next();
});

app.get("/test",async(req,res)=>{
  console.log("Environment = ", env);
})

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
  tasksByProject,
  createTask,
  updateTask,
  deleteTask,
  tasksByProjectAndUser,
} = require("./controller/taskController");

const {
  getTimeEntryByTaskId,
  createTimeEntry,
  deleteTimeEntry,
  updateTimeEntry,
  getTimeEntryByProjectId,
  getTimeEntryForExcel,
} = require("./controller/timeEntryController");

const {
  getAllUsers,
  deleteUser,
  updateUserStatus,
  addUser,
  getUserTasks,
  getUserProfile,
  updateUser,
  getUnassignedEmployees,
  reInvitedEmployee,
} = require("./controller/employeeController");

const {
  updateProfile,
  updateCover,
  getProfile,
  getCover,
  updateProfileData,
  getProfileData,
  batchProfileData
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
  projectIssues,
  assignIssue,
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
  updateClientContactStatus
} = require("./controller/clientController");

const sendNotification = require("./controller/notificationController");

app.post("/sendNotification", sendNotification);




// Project Api..---------------------------------------------------------------------------------------------
app.get("/projects", getAllProjects);
app.get("/projects/:userid", getProjectsByUserId);
app.post("/projects", createProject);
app.post("/projects/:ROWID", updateProject);
app.delete("/delete/:ROWID", deleteProject);
app.get("/dowloadExcel/:ROWID",getTimeEntryForExcel);

// Tasks Api..---------------------------------------------------------------------------------------------
app.get("/tasks", getAllTasks);
app.get("/tasks/employee/:userid", getTasksByEmployee);
app.get("/tasks/project/:id", tasksByProject);
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
app.get("/unassignedEmployees", getUnassignedEmployees);
app.post("/reInviteEmployees",reInvitedEmployee);

//Profile Api....-------------------------------------------------------------------
app.post("/userprofile/:user_ID", updateProfile);
app.post("/usercover/:user_ID", updateCover);
app.get("/userprofile/:user_ID", getProfile);
app.get("/usercover/:user_ID", getCover);
app.post("/profile/update/:id", updateProfileData);
app.get("/profile/data/:id", getProfileData);
app.post("/batchProfile",batchProfileData);


// resume api..----------------------------------------------
app.get("/resume/:user_ID", getResume);
app.post("/resume/:user_ID", updateResume);

// Feedback Api..---------------------------------------------------------------------------------------------
app.get("/feedback", getFeedback);
app.post("/feedback", addFeedback);

//Issue  Api..---------------------------------------------------------------------------------------------
app.get("/issue", getAllIssues);
app.get("/projectIssues/:userID", projectIssues);
app.get("/assignissue/:userID", getAllAssignIssues);
app.get("/clientissue/:userID", getAllClientIssues);
app.post("/issue", createIssue);
app.post("/issue/:ROWID", updateIssue);
app.delete("/issue/:ROWID", deleteIssue);
app.post("/assignIssue/:ROWID", assignIssue);

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
app.delete("/org/:id", deleteORG);
app.post("/updateClientContactStatus",updateClientContactStatus);

app.get("/taskByProjectAndUser",tasksByProjectAndUser);




const sendEmail = async (emailconfig, catapp) => {
	return new Promise(async (resolve, reject) => {
		try {
			let catemail = catapp.email();
			let mailPromise = await catemail.sendMail(emailconfig);
            // console.log('Email sent successfully');
			resolve(mailPromise);
		} catch (error) {
            console.log("Error sending email: ", error);
			reject(error);
		}
	});
};


//     await sendEmail(emailConfig, catalystApp);

app.post("/sendEmail", async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    
    // const users = await catalystApp.userManagement().getAllUsers();
    // console.log("Users: ", users);

    const users=[
      {
        zuid: '10095630092',
        zaaid: '10095488403',
        org_id: '10095488403',
        status: 'ACTIVE',
        is_confirmed: true,
        email_id: 'abhay@dsvcorp.com.au',
        first_name: 'Aman',
        last_name: 'Jain',
        created_time: 'Feb 12, 2025 04:02 PM',
        modified_time: 'Apr 07, 2025 04:45 PM',
        invited_time: 'Feb 12, 2025 04:02 PM',
        role_details: { role_name: 'App User', role_id: '1380000001199208' },
        user_type: 'App User',
        source: 'Email',
        user_id: '1380000001198369',
        locale: 'us|en_us|America/Los_Angeles',
        time_zone: 'America/Los_Angeles'
      } 
    ]
    
  

    const emailTasks = users.map(({ first_name, email_id }) => {
//       const htmlContent = `
//        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    
//   <div style="margin-bottom: 20px;">
//     <img src="https://fristinetech.com/wp-content/uploads/2023/11/Google-Ads-Logo.png" alt="Fristine InfoTech Logo" style="max-width: 100px;">
//   </div>

//   <p style="font-size: 16px;">Hi <strong>${first_name}</strong>,</p>

//   <p style="font-size: 15px; line-height: 1.6;">
//     We’re excited to let you know that the <strong>DSV360 application</strong> has been recently updated and is now available at a new domain:
//   </p>

//   <p style="font-size: 15px; line-height: 1.6; background-color: #f0f4f8; padding: 10px 15px; border-radius: 5px;">
//     🔗 <a href="https://project.dsv360.ai" style="color: #007bff; text-decoration: none;">https://project.dsv360.ai</a>
//   </p>

//   <p style="font-size: 15px; line-height: 1.6;">
//     Please note that the previous URL is no longer functional. Kindly use the new link for the access.
//   </p>

//   <p style="font-size: 15px; line-height: 1.6;">
//     We request you to continue maintaining your time entries through the updated application. Your feedback is valuable—please share your experience through the platform so we can keep improving.
//   </p>

//   <p style="font-size: 15px; line-height: 1.6;">
//     📌 Also, please make sure to keep your <strong>profile picture, personal details, cover photo, and resume</strong> up to date in the application to ensure completeness of your profile.
//   </p>

//   <p style="font-size: 15px; line-height: 1.6;">Thank you for your continued support.</p>

//   <p style="font-size: 15px;">
//     Best regards,<br>
//     <strong>Product Team</strong><br>
//     Fristine InfoTech Pvt. Ltd.
//   </p>

//   <hr style="margin-top: 30px; border: none; border-top: 1px solid #dddddd;">
  
//   <p style="font-size: 12px; color: #888888; text-align: left;">
//     © ${new Date().getFullYear()} Fristine InfoTech Pvt. Ltd. All rights reserved.
//   </p>

// </div>

//       `;

const htmlContent = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
  
    <div style="margin-bottom: 20px;">
      <img src="https://fristinetech.com/wp-content/uploads/2023/11/Google-Ads-Logo.png" alt="Fristine InfoTech Logo" style="max-width: 100px;">
    </div>

    <p style="font-size: 16px;">Hi <strong>${req.body.first_name}</strong>,</p>

    <p style="font-size: 15px; line-height: 1.6;">
      We’re pleased to inform you that you have been <strong>assigned a new project</strong> as part of your responsibilities at Fristine InfoTech.
    </p>

    <p style="font-size: 15px; line-height: 1.6;">
      🆕 <strong>Project Name:</strong> ${req.body.project_name}
    </p>

    <p style="font-size: 15px; line-height: 1.6;">
      Please check the project dashboard for more details, timelines, and assigned tasks. Your active participation is essential for the project's success.
    </p>

    <p style="font-size: 15px; line-height: 1.6;">
      If you have any questions or require additional support, feel free to reach out through the project platform.
    </p>

    <p style="font-size: 15px; line-height: 1.6;">Thank you for your commitment and collaboration.</p>

    <p style="font-size: 15px;">
      Best regards,<br>
      <strong>Product Team</strong><br>
      Fristine InfoTech Pvt. Ltd.
    </p>

    <hr style="margin-top: 30px; border: none; border-top: 1px solid #dddddd;">

    <p style="font-size: 12px; color: #888888; text-align: left;">
      © ${new Date().getFullYear()} Fristine InfoTech Pvt. Ltd. All rights reserved.
    </p>

  </div>
`;

      console.log(first_name, email_id);
    
      return sendEmail({
        from_email: "aman@dsvcorp.com.au",
        to_email: email_id,
        subject: `DSV360 App Updated – Please Use the New URL`,
        html_mode: true,
        content: htmlContent
      }, catalystApp);
    });
    


    await Promise.all(emailTasks);

    res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ message: "Failed to send emails", error: error.message });
  }
});





app.post("/sendEmailProject", async (req, res) => {
  try {
    const catalystApp = req.catalystApp;
    const data = req.body;
    console.log("daata",data);

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="margin-bottom: 20px;">
          <img src="https://fristinetech.com/wp-content/uploads/2023/11/Google-Ads-Logo.png" alt="Fristine InfoTech Logo" style="max-width: 100px;">
        </div>

        <p style="font-size: 16px;">Hi <strong>${data.first_name}</strong>,</p>

        <p style="font-size: 15px; line-height: 1.6;">
          We’re pleased to inform you that you have been <strong>assigned a new project</strong> as part of your responsibilities at Fristine InfoTech.
        </p>

        <p style="font-size: 15px; line-height: 1.6;">
          🆕 <strong>Project Name:</strong> ${data.project_name}
        </p>

        <p style="font-size: 15px; line-height: 1.6;">
          Please check the project dashboard for more details, timelines, and assigned tasks. Your active participation is essential for the project's success.
        </p>

        <p style="font-size: 15px; line-height: 1.6;">
          If you have any questions or require additional support, feel free to reach out through the project platform.
        </p>

        <p style="font-size: 15px; line-height: 1.6;">Thank you for your commitment and collaboration.</p>

        <p style="font-size: 15px;">
          Best regards,<br>
          <strong>Product Team</strong><br>
          Fristine InfoTech Pvt. Ltd.
        </p>

        <hr style="margin-top: 30px; border: none; border-top: 1px solid #dddddd;">

        <p style="font-size: 12px; color: #888888; text-align: left;">
          © ${new Date().getFullYear()} Fristine InfoTech Pvt. Ltd. All rights reserved.
        </p>
      </div>
    `;

    const sendEmailResult = await sendEmail(
      {
        from_email: "aman@dsvcorp.com.au",
        to_email: data.email,
        subject: "Assigned Project Confirmation",
        html_mode: true,
        content: htmlContent,
      },
      catalystApp
    );

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      message: "Failed to send email",
      error: error.message,
    });
  }
});







app.use((req, res) => {
  res.status(404).send("The page you are looking for does not exist.");
});

module.exports = app;
