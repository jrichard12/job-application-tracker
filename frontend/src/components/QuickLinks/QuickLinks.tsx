import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { List, ListItemButton, ListItemText, Typography } from '@mui/material';

import "./QuickLinks.scss"

function QuickLinks() {
    const links = ['https://www.glassdoor.ca', 'https://www.indeed.ca', 'https://www.linkedin.com/jobs'];

    return (
        <div className='quickLinks'>
            <Card>
                <CardContent>
                    <Typography>
                        Quick Links
                    </Typography>
                    <List>
                        {
                            links.map((link: string) => {
                                return (<ListItemButton component="a" href={link}>
                                    <ListItemText primary={link.split('.')[1]} />
                                </ListItemButton>)
                            })
                        }
                    </List>
                </CardContent>
            </Card>
        </div>
    );
}

export default QuickLinks;