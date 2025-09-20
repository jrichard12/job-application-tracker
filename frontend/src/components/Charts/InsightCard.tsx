import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import type { UserInfo } from '../../types/UserInfo';
import { getCoreStats } from './statsUtils';
import './InsightCard.scss';

interface InsightCardProps {
  userInfo: UserInfo;
}

const InsightCard = ({ userInfo }: InsightCardProps) => {
  // Get all statistics using shared utility functions
  const {
    responseRate,
    interviewRate,
    offerRate
  } = getCoreStats(userInfo);

  // Calculate trend (mock calculation for demo)
  const performanceScore = responseRate + (interviewRate * 2) + (offerRate * 3);
  let performanceLevel = 'Good';
  let trendIcon = <TrendingFlat />;
  let performanceTrend = 'average';

  if (performanceScore > 150) {
    performanceLevel = 'Excellent';
    trendIcon = <TrendingUp />;
    performanceTrend = 'good';
  } else if (performanceScore > 100) {
    performanceLevel = 'Very Good';
    trendIcon = <TrendingUp />;
    performanceTrend = 'good';
  } else if (performanceScore < 50) {
    performanceLevel = 'Needs Improvement';
    trendIcon = <TrendingDown />;
    performanceTrend = 'poor';
  }

  const insights = [
    {
      label: 'Response Rate',
      value: `${responseRate}%`,
      status: responseRate > 30 ? 'good' : responseRate > 15 ? 'average' : 'low'
    },
    {
      label: 'Interview Rate',
      value: `${interviewRate}%`,
      status: interviewRate > 20 ? 'good' : interviewRate > 10 ? 'average' : 'low'
    },
    {
      label: 'Offer Rate',
      value: `${offerRate}%`,
      status: offerRate > 10 ? 'good' : offerRate > 5 ? 'average' : 'low'
    }
  ];

  return (
    <Card className="insight-card" elevation={3}>
      <CardContent className="insight-content">
        <Typography variant="h6" className="insight-title">
          Performance Insights
        </Typography>

        <Box className="performance-overview">
          <Box className="performance-score">
            <Typography variant="h4" className={`score-value score-value--${performanceTrend}`}>
              {performanceLevel}
            </Typography>
            <Box className={`score-trend score-trend--${performanceTrend}`}>
              {trendIcon}
              <Typography variant="body2" className="trend-label">
                Overall Performance
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box className="insights-grid">
          {insights.map((insight, index) => (
            <Box key={index} className="insight-item">
              <Typography variant="body2" className="insight-label">
                {insight.label}
              </Typography>
              <Box className="insight-value-row">
                <Typography variant="h6" className="insight-value">
                  {insight.value}
                </Typography>
                <Chip 
                  label={insight.status} 
                  size="small" 
                  className={`status-chip status-chip--${insight.status}`}
                />
              </Box>
            </Box>
          ))}
        </Box>

        <Box className="recommendations">
          <Typography variant="subtitle2" className="recommendations-title">
            💡 Quick Tips
          </Typography>
          <Typography variant="body2" className="recommendation-text">
            {responseRate < 30 
              ? "Consider customizing your applications more for each role to improve response rates."
              : interviewRate < 20 
                ? "Great response rate! Focus on improving interview preparation to convert more responses to interviews."
                : "Excellent performance! Keep up the great work and continue building your network."
            }
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InsightCard;
