import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchEmpTask = createAsyncThunk(
    "Task/fetchEmpTask",
    async () => {
      const user = JSON.parse(localStorage.getItem("currUser"));

      const userid = user.userid;
      try {
        const url =  `/server/time_entry_management_application_function/tasks/employee/${userid}`;
        // Use axios.get instead of fetch
        const response = await axios.get(url, {
          withCredentials: true, // Same as credentials: 'include' in fetch
        });
       
        // Axios automatically parses the JSON, so we can directly return the response data
        return response.data.data;
  
      } catch (error) {
        // Handling errors from the axios request
        console.error("Emp Task  Data Is Not Fetch Some Error Is occur:- ", error);
        // If there's a response from the server, we can log or throw the message
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Emp Task");
        }
        // In case of no response (network error, etc.)
        throw new Error("Failed to fetch data of Emp Task");
      }
    }
  );

  export const EmpTaskSlice = createSlice({
        name: "EmpTask",
      
        initialState: {
          isLoading: false,
          data: [],
          isError: false,
        },
        reducers: {},
        extraReducers: (builder) => {
      
          builder.addCase(fetchEmpTask.pending, (state) => {
            state.isLoading = true;
          }).addCase(fetchEmpTask.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action.payload;
          }).addCase(fetchEmpTask.rejected, (state, action) => {
            console.log("Error", action.payload);
            state.isError = true;
          });
        },
      });
    
      export default EmpTaskSlice.reducer;