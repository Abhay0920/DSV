import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchEmployees = createAsyncThunk(
    "employees/fetchEmployees",
    async () => {
      try {
        const url = '/server/time_entry_management_application_function/employee';
        // Use axios.get instead of fetch
        const response = await axios.get(url, {
          withCredentials: true, // Same as credentials: 'include' in fetch
        });
        console.log("response",response.data);
        // Axios automatically parses the JSON, so we can directly return the response data
        return response.data;
        
  
      } catch (error) {
        // Handling errors from the axios request
        console.error("Employee Data Is Not Fetch Some Error Is occur:- ", error);
        // If there's a response from the server, we can log or throw the message
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Employee");
        }
        // In case of no response (network error, etc.)
        throw new Error("Failed to fetch data of Employee");
      }
    }
  );

  export const EmployeeSlice = createSlice({
    name: "employee",
  
    initialState: {
      isLoading: false,
      data: null,
      isError: false,
    },
    reducers: {},
    extraReducers: (builder) => {
  
      builder.addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
      }).addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      }).addCase(fetchEmployees.rejected, (state, action) => {
        console.log("Error", action.payload);
        state.isError = true;
      });
    },
  });

  export default EmployeeSlice.reducer;