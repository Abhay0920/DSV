import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "./Project/ProjectSlice";
import employeeReducer from "./Employee/EmployeeSlice"
import taskReducer from "./Tasks/TaskSlice"
import profileReducer from "./Profile/Profile"
import feedbackReducer from "./Feedback/Feedback"
import empProjectReducer  from "./EmpProject/EmpProjectSlice";
import empTaskReducer from "./EmpTask/EmpTaskSlice"
import clientReducer from "./Client/clientSlice"
import clientContactReducer from "./Client/contacts";
import issueReducer from "./Client/issueSlice"
export const rdxStore = configureStore({
    reducer: {
        projectReducer: projectReducer,
        employeeReducer:employeeReducer,
        taskReducer:taskReducer,
        profileReducer:profileReducer,
        feedbackReducer:feedbackReducer,
        empProjectReducer: empProjectReducer,
        empTaskReducer:empTaskReducer,
        clientReducer:clientReducer.reducer,
        clientContactReducer:clientContactReducer.reducer,
        issueReducer:issueReducer.reducer,

    }
});
