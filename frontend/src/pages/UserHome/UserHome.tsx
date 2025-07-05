import { Typography, Paper } from "@mui/material";
import QuickLinks from "../../components/QuickLinks/QuickLinks";
import ToDoList from "../../components/ToDoList/ToDoList";
import "./UserHome.scss";

function UserHome() {
    return (
        <div className={'user-home'}> 
            <div className={'sidebar-div'}>
                <QuickLinks />
                <ToDoList />
            </div>
            <div className={'reminders-div'}>
                <Paper className={'reminders-content'}>
                    <Typography>
                        Reminders!
                    </Typography>
                </Paper>
            </div>
        </div>
    );
}

export default UserHome;