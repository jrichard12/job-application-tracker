/* eslint-disable @typescript-eslint/no-explicit-any */
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import { useState } from "react";

type CheckBoxItemProps = {
    text: string,
    checked: boolean
}

function CheckBoxItem({text, checked}: CheckBoxItemProps) {
    const [isChecked, setIsChecked] = useState(checked);
    const [currentText, setCurrentText] = useState(text);

    const handleTextChange = (newText: string) => {
        setCurrentText(newText);
    }

    return (
        <ListItem>
            <ListItemButton role={undefined} dense>
                <ListItemIcon>
                    <Checkbox
                        edge="start"
                        checked={isChecked}
                        tabIndex={-1}
                        onClick={() => setIsChecked(!isChecked)}
                        disableRipple
                    />
                </ListItemIcon>
                <TextField id="standard-basic" value={currentText} variant="standard" onChange={(e: any) => handleTextChange(e.target.value)} />
            </ListItemButton>
        </ListItem>
    );
}

export default CheckBoxItem;