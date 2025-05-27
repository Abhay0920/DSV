import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchIssueData = createAsyncThunk(
    "issue/fetchIssueData",
    async () => {
      
      try {
      
        
        const url = "/server/time_entry_management_application_function/issue";
        // Use axios.get instead of fetch
        const response = await axios.get(url, {
          withCredentials: true, // Same as credentials: 'include' in fetch
        });
       console.log("Response = ",response.data.data);
       
        // Axios automatically parses the JSON, so we can directly return the response data
        return response.data.data;
  
      } catch (error) {
        // Handling errors from the axios request
        console.error("Issue Data Is Not Fetch Some Error Is occur:- ", error);
        // If there's a response from the server, we can log or throw the message
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Issue");
        }
        // In case of no response (network error, etc.)
        throw new Error("Failed to fetch data of Issue");
      }
    }
  );


  export const issueSlice = createSlice({
      name: "Issue",
    
      initialState: {
        isLoading: false,
        data: [],
        isError: false,
      },

      reducers: {
        addissueData: (state, action) => {
          // Log the state before and after the update
          console.log("addClientData Reducer - Before Update:", state.data);
          console.log("New Data to Add:", action.payload);
          
          // Directly mutate the state.data array without checking type (Immer will handle this)
          state.data.unshift(action.payload);
    
          console.log("addClientData Reducer - After Update:", state.data);
        },

        deleteissueData: (state, action) => {
          const rowIdToDelete = action.payload;
          console.log("Deleting client with ROWID:", rowIdToDelete);
          state.data = state.data.filter(client => client.ROWID !== rowIdToDelete);
          console.log("After deletion:", state.data);
        },

        updateIssueData: (state, action) => {
          const updatedClient = action.payload;
          const index = state.data.findIndex(client => client.ROWID === updatedClient.ROWID);
        
          if (index !== -1) {
            state.data[index] = { ...state.data[index], ...updatedClient };
            console.log("Client updated:", state.data[index]);
          } else {
            console.warn("Client not found for update:", updatedClient.ROWID);
          }
        },
      },
      extraReducers: (builder) => {
    
        builder.addCase(fetchIssueData.pending, (state) => {
          state.isLoading = true;
        }).addCase(fetchIssueData.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload;
        }).addCase(fetchIssueData.rejected, (state, action) => {
          console.log("Error", action.payload);
          state.isError = true;
        });
      },
    });
  
    export default issueSlice;

    export const  issuesActions  = issueSlice.actions;
