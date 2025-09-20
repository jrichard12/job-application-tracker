import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { UserInfo } from '../../types/UserInfo';
import { dataUtils, jobFilters } from './statsUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ApplicationTrendLineChartProps {
  userInfo: UserInfo;
}

const ApplicationTrendLineChart = ({ userInfo }: ApplicationTrendLineChartProps) => {
  // Group applications by week using shared utility
  const weeklyData = dataUtils.groupJobsByWeek(
    userInfo.jobApps || [], 
    jobFilters.isNotInterestedForTrend
  );

  // Get last 12 weeks of data
  const weeks = Object.keys(weeklyData).sort().slice(-12);
  const labels = weeks.map(week => {
    const date = new Date(week);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const applicationData = weeks.map(week => weeklyData[week] || 0);
  
  // Calculate cumulative data
  let cumulative = 0;
  const cumulativeData = applicationData.map(count => {
    cumulative += count;
    return cumulative;
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Weekly Applications',
        data: applicationData,
        borderColor: '#432371',
        backgroundColor: 'rgba(67, 35, 113, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#432371',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Cumulative Applications',
        data: cumulativeData,
        borderColor: '#FAAE7B',
        backgroundColor: 'rgba(250, 174, 123, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#FAAE7B',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            family: 'Noto Sans Mono, sans-serif',
            size: 12,
            weight: 500,
          },
          color: '#3d4852',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#3d4852',
        bodyColor: '#3d4852',
        borderColor: '#dee2e6',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6c757d',
          font: {
            family: 'Noto Sans Mono, sans-serif',
            size: 11,
          },
          maxRotation: 45,
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: {
          color: 'rgba(108, 117, 125, 0.1)',
        },
        ticks: {
          color: '#6c757d',
          font: {
            family: 'Noto Sans Mono, sans-serif',
            size: 11,
          },
          stepSize: 1,
          maxTicksLimit: 6,
        },
        title: {
          display: true,
          text: 'Number of Applications',
          color: '#3d4852',
          font: {
            family: 'Noto Sans Mono, sans-serif',
            size: 12,
            weight: 600,
          },
        },
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <Card className="chart-card" elevation={3}>
      <CardContent className="chart-content">
        <Typography variant="h6" className="chart-title">
          Total Applications (Last 12 Weeks)
        </Typography>
        <Box className="chart-container" sx={{ height: 300 }}>
          <Line data={data} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ApplicationTrendLineChart;
