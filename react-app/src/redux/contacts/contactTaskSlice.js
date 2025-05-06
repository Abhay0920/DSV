import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";




// Thunk for fetching bag inoculation data
export const fetchContactTask= createAsyncThunk(
    "task/fetchClientTask",
    async (orgId) => {
      try {
     
        const url = `/server/time_entry_management_application_function/contact/tasks/${orgId}`;
        // Use axios.get instead of fetch
        const response = await axios.get(url, {
          withCredentials: true, // Same as credentials: 'include' in fetch
        });
       
         
        // Axios automatically parses the JSON, so we can directly return the response data
        return response.data.data;
  
      } catch (error) {
        // Handling errors from the axios request
        console.error(" Concacts Task Data Is Not Fetch Some Error Is occur:- ", error);
        // If there's a response from the server, we can log or throw the message
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of contacts Tasks");
        }
        // In case of no response (network error, etc.)
        throw new Error(" Failed to fetch data of contacts  Tasks");
      }
    }
  );





export const ContactTaskSlice = createSlice({
  name: "ContactProjects",

  initialState: {
    isLoading: false,
    data: [],
    isError: false,
  },
  reducers: {
  
  },
  extraReducers: (builder) => {

    builder.addCase(fetchContactTask.pending, (state) => {
      state.isLoading = true;
    }).addCase(fetchContactTask.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    }).addCase(fetchContactTask.rejected, (state, action) => {
      console.log("Error", action.payload);
      state.isError = true;
    });

   


  },
});

export default ContactTaskSlice.reducer;