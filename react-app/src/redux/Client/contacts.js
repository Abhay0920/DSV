import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchClientContact = createAsyncThunk(
    "ClientContact/fetchClientContact",
    async () => {
      
      try {
      
        
        const url = "/server/time_entry_management_application_function/contact";
        // Use axios.get instead of fetch
        const response = await axios.get(url, {
          withCredentials: true, // Same as credentials: 'include' in fetch
        });
        console.log("Response = ", response.data.data);

       
        // Axios automatically parses the JSON, so we can directly return the response data
        return response.data.data;
  
      } catch (error) {
        // Handling errors from the axios request
        console.error("Client contact  Data Is Not Fetch Some Error Is occur:- ", error);
        // If there's a response from the server, we can log or throw the message
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Client contact");
        }
        // In case of no response (network error, etc.)
        throw new Error("Failed to fetch data of Client Contact");
      }
    }
  );


  export const clientContactSlice = createSlice({
      name: "ClientContact",
    
      initialState: {
        isLoading: false,
        data: [],
        isError: false,
      },

      reducers: {
        addClientStaffData: (state, action) => {
          // Log the state before and after the update
          console.log("addClientData Reducer - Before Update:", state.data);
          console.log("New Data to Add:", action.payload);
         
          // Directly mutate the state.data array without checking type (Immer will handle this)
          state.data.unshift(action.payload);
    
          console.log("addClientData Reducer - After Update:", state.data);
        },
        setFilteredClientContact: (state, action) => {
          state.data = action.payload; // Update the state with filtered data
        },
        updateClientContactStatusLocally: (state, action) => {
          const { userID, status } = action.payload;
          const contactIndex = state.data.findIndex(contact => contact.UserID === userID);
          if (contactIndex !== -1) {
            state.data[contactIndex].status = status;
          }
        },
        deleteClienttData: (state, action) => {
          const rowIdToDelete = action.payload;
          console.log("Deleting client with ROWID:", rowIdToDelete);
          state.data = state.data.filter(client => client.ROWID !== rowIdToDelete);
         
        },

       
      },


      extraReducers: (builder) => {
    
        builder.addCase(fetchClientContact.pending, (state) => {
          state.isLoading = true;
        }).addCase(fetchClientContact.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload;
        }).addCase(fetchClientContact.rejected, (state, action) => {
          console.log("Error", action.payload);
          state.isError = true;
        });
      },
    });
  
    export const clientContactActions = clientContactSlice.actions;
    export const { setFilteredClientContact } = clientContactSlice.actions;
    export const { updateClientContactStatusLocally } = clientContactSlice.actions;
export default clientContactSlice;
