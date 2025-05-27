import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchTasks = createAsyncThunk(
    "tasks/fetchTasks",
    async () => {
   
      try {
        const url = '/server/time_entry_management_application_function/tasks';
        // Use axios.get instead of fetch
        const response = await axios.get(url, {
          withCredentials: true, // Same as credentials: 'include' in fetch
        });
       
        // Axios automatically parses the JSON, so we can directly return the response data
        return response.data.data;
  
      } catch (error) {
        // Handling errors from the axios request
        console.error("Task Data Is Not Fetch Some Error Is occur:- ", error);
        // If there's a response from the server, we can log or throw the message
        if (error.response) {
          throw new Error(error.response.data.message || "Failed to fetch data of Tasks");
        }
        // In case of no response (network error, etc.)
        throw new Error("Failed to fetch data of Tasks");
      }
    }
  );

  export const TaskSlice = createSlice({
    name: "Tasks",
  
    initialState: {
      isLoading: false,
      data: [],
      isError: false,
    },
    reducers: {
      addTaskData: (state, action) => {
        // Log the state before and after the update
        // Directly mutate the state.data array without checking type (Immer will handle this)
        state.data.unshift(action.payload);
  
      },

      updateTaskData: (state, action) => {
        const updatedTask = action.payload;
        console.log("updatedProject",updatedTask)
        const index = state.data.findIndex(client => client.ROWID === updatedTask.ROWID);
      
        if (index !== -1) {
          state.data[index] = { ...state.data[index], ...updatedTask };
         
        } else {
          
        }


      },

      deleteTasktData: (state, action) => {
        const rowIdToDelete = action.payload;
        console.log("Deleting client with ROWID:", rowIdToDelete);
        state.data = state.data.filter(client => client.ROWID !== rowIdToDelete);
        console.log("After deletion:", state.data);
      },

      // setTasksData: (state, action) => {
      //   state.data = action.payload;
      //   state.isLoading = false;
      //   state.isError = false;
      // },
    },
    extraReducers: (builder) => {
  
      builder.addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
      }).addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      }).addCase(fetchTasks.rejected, (state, action) => {
        console.log("Error", action.payload);
        state.isError = true;
      });
    },
  });

  export default TaskSlice.reducer;
   export const  TaskActions  = TaskSlice.actions;
