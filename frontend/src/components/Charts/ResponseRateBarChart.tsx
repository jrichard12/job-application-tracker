import { Card, CardContent, Typography, Box } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { UserInfo } from '../../types/UserInfo';
import { dataUtils, jobFilters } from './statsUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ResponseRateBarChartProps {
  userInfo: UserInfo;
}

const ResponseRateBarChart = ({ userInfo }: ResponseRateBarChartProps) => {
  // Group applications by month using shared utility and calculate response rates
  const applicationsByMonth = dataUtils.groupJobsByMonth(
    userInfo.jobApps || [],
    jobFilters.isValidApplication
  );
  
  // Calculate response data for each month
  const monthlyData = Object.keys(applicationsByMonth).reduce((acc, monthKey) => {
    const monthJobs = applicationsByMonth[monthKey];
    const appliedCount = monthJobs.length;
    const respondedCount = monthJobs.filter(jobFilters.hasResponse).length;
    
    acc[monthKey] = { applied: appliedCount, responded: respondedCount };
    return acc;
  }, {} as Record<string, { applied: number; responded: number }>);

  // Get last 6 months of data
  const months = Object.keys(monthlyData).sort().slice(-6);
  const labels = months.map(month => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  });

  const appliedData = months.map(month => monthlyData[month]?.applied || 0);
  const respondedData = months.map(month => monthlyData[month]?.responded || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Applications Sent',
        data: appliedData,
        backgroundColor: 'rgba(67, 35, 113, 0.6)',
        borderColor: '#432371',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Responses Received',
        data: respondedData,
        backgroundColor: 'rgba(250, 174, 123, 0.6)',
        borderColor: '#FAAE7B',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
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
          pointStyle: 'rect',
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
          afterBody: (context) => {
            const dataIndex = context[0].dataIndex;
            const month = months[dataIndex];
            const monthData = monthlyData[month];
            if (monthData && monthData.applied > 0) {
              const responseRate = Math.round((monthData.responded / monthData.applied) * 100);
              return `Response Rate: ${responseRate}%`;
            }
            return '';
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
          maxTicksLimit: 6,
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
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
          text: 'Number of Applications/Responses',
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
      duration: 1000,
    },
  };

  return (
    <Card className="chart-card" elevation={3}>
      <CardContent className="chart-content">
        <Typography variant="h6" className="chart-title">
          Monthly Applications vs Responses
        </Typography>
        <Box className="chart-container" sx={{ height: 300 }}>
          <Bar data={data} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ResponseRateBarChart;
