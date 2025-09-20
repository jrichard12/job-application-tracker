import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { 
  Work, 
  Schedule, 
  CheckCircle, 
  Cancel, 
  TrendingUp,
  Person,
  Assessment,
  Timeline
} from '@mui/icons-material';
import type { UserInfo } from '../../types/UserInfo';
import { getCoreStats } from './statsUtils';
import './CombinedStatsCard.scss';

interface CombinedStatsCardProps {
  userInfo: UserInfo;
}

const CombinedStatsCard = ({ userInfo }: CombinedStatsCardProps) => {
  // Get all statistics using shared utility functions
  const coreStats = getCoreStats(userInfo);
  
  const {
    totalApplications,
    totalApplied: pendingResponse,
    totalRejections,
    totalOffers,
    totalInterviews,
    responseRate,
    interviewRate,
    offerRate
  } = coreStats;

  const stats = [
    {
      title: 'Total Applications',
      value: totalApplications,
      icon: <Work />,
      color: 'primary',
      subtitle: 'Jobs Applied To'
    },
    {
      title: 'Pending Response',
      value: pendingResponse,
      icon: <Schedule />,
      color: 'tertiary',
      subtitle: 'Awaiting Reply'
    },
    {
      title: 'Interviews',
      value: totalInterviews,
      icon: <Person />,
      color: 'secondary',
      subtitle: 'Interview Invitations'
    },
    {
      title: 'Job Offers',
      value: totalOffers,
      icon: <CheckCircle />,
      color: 'success',
      subtitle: 'Offers Received'
    },
    {
      title: 'Rejections',
      value: totalRejections,
      icon: <Cancel />,
      color: 'error',
      subtitle: 'Not Selected'
    },
    {
      title: 'Response Rate',
      value: `${responseRate}%`,
      icon: <Assessment />,
      color: responseRate > 30 ? 'success' : responseRate > 15 ? 'secondary' : 'error',
      subtitle: 'Overall Response'
    },
    {
      title: 'Interview Rate',
      value: `${interviewRate}%`,
      icon: <Timeline />,
      color: interviewRate > 20 ? 'success' : interviewRate > 10 ? 'secondary' : 'error',
      subtitle: 'Interview Success'
    },
    {
      title: 'Offer Rate',
      value: `${offerRate}%`,
      icon: <TrendingUp />,
      color: offerRate > 10 ? 'success' : offerRate > 5 ? 'secondary' : 'error',
      subtitle: 'Conversion Rate'
    }
  ];

  return (
    <Card className="combined-stats-card" elevation={3}>
      <CardContent className="combined-stats-content">
        <Typography variant="h6" className="combined-stats-title">
          General Statistics
        </Typography>
        
        <Grid container spacing={3} className="stats-grid">
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }} key={index}>
              <Box className={`stat-item stat-item--${stat.color}`}>
                <Box className="stat-header">
                  <Box className={`stat-icon stat-icon--${stat.color}`}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" className="stat-value">
                    {stat.value}
                  </Typography>
                </Box>
                <Typography variant="h6" className="stat-title">
                  {stat.title}
                </Typography>
                <Typography variant="body2" className="stat-subtitle">
                  {stat.subtitle}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CombinedStatsCard;
