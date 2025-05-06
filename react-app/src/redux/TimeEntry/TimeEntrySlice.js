import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchTimeEntry = createAsyncThunk(
    "timeEntry/fetchTimeEntry",
    async (ROWID) => {
      
      try {
        console.log("Inside try");
        
        const url = `/server/time_entry_management_application_function/timeentry/${ROWID}`;
        // Use axios.get instead of fetch
        const response = await axios.get(url, {
          withCredentials: true, // Same as credentials: 'include' in fetch
        });
       console.log(" TIme entry Response = ",response.data.data);
       
        // Axios automatically parses the JSON, so we can directly return the response data
        return response.data.data;
  
      } catch (error) {
        // Handling errors from the axios request
        console.error("Time Entry  Data Is Not Fetch Some Error Is occur:- ", error);
        // If there's a response from the server, we can log or throw the message
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Time Entry");
        }
        // In case of no response (network error, etc.)
        throw new Error("Failed to fetch data of Time Entry");
      }
    }
  );


  export const timeEntrySlice = createSlice({
      name: "Time Entry",
    
      initialState: {
        isLoading: false,
        data: [],
        isError: false,
      },

      reducers: {
        // addClientData: (state, action) => {
        //   // Log the state before and after the update
        //   console.log("addClientData Reducer - Before Update:", state.data);
        //   console.log("New Data to Add:", action.payload);
        //   state.isLoading = true
        //   // Directly mutate the state.data array without checking type (Immer will handle this)
        //   state.data.push(action.payload);
    
        //   console.log("addClientData Reducer - After Update:", state.data);
        // },
        // updateClientData: (state, action) => {
        //   const updatedClient = action.payload;
        //   const index = state.data.findIndex(client => client.ROWID === updatedClient.ROWID);
        
        //   if (index !== -1) {
        //     state.data[index] = { ...state.data[index], ...updatedClient };
        //     console.log("Client updated:", state.data[index]);
        //   } else {
        //     console.warn("Client not found for update:", updatedClient.ROWID);
        //   }
        // },
        // deleteClientData: (state, action) => {
        //   const rowIdToDelete = action.payload;
        //   console.log("Deleting client with ROWID:", rowIdToDelete);
        //   state.data = state.data.filter(client => client.ROWID !== rowIdToDelete);
        //   console.log("After deletion:", state.data);
        // },

      },
      extraReducers: (builder) => {
    
        builder.addCase(fetchTimeEntry.pending, (state) => {
          state.isLoading = true;
        }).addCase(fetchTimeEntry.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload;
        }).addCase(fetchTimeEntry.rejected, (state, action) => {
          console.log("Error", action.payload);
          state.isError = true;
        });
      },
    });
  
    export default timeEntrySlice;

    // export const  clientActions  = clientSlice.actions;
