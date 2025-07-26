import { Typography } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import "./AppsToolBar.scss";

type AppsToolBarProps = {
    handleAddApp: () => void
}

function AppsToolBar({ handleAddApp }: AppsToolBarProps) {
    return (
        <div className="apps-tool-bar">
            <div className="page-title">
                <Typography variant="h5">
                    Current Job Applications
                </Typography>
            </div>
            <div className="add-app-button">
                <button className="modern-add-btn" onClick={handleAddApp}>
                    <AddCircleOutlineIcon fontSize="medium" style={{ marginRight: 6 }} />
                    <span>Add</span>
                </button>
            </div>
        </div>
    );
}

export default AppsToolBar;