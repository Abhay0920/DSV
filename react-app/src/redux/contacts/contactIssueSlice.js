import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";




// Thunk for fetching bag inoculation data
export const fetchContactIssues= createAsyncThunk(
    "issues/fetchClientIssue",
    async (orgId) => {
      try {
        console.log("userId",)
        const url =  `/server/time_entry_management_application_function/clientissue/${orgId}`;
        // Use axios.get instead of fetch
        const response = await axios.get(url, {
          withCredentials: true, // Same as credentials: 'include' in fetch
        });
         
         
        // Axios automatically parses the JSON, so we can directly return the response data
        return response.data.data;
  
      } catch (error) {
        // Handling errors from the axios request
        console.error(" Concacts issues Data Is Not Fetch Some Error Is occur:- ", error);
        // If there's a response from the server, we can log or throw the message
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of contacts  issues");
        }
        // In case of no response (network error, etc.)
        throw new Error(" Failed to fetch data of contacts  issues");
      }
    }
  );





export const ContactIssueSlice = createSlice({
  name: "ContactTasks",

  initialState: {
    isLoading: false,
    data: [],
    isError: false,
  },
  reducers: {
    addIssueData: (state, action) => {
     
      state.data.push(action.payload);

    },
    updateIssueData: (state, action) => {
      const updatedIssue = action.payload;
      console.log("updatedProject",updatedIssue)
      const index = state.data.findIndex(client => client.ROWID === updatedIssue.ROWID);
    
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...updatedIssue };
        console.log("Client updated:", state.data[index]);
      } else {
        console.warn("Client not found for update:", updatedIssue.ROWID);
      }
    },
    deleteIssueData: (state, action) => {
      const rowIdToDelete = action.payload;
      console.log("Deleting client with ROWID:", rowIdToDelete);
      state.data = state.data.filter(client => client.ROWID !== rowIdToDelete);
      console.log("After deletion:", state.data);
    },
  
  },
  extraReducers: (builder) => {

    builder.addCase(fetchContactIssues.pending, (state) => {
      state.isLoading = true;
    }).addCase(fetchContactIssues.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    }).addCase(fetchContactIssues.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isError = true;
    });

   


  },
});

export default ContactIssueSlice.reducer;
 export const  issuesActions  = ContactIssueSlice.actions;