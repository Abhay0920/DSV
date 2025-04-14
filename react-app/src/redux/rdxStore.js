import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "./Project/ProjectSlice";
import employeeReducer from "./Employee/EmployeeSlice"
import taskReducer from "./Tasks/TaskSlice"
import profileReducer from "./Profile/Profile"
import feedbackReducer from "./Feedback/Feedback"
import empProjectReducer  from "./EmpProject/EmpProjectSlice";
import empTaskReducer from "./EmpTask/EmpTaskSlice"
export const rdxStore = configureStore({
    reducer: {
        projectReducer: projectReducer,
        employeeReducer:employeeReducer,
        taskReducer:taskReducer,
        profileReducer:profileReducer,
        feedbackReducer:feedbackReducer,
        empProjectReducer: empProjectReducer,
        empTaskReducer:empTaskReducer,


    }
});
