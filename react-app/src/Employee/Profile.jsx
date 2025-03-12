import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ButtonGroup,
  Skeleton,
  Input,
  Chip,
} from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloudDownloadSharpIcon from "@mui/icons-material/CloudDownloadSharp";
import CloudUploadSharpIcon from "@mui/icons-material/CloudUploadSharp";
import axios from "axios";

function Profile() {
  const [userInfo, setUserInfo] = useState({});
  const [skills, setSkills] = useState(
    userInfo.skills || [
      "React",
      "Nodejs",
      "Catalyst",
      "AI/ML",
      "Analyst",
      "CRM",
      "Zoho",
      "Problem-Solving",
    ]
  );

  
  const [newSkill, setNewSkill] = useState("");
  const [currUser, setCurrUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [skillModelOpen, setSkillModelOpen] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    name: userInfo.name || "",
    email: userInfo.email || "",
    phone: userInfo.phone || "",
    address: userInfo.address || "",
    AboutME: userInfo.AboutME || "",
  });
  const [loading, setLoading] = useState(true);
  const [cvFile, setCvFile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [displayCV, setDisplayCV] = useState(false);
  const [cvURL, setCvURL] = useState("");
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const handleSkillModekOpen = () => setSkillModelOpen(true);
  const handleSkillModelClose = () => setSkillModelOpen(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

 

  useEffect(() => {
    const getUserDetail = async () => {
      const user = JSON.parse(localStorage.getItem("currUser"));
      setCurrUser(user);
      if (!user?.userid) return;

      try {
        const response = await axios.get(
          `/server/time_entry_management_application_function/profile/data/${user.userid}`
        );

        const data = response.data.data;
        console.log("data", data);

        const profileBase64 = localStorage.getItem("profileData");
        const coverBase64 = localStorage.getItem("coverData");

        // Parse skills from API response
        const userSkills = data.Users.Skills
          ? data.Users.Skills.split(",").map((skill) => skill.trim())
          : [];
        setSkills(userSkills);

        setUserInfo({
          name: `${user.firstName} ${user.lastName}`,
          email: user.mailid,
          phone: data.Users.Phone,
          address: data.Users.Address,
          AboutME: data.Users.AboutME,
          profileImage: profileBase64,
          coverImage: coverBase64,
          role: user.role,
          skills: userSkills,
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserDetail();
  }, []);

  useEffect(() => {
    setEditedInfo({
      name: userInfo.name || "",
      email: userInfo.email || "",
      phone: userInfo.phone || "",
      address: userInfo.address || "",
      AboutME: userInfo.AboutME || "",
    });
  }, [userInfo]);

  const handleEditClick = () => {
    console.log(userInfo.profileImage, userInfo.coverImage);
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCvUpload = (e) => {
    const file = e.target.files[0];
    console.log(file);
    setCvFile(file);
  };

  const handleOpenCvModal = () => {
    setIsCvModalOpen(true);
  };

  const handleCloseCvModal = () => {
    setIsCvModalOpen(false);
    setCvFile(null);
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "profile") {
      setProfileImage(file);
    }
    if (type === "cover") {
      setCoverImage(file);
    }
  };

  const imageCloudUpload = async (image) => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "time_management_fristine");
    formData.append("cloud_name", "drxocmkpu");
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/drxocmkpu/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );
    const imageURL = await response.json();
    return imageURL.url;
  };

  const handleAlert = (severity, message) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("currUser"));
      if (!user || !user.userid) {
        handleAlert("error", "User not found. Please log in again.");
        return;
      }

      let profileUpdateSuccess = true;
      let coverUpdateSuccess = true;

      try {
        // Upload profile and cover images concurrently
        const uploadPromises = [];

        if (profileImage) {
          uploadPromises.push(
            imageCloudUpload(profileImage)
              .then(async (profileURL) => {
                const response = await axios.post(
                  `/server/time_entry_management_application_function/userprofile/${user.userid}`,
                  { profileLink: profileURL }
                );
                if (response.status === 200) {
                  setUserInfo((prev) => ({
                    ...prev,
                    profileImage: profileURL,
                  }));
                  localStorage.setItem("profileData", profileURL);
                } else {
                  profileUpdateSuccess = false;
                }
              })
              .catch(() => {
                profileUpdateSuccess = false;
              })
          );
        }

        if (coverImage) {
          uploadPromises.push(
            imageCloudUpload(coverImage)
              .then(async (coverURL) => {
                const response = await axios.post(
                  `/server/time_entry_management_application_function/usercover/${user.userid}`,
                  { coverLink: coverURL }
                );
                if (response.status === 200) {
                  setUserInfo((prev) => ({ ...prev, coverImage: coverURL }));
                  localStorage.setItem("coverData", coverURL);
                } else {
                  coverUpdateSuccess = false;
                }
              })
              .catch(() => {
                coverUpdateSuccess = false;
              })
          );
        }

        await Promise.all(uploadPromises);

        // Provide feedback to user
        if (!profileUpdateSuccess && !coverUpdateSuccess) {
          handleAlert("error", "Failed to update profile and cover images.");
        } else {
          handleAlert("success", "Images updated successfully!");
        }
      } catch (err) {
        console.error("Image update error:", err);
        handleAlert("error", "An error occurred while updating images.");
      }

      // Prepare and update profile details
      const updatedProfile = {
        Address: editedInfo.address,
        Phone: editedInfo.phone,
        AboutME: editedInfo.AboutME,
        Skills: skills.join(", "), // Convert array to comma-separated string
      };

      const response = await fetch(
        `/server/time_entry_management_application_function/profile/update/${user.userid}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProfile),
        }
      );

      if (!response.ok) {
        throw new Error("Profile update failed.");
      }

      // Update local state
      setUserInfo((prev) => ({
        ...prev,
        ...updatedProfile,
        skills, // Keep as array for UI consistency
      }));

      handleAlert("success", "Profile updated successfully!");
      setIsEditing(false);
      setProfileImage(null);
      setCoverImage(null);
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      handleAlert("error", "An error occurred while updating profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCV = async () => {
    console.log(cvFile.name);
    const formData = new FormData();

    try {
      setLoading(true);

      if (cvFile) {
        formData.append("resume", cvFile, cvFile.name);
      }

      // console.log("FormData Entries:");
      // for (const [key, value] of formData.entries()) {
      //   console.log(`${key}:`, value);
      // }

      const response = await fetch(
        `/server/time_entry_management_application_function/resume/${currUser.userid}`,
        {
          method: "POST",
          body: formData,
        }
      );
      setLoading(false);

      console.log(response);

      if (response.ok) {
        alert("Resume Uploaded successfully!");
      } else {
        alert("Resume Upload Failed.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error uploading profile:", error);
      alert("Error uploading profile.");
    }
  };

  const handleDisplayCV = async () => {
    try {
      // Fetch the PDF data from the backend

      const response = await axios.get(
        `/server/time_entry_management_application_function/resume/${currUser.userid}`,
        {
          responseType: "blob", // Assuming the response is a file (PDF)
        }
      );

      console.log("res", response);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);
      console.log("url", blobUrl);
      setCvURL(blobUrl);
      setDisplayCV(true);
    } catch (err) {
      console.error("Error displaying the CV:", err);
    }
  };

  const handleCancel = () => {
    setEditedInfo({ ...userInfo });
    setProfileImage(null);
    setCoverImage(null);
    setIsEditing(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      // Split by commas and trim each skill
      const newSkills = newSkill.split(",").map((skill) => skill.trim());

      // Filter out empty strings and add new skills
      const validNewSkills = newSkills.filter(
        (skill) => skill && !skills.includes(skill)
      );

      if (validNewSkills.length > 0) {
        setSkills([...skills, ...validNewSkills]);
      }
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };


  

  return (
    <Box sx={{ padding: 3 }}>
      <Box
        sx={{
          position: "relative",
          height: 200,
          backgroundImage: `url(${coverImage ? URL.createObjectURL(coverImage) : userInfo.coverImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 2,
          overflow: "hidden",
        }}
      />

      {/* Profile Section - Left Aligned */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          marginTop: -8,
          marginLeft: 3,
        }}
      >
        {/* Profile Image with Edit Button */}
        {loading ? (
          <Skeleton variant="circular" width={150} height={150} />
        ) : (
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={userInfo.profileImage || ""}
              sx={{ width: 150, height: 150, border: "4px solid white" }}
            />
            <Button
              variant="contained"
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                minWidth: "auto",
                padding: "4px",
                borderRadius: "50%",
                transform: "translate(25%, 25%)",
              }}
              onClick={handleEditClick}
            >
              <EditIcon fontSize="small" />
            </Button>
          </Box>
        )}

        {/* Name and Bio aligned next to Profile Image */}
        <Box sx={{ marginLeft: 3, marginTop: 6 }}>
          {loading ? (
            <>
              <Skeleton variant="text" width={200} height={40} />
              <Skeleton variant="text" width={150} height={30} />
            </>
          ) : (
            <>
              <Typography variant="h4">{userInfo.name}</Typography>
              <Typography variant="body1" color="textSecondary">
                {userInfo.role}
              </Typography>
            </>
          )}
        </Box>
      </Box>

      {/* CV Upload Modal */}
      <Dialog
        open={isCvModalOpen}
        onClose={handleCloseCvModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Upload CV</DialogTitle>
        <DialogContent>
          <Input type="file" onChange={handleCvUpload} fullWidth />
          {cvFile && (
            <Typography variant="body2" sx={{ marginTop: 1 }}>
              Selected: {cvFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCvModal} color="error" variant="outlined">
            Cancel
          </Button>
          <Button color="primary" variant="contained" onClick={handleSaveCV}>
            Save CV
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={8}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">About Me</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {userInfo?.AboutME || "Not provided"}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography variant="h6">
                          Contact Information
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <strong>Email:</strong>
                      </TableCell>
                      <TableCell>{userInfo.email}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Phone:</strong>
                      </TableCell>
                      <TableCell>{userInfo.phone}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <strong>Address:</strong>
                      </TableCell>
                      <TableCell>{userInfo.address}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          {/* Card with Skills */}
          <Card
            sx={{
              borderRadius: "8px",
              boxShadow: 3,
              "&:hover": { boxShadow: 6 },
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontWeight: "bold",
                  color: "primary.dark",
                }}
              >
                Skills
                {/* <Button
                  variant="contained"
                  sx={{
                    padding: "4px",
                    borderRadius: "50%",
                    minWidth: "auto",
                    backgroundColor: "primary.main",
                    "&:hover": { backgroundColor: "primary.dark" },
                  }}
                  onClick={handleSkillModekOpen}
                >
                  <EditIcon fontSize="small" />
                </Button> */}
              </Typography>

              {/* Skill Chips */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                    color="primary"
                    sx={{
                      borderRadius: "16px",
                      backgroundColor: "primary.light",
                      "&:hover": { backgroundColor: "primary.main" },
                      "& .MuiChip-deleteIcon": {
                        color: "primary.contrastText",
                      },
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Button Group */}
          <ButtonGroup
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              gap: 2,
              mt: 3,
              borderRadius: "8px",
              boxShadow: 2,
              "&:hover": { boxShadow: 5 },
            }}
          >
            <Button
              onClick={() => setIsCvModalOpen(true)}
              startIcon={<CloudUploadSharpIcon />}
              sx={{
                backgroundColor: "primary.main",
                "&:hover": { backgroundColor: "primary.dark" },
              }}
            >
              Upload CV
            </Button>
            <Button
              onClick={handleDisplayCV}
              startIcon={<CloudDownloadSharpIcon />}
              sx={{
                backgroundColor: "primary.main",
                "&:hover": { backgroundColor: "primary.dark" },
              }}
            >
              Show CV
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onClose={handleCancel} fullWidth maxWidth="sm">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            name="name"
            fullWidth
            value={editedInfo.name}
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Email"
            name="email"
            fullWidth
            value={editedInfo.email}
            // onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Phone"
            name="phone"
            fullWidth
            value={editedInfo.phone}
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Address"
            name="address"
            fullWidth
            value={editedInfo.address}
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="AboutME"
            name="AboutME"
            fullWidth
            multiline
            rows={4}
            value={editedInfo.AboutME}
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
          />
          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="body1" sx={{ marginBottom: 1 }}>
              Profile Picture
            </Typography>
            <Input
              type="file"
              onChange={(e) => handleImageChange(e, "profile")}
              fullWidth
            />
          </Box>
          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="body1" sx={{ marginBottom: 1 }}>
              Cover Image
            </Typography>
            <Input
              type="file"
              onChange={(e) => handleImageChange(e, "cover")}
              fullWidth
            />
          </Box>
          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Skills
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
              {skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                  color="primary"
                  variant="outlined"
                  sx={{
                    borderRadius: "16px",
                    "&:hover": { backgroundColor: "primary.light" },
                  }}
                />
              ))}
            </Box>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <TextField
                size="small"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skills (comma-separated)"
                fullWidth
                onKeyPress={(e) => {
                  if (e.key === "Enter" && newSkill.trim()) {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                helperText="Enter multiple skills separated by commas"
              />
              <Button
                variant="contained"
                onClick={handleAddSkill}
                disabled={!newSkill.trim()}
                sx={{
                  minWidth: "80px",
                  backgroundColor: "primary.main",
                  "&:hover": { backgroundColor: "primary.dark" },
                }}
              >
                Add
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="error" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* skill dialog */}
      <Dialog open={skillModelOpen} onClose={handleSkillModelClose}>
        <DialogTitle>Add a Skill</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Enter skill"
            variant="outlined"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSkillModelClose}>Cancel</Button>
          <Button onClick={handleAddSkill} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={displayCV}
        onClose={() => setDisplayCV(false)}
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            width: "210mm", // A4 width
            height: "297mm", // A4 height
            maxWidth: "none", // Remove default maxWidth
          },
        }}
      >
        <DialogTitle>Resume</DialogTitle>
        <DialogContent>
          {displayCV && cvURL && (
            <iframe
              src={cvURL}
              width="100%"
              height="100%"
              title="User CV"
              frameBorder="0"
            ></iframe>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Profile;
