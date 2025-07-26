import { Typography, Paper } from "@mui/material";
import './Reminders.scss';
import QuickLinks from "../../components/QuickLinks/QuickLinks";
import ToDoList from "../../components/ToDoList/ToDoList";
import "./UserHome.scss";

function UserHome() {
    return (
        <div className="user-home-layout">
            <div className="userhome-central-panel">
                <div className="userhome-cards-col">
                    <QuickLinks />
                    <ToDoList />
                </div>
                <div className="userhome-cards-col">
                    <Paper elevation={3} className="reminders-content">
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                            <Typography variant="h6" align="center" sx={{ fontWeight: 700, fontSize: '1.18rem', color: 'var(--primary-color)', letterSpacing: 0.1 }}>
                                Reminders
                            </Typography>
                        </div>
                        <ul className="reminders-list">
                            <li className="reminder-item">
                                <span className="reminder-date">Jul 20</span>
                                <span className="reminder-text">Follow up on Google application</span>
                            </li>
                            <li className="reminder-item">
                                <span className="reminder-date">Jul 22</span>
                                <span className="reminder-text">Prepare for Amazon interview</span>
                            </li>
                            <li className="reminder-item">
                                <span className="reminder-date">Jul 25</span>
                                <span className="reminder-text">Update resume for new roles</span>
                            </li>
                        </ul>
                    </Paper>
                </div>
            </div>
        </div>
    );
}

export default UserHome;