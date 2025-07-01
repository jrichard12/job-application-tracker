import { CardContent, Typography } from "@mui/material";
import { useState } from 'react';
import List from '@mui/material/List';
import "./ToDoList.scss"
import "./CheckBoxItem"
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import CheckBoxItem from "./CheckBoxItem";

type ToDoItem = {
    id: number
    checked: boolean,
    text: string,
}

function ToDoList() {
    const [todoItems, setToDoItems] = useState<ToDoItem[]>([]);

    const newToDoItem = {
        id: Date.now() + Math.random(),
        checked: false,
        text: ''
    }

    const handleAddItem = () => {
        setToDoItems([...todoItems, newToDoItem]);
    };

    return (
        <div className="toDoList">
            <Card>
                <CardContent>
                    <Typography>
                        To Do List
                    </Typography>
                    <List>
                        {
                            todoItems.map((item: ToDoItem, index: number) => {
                                return <CheckBoxItem key={index} text={item.text} checked={item.checked} />
                            })
                        }
                    </List>
                </CardContent>
                <CardActions>
                    <Button onClick={handleAddItem}>Add Item</Button>
                </CardActions>
            </Card>
        </div>
    );
}

export default ToDoList;