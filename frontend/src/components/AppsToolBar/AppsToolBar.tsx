import { Typography } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import "./AppsToolBar.scss";

type AppsToolBarProps = {
    handleAddApp?: () => void,
    headerTitle: string,
}

function AppsToolBar({ handleAddApp, headerTitle }: AppsToolBarProps) {
    return (
        <div className="apps-tool-bar">
            <div className="page-title">
                <Typography variant="h5">
                    {headerTitle}
                </Typography>
            </div>
            {handleAddApp &&
                <div className="add-app-button">
                    <button className="modern-add-btn" onClick={handleAddApp}>
                        <AddCircleOutlineIcon fontSize="medium" style={{ marginRight: 6 }} />
                        <span>Add</span>
                    </button>
                </div>
            }
        </div>
    );
}

export default AppsToolBar;