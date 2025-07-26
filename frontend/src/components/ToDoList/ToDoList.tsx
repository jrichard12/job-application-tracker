import { CardContent, Typography, List, ListItem, Checkbox, TextField, IconButton } from "@mui/material";
import { useState } from 'react';
import Card from '@mui/material/Card';
// Removed unused CardActions and Button imports
import "./ToDoList.scss";

type ToDoItem = {
    id: number;
    checked: boolean;
    text: string;
};

function ToDoList() {
    const [todoItems, setToDoItems] = useState<ToDoItem[]>([
        { id: Date.now() + Math.random(), checked: false, text: "" }
    ]);

    const handleCheck = (id: number) => {
        setToDoItems(todoItems.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    const handleTextChange = (id: number, value: string) => {
        setToDoItems(items => items.map(item =>
            item.id === id ? { ...item, text: value } : item
        ));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: number, value: string) => {
        if (e.key === "Enter") {
            const trimmed = value.trim();
            if (!trimmed) return;
            // Only add a new item if this is the last item and not empty
            const isLast = todoItems[todoItems.length - 1].id === id;
            if (isLast) {
                setToDoItems(items => [
                    ...items,
                    { id: Date.now() + Math.random(), checked: false, text: "" }
                ]);
            }
        }
    };

    const handleDelete = (id: number) => {
        // Don't allow deleting the last (empty) item
        if (todoItems.length === 1 && todoItems[0].text === "") return;
        setToDoItems(items => items.filter(item => item.id !== id));
    };

    return (
        <div className="toDoList">
            <Card>
                <CardContent>
                    <Typography>
                        To Do List
                    </Typography>
                    <List>
                        {todoItems.map((item, idx) => (
                            <ListItem
                                key={item.id}
                                className={item.checked ? "checked" : ""}
                                secondaryAction={
                                    (item.text || todoItems.length > 1) && (
                                        <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                                            <span style={{ fontSize: 18 }}>&times;</span>
                                        </IconButton>
                                    )
                                }
                                disablePadding
                                sx={{ pl: 0.5, pr: 0.5 }}
                            >
                                <Checkbox
                                    checked={item.checked}
                                    onChange={() => handleCheck(item.id)}
                                    sx={{ mr: 1 }}
                                />
                                <TextField
                                    variant="standard"
                                    value={item.text}
                                    onChange={e => handleTextChange(item.id, e.target.value)}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, item.id, item.text)}
                                    placeholder={idx === todoItems.length - 1 ? "Add a task..." : ""}
                                    fullWidth
                                    InputProps={{
                                        disableUnderline: true,
                                        style: {
                                            textDecoration: item.checked ? 'line-through' : undefined,
                                            color: item.checked ? 'var(--text-secondary, #888)' : undefined,
                                            opacity: item.checked ? 0.7 : 1,
                                            fontSize: '1rem',
                                            background: 'transparent',
                                            padding: 0,
                                        }
                                    }}
                                    sx={{ flex: 1, minHeight: 32, background: 'transparent', pl: 0, pr: 0 }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>
        </div>
    );
}

export default ToDoList;