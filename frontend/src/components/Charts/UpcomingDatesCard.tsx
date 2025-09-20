import { Box, Card, CardContent, Typography, Chip, Avatar } from '@mui/material';
import { 
  Event, 
  Schedule, 
  CalendarToday,
  AccessTime
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { UserInfo } from '../../types/UserInfo';
import { dataUtils } from './statsUtils';
import './UpcomingDatesCard.scss';

interface UpcomingDatesCardProps {
  userInfo: UserInfo;
}

const UpcomingDatesCard = ({ userInfo }: UpcomingDatesCardProps) => {
  const navigate = useNavigate();
  const upcomingDates: Array<{
    id: string;
    jobId: string;
    type: 'deadline' | 'interview';
    company: string;
    position: string;
    date: Date;
    daysUntil: number;
  }> = [];

  // Process job applications for upcoming dates
  userInfo.jobApps?.forEach(job => {
    // Application deadlines (only for jobs not yet applied to)
    if (!job.dateApplied && job.deadline) {
      const deadlineDate = new Date(job.deadline);
      const daysUntil = dataUtils.getDaysUntil(deadlineDate);
      
      // Show deadlines for next 7 days only (including today)
      if (daysUntil >= 0 && daysUntil <= 7) {
        upcomingDates.push({
          id: `deadline-${job.id}`,
          jobId: job.id,
          type: 'deadline',
          company: job.company,
          position: job.jobTitle,
          date: deadlineDate,
          daysUntil
        });
      }
    }

    // Interview dates
    if (job.interviewDate) {
      const interviewDate = new Date(job.interviewDate);
      const daysUntil = dataUtils.getDaysUntil(interviewDate);
      
      // Show interviews for next 7 days only (including today)
      if (daysUntil >= 0 && daysUntil <= 7) {
        upcomingDates.push({
          id: `interview-${job.id}`,
          jobId: job.id,
          type: 'interview',
          company: job.company,
          position: job.jobTitle,
          date: interviewDate,
          daysUntil
        });
      }
    }
  });

  // Sort by date (closest first)
  upcomingDates.sort((a, b) => a.daysUntil - b.daysUntil);

  const getUrgencyColor = (daysUntil: number, type: 'deadline' | 'interview') => {
    // Handle overdue items
    if (daysUntil < 0) return 'error';
    
    if (type === 'deadline') {
      if (daysUntil === 0) return 'error'; // Due today
      if (daysUntil <= 3) return 'warning'; // Due within 3 days
      if (daysUntil <= 7) return 'primary'; // Due within a week
      return 'secondary'; // Due later
    } else {
      if (daysUntil === 0) return 'success'; // Interview today
      if (daysUntil <= 2) return 'warning'; // Interview within 2 days
      if (daysUntil <= 7) return 'primary'; // Interview within a week
      return 'secondary'; // Interview later
    }
  };

  const getUrgencyText = (daysUntil: number) => {
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days ago`;
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    return `${daysUntil} days`;
  };

  const handleDateItemClick = (jobId: string) => {
    navigate(`/applications?jobId=${jobId}`);
  };

  return (
    <Card className="upcoming-dates-card" elevation={3}>
      <CardContent className="upcoming-dates-content">
        <Typography variant="h6" className="upcoming-dates-title">
          <Event sx={{ marginRight: 1, verticalAlign: 'middle' }} />
          Upcoming Important Dates
        </Typography>

        {upcomingDates.length === 0 ? (
          <Box className="no-dates">
            <CalendarToday sx={{ fontSize: 48, color: '#ccc', marginBottom: 2 }} />
            <Typography variant="body1" color="textSecondary">
              No important dates in the next 7 days
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Keep applying to jobs and scheduling interviews!
            </Typography>
          </Box>
        ) : (
          <Box className="dates-list-container">
            <Box className="dates-list">
              {upcomingDates.map((item) => (
                <Box 
                  key={item.id} 
                  className="date-item"
                  onClick={() => handleDateItemClick(item.jobId)}
                  sx={{ cursor: 'pointer' }}
                >
                  <Box className="date-top-row">
                    <Box className="date-icon">
                      <Avatar className={`date-avatar date-avatar--${item.type}`}>
                        {item.type === 'deadline' ? <Schedule /> : <AccessTime />}
                      </Avatar>
                    </Box>
                    
                    <Box className="date-action-info">
                      <Typography variant="subtitle2" className="action-type">
                        {item.type === 'deadline' ? 'Application Due' : 'Interview Date'}
                      </Typography>
                      <Typography variant="body2" className="action-date">
                        {dataUtils.formatDateForDisplay(item.date)}
                      </Typography>
                    </Box>
                    
                    <Box className="urgency-indicator">
                      <Chip 
                        label={getUrgencyText(item.daysUntil)}
                        size="small"
                        className={`urgency-chip urgency-chip--${getUrgencyColor(item.daysUntil, item.type)}`}
                      />
                    </Box>
                  </Box>
                  
                  <Box className="date-bottom-row">
                    <Typography variant="h6" className="job-info">
                      {item.position} @ {item.company}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingDatesCard;
