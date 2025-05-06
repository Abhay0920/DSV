import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchEmpIssue = createAsyncThunk(
    "issue/fetchEmpIssue",
    async (userid) => {
      
      try {
      
        
        const url = `/server/time_entry_management_application_function/assignissue/${userid}`
        // Use axios.get instead of fetch
        const response = await axios.get(url, {
          withCredentials: true, // Same as credentials: 'include' in fetch
        });
       console.log("Response = ",response);
       
        // Axios automatically parses the JSON, so we can directly return the response data
        return response.data.data;
  
      } catch (error) {
        // Handling errors from the axios request
        console.error(" Emp Issue Data Is Not Fetch Some Error Is occur:- ", error);
        // If there's a response from the server, we can log or throw the message
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Emp Issue");
        }
        // In case of no response (network error, etc.)
        throw new Error("Failed to fetch data of Emp Issue");
      }
    }
  );


  export const EmpissueSlice = createSlice({
      name: "Issue",
    
      initialState: {
        isLoading: false,
        data: [],
        isError: false,
      },

      reducers: {
        updateIssue: (state, action) => {
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
    
        builder.addCase(fetchEmpIssue.pending, (state) => {
          state.isLoading = true;
        }).addCase(fetchEmpIssue.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload;
        }).addCase(fetchEmpIssue.rejected, (state, action) => {
          console.log("Error", action.payload);
          state.isError = true;
        });
      },
    });
  
    export default EmpissueSlice;

     export const  issuesActions  = EmpissueSlice.actions;
