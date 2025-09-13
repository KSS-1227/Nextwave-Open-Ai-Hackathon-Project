import { useEffect, useRef } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

interface ChartData {
  labels: string[];
  datasets: any[];
}

export function CashFlowChart() {
  const data: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Cash Inflow',
        data: [450000, 520000, 480000, 590000, 550000, 600000],
        borderColor: 'hsl(142 76% 36%)',
        backgroundColor: 'hsl(142 76% 36% / 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Cash Outflow',
        data: [420000, 480000, 450000, 520000, 500000, 530000],
        borderColor: 'hsl(0 84% 55%)',
        backgroundColor: 'hsl(0 84% 55% / 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '₹' + (value / 1000) + 'K';
          }
        }
      }
    }
  };

  return (
    <Card className="modern-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Cash Flow Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ExpenseBreakdownChart() {
  const data: ChartData = {
    labels: ['Inventory', 'Rent', 'Utilities', 'Staff', 'Marketing', 'Others'],
    datasets: [
      {
        data: [250000, 80000, 25000, 120000, 30000, 45000],
        backgroundColor: [
          'hsl(220 91% 40%)',
          'hsl(142 76% 36%)',
          'hsl(43 96% 56%)',
          'hsl(0 84% 55%)',
          'hsl(262 83% 58%)',
          'hsl(24 95% 53%)'
        ],
        borderWidth: 0
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ₹${context.parsed.toLocaleString('en-IN')} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <Card className="modern-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Expense Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Doughnut data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

export function RevenueComparisonChart() {
  const data: ChartData = {
    labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
    datasets: [
      {
        label: 'This Year',
        data: [1400000, 1650000, 1520000, 1800000],
        backgroundColor: 'hsl(142 76% 36%)',
        borderRadius: 4
      },
      {
        label: 'Last Year',
        data: [1200000, 1450000, 1380000, 1600000],
        backgroundColor: 'hsl(220 91% 40%)',
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '₹' + (value / 100000) + 'L';
          }
        }
      }
    }
  };

  return (
    <Card className="modern-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Revenue Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

export function AdvancedChartsGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CashFlowChart />
      <ExpenseBreakdownChart />
      <div className="lg:col-span-2">
        <RevenueComparisonChart />
      </div>
    </div>
  );
}