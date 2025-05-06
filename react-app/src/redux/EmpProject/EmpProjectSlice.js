import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchEmpProject = createAsyncThunk(
  "Project/fetchEmpProject",
  async () => {
    const user = JSON.parse(localStorage.getItem("currUser"));
    console.log("User fetched from localStorage:", user);

    if (!user || !user.userid) {
      console.error("User ID not found!");
      return null;
    }

    console.log("Calling API with userID:", user.userid);

    try {
      const url = `/server/time_entry_management_application_function/projects/${user.userid}`;
      const response = await axios.get(url, { withCredentials: true });

  
      return response.data.data;  
    } catch (error) {
      console.error("Error in fetchEmpProject:", error);
      throw new Error("Failed to fetch data of Emp Project");
    }
  }
);


export const empProjectSlice = createSlice({
  name: "empProject",
  initialState: {
    isLoading: false,
    data: [],  // Default to null
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmpProject.pending, (state) => {
        console.log("fetchEmpProject pending...");
        state.isLoading = true;
      })
      .addCase(fetchEmpProject.fulfilled, (state, action) => {
        console.log("fetchEmpProject fulfilled:", action.payload);
        state.isLoading = false;
        state.data = action.payload || []; // Ensure array format
      })
      .addCase(fetchEmpProject.rejected, (state, action) => {
        console.log("fetchEmpProject rejected:", action.error);
        state.isError = true;
      });
  },
});

      export default empProjectSlice.reducer;