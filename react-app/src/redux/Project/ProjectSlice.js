import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";




// Thunk for fetching bag inoculation data
export const fetchProjects = createAsyncThunk(
    "projects/fetchProjects",
    async () => {
      try {
        const url = '/server/time_entry_management_application_function/projects';
        // Use axios.get instead of fetch
        const response = await axios.get(url, {
          withCredentials: true, // Same as credentials: 'include' in fetch
        });
         console.log("okkresponse",response.data);
        // Axios automatically parses the JSON, so we can directly return the response data
        return response.data.data;
  
      } catch (error) {
        // Handling errors from the axios request
        console.error("projects Data Is Not Fetch Some Error Is occur:- ", error);
        // If there's a response from the server, we can log or throw the message
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of projects");
        }
        // In case of no response (network error, etc.)
        throw new Error("Failed to fetch data of projects");
      }
    }
  );

export const addProject = createAsyncThunk(
    'projects/addProject',
    async (newProject, { rejectWithValue }) => {
      try {
        // Sending the project data to the server
        const currUser = JSON.parse(localStorage.getItem("currUser"));
        const response = await axios.post(
          "/server/time_entry_management_application_function/projects",
          {
            Project_Name: newProject.name,
            Description: newProject.description,
            Start_Date: newProject.startDate,
            End_Date: newProject.endDate,
            Status: newProject.status,
            Owner: newProject.owner,
            Owner_Id: newProject.ownerID,
            Assigned_To: newProject.assignedTo,
            Assigned_To_Id: newProject.assignedToID,
            Client_Name:newProject.client_name,
            Client_ID:newProject.clientID,
           

          }
        );
  
        const result = response.data;

        // Check if the API response was successful
        if (result.success) {
          return result.data; // Return the data that will be used in the reducer
        } else {
          // If the API response indicates failure, throw an error
          return rejectWithValue(result.message || 'Failed to add project');
        }
      } catch (error) {
        return rejectWithValue(error.message || 'Error adding project');
      }
    }
  );
  



export const ProjectSlice = createSlice({
  name: "projects",

  initialState: {
    isLoading: false,
    data: [],
    isError: false,
  },
  reducers: {
    addProjectData: (state, action) => {
      // Log the state before and after the update
      // Directly mutate the state.data array without checking type (Immer will handle this)
      // state.data.push(action.payload);
      state.data.unshift(action.payload);

    },
    updateProjectData: (state, action) => {
      const updatedProject = action.payload;
      console.log("updatedProject",updatedProject)
      const index = state.data.findIndex(client => client.ROWID === updatedProject.ROWID);
    
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...updatedProject };
        console.log("Client updated:", state.data[index]);
      } else {
        console.warn("Client not found for update:", updatedProject.ROWID);
      }
    },
    deleteProjecttData: (state, action) => {
      const rowIdToDelete = action.payload;
      console.log("Deleting client with ROWID:", rowIdToDelete);
      state.data = state.data.filter(client => client.ROWID !== rowIdToDelete);
      console.log("After deletion:", state.data);
    },
  },
  extraReducers: (builder) => {

    builder.addCase(fetchProjects.pending, (state) => {
      state.isLoading = true;
    }).addCase(fetchProjects.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    }).addCase(fetchProjects.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isError = true;
    });

    // Add Projects
    builder
    .addCase(addProject.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(addProject.fulfilled, (state, action) => {
      state.isLoading = false;
      // Assuming the added project should be appended to the existing list of projects
    //   state.data = state.data ? [...state.data, action.payload] : [action.payload];
    })
    .addCase(addProject.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload;
    });


  },
});

export default ProjectSlice.reducer;
 export const  projectActions  = ProjectSlice.actions;