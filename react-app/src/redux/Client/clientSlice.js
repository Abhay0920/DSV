import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchClientData = createAsyncThunk(
    "client/fetchClientData",
    async () => {
      
      try {
        console.log("Inside try");
        
        const url = "/server/time_entry_management_application_function/clientOrg";
        // Use axios.get instead of fetch
        const response = await axios.get(url, {
          withCredentials: true, // Same as credentials: 'include' in fetch
        });
       console.log("Response = ",response.data.data);
       
        // Axios automatically parses the JSON, so we can directly return the response data
        return response.data.data;
  
      } catch (error) {
        // Handling errors from the axios request
        console.error("Client Data Is Not Fetch Some Error Is occur:- ", error);
        // If there's a response from the server, we can log or throw the message
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Client");
        }
        // In case of no response (network error, etc.)
        throw new Error("Failed to fetch data of Client");
      }
    }
  );


  export const clientSlice = createSlice({
      name: "Client",
    
      initialState: {
        isLoading: false,
        data: [],
        isError: false,
      },

      reducers: {
        addClientData: (state, action) => {
          // Log the state before and after the update
          console.log("addClientData Reducer - Before Update:", state.data);
          console.log("New Data to Add:", action.payload);
          state.isLoading = true
          // Directly mutate the state.data array without checking type (Immer will handle this)
          state.data.unshift(action.payload);
    
          console.log("addClientData Reducer - After Update:", state.data);
        },
        updateClientData: (state, action) => {
          const updatedClient = action.payload;
          const index = state.data.findIndex(client => client.ROWID === updatedClient.ROWID);
        
          if (index !== -1) {
            state.data[index] = { ...state.data[index], ...updatedClient };
            console.log("Client updated:", state.data[index]);
          } else {
            console.warn("Client not found for update:", updatedClient.ROWID);
          }
        },
        deleteClientData: (state, action) => {
          const rowIdToDelete = action.payload;
          console.log("Deleting client with ROWID:", rowIdToDelete);
          state.data = state.data.filter(client => client.ROWID !== rowIdToDelete);
          console.log("After deletion:", state.data);
        },

      },
      extraReducers: (builder) => {
    
        builder.addCase(fetchClientData.pending, (state) => {
          state.isLoading = true;
        }).addCase(fetchClientData.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload;
        }).addCase(fetchClientData.rejected, (state, action) => {
          console.log("Error", action.payload);
          state.isError = true;
        });
      },
    });
  
    export default clientSlice;

    export const  clientActions  = clientSlice.actions;
