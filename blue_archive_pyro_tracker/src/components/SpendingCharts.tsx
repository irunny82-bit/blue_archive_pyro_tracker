import { useState, useMemo } from 'react';
import { PyroxeneLog, SPENDING_TYPES, formatNumber } from '@/lib/index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { springPresets } from '@/lib/motion';

interface SpendingChartsProps {
  logs: PyroxeneLog[];
}

type PeriodFilter = 'daily' | 'weekly' | 'monthly';

const CHART_COLORS = {
  AP_RECOVERY: 'hsl(var(--chart-1))',
  SUMMON: 'hsl(var(--chart-2))',
  SHOP: 'hsl(var(--chart-3))',
  EVENT: 'hsl(var(--chart-4))',
  OTHER: 'hsl(var(--chart-5))',
};

export function SpendingCharts({ logs }: SpendingChartsProps) {
  const [period, setPeriod] = useState<PeriodFilter>('weekly');

  const filteredLogs = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (period) {
      case 'daily':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'weekly':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'monthly':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
    }

    return logs.filter((log) => new Date(log.date) >= cutoffDate);
  }, [logs, period]);

  const trendData = useMemo(() => {
    const dataMap = new Map<string, number>();

    filteredLogs.forEach((log) => {
      const date = new Date(log.date);
      let key: string;

      switch (period) {
        case 'daily':
          key = `${date.getMonth() + 1}/${date.getDate()}`;
          break;
        case 'weekly': {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
          break;
        }
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      dataMap.set(key, (dataMap.get(key) || 0) + log.amount);
    });

    return Array.from(dataMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => {
        const [aMonth, aDay] = a.date.split(/[-\/]/).map(Number);
        const [bMonth, bDay] = b.date.split(/[-\/]/).map(Number);
        return aMonth !== bMonth ? aMonth - bMonth : (aDay || 0) - (bDay || 0);
      });
  }, [filteredLogs, period]);

  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();

    filteredLogs.forEach((log) => {
      const category = SPENDING_TYPES[log.type];
      categoryMap.set(category, (categoryMap.get(category) || 0) + log.amount);
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredLogs]);

  const barData = useMemo(() => {
    const typeMap = new Map<string, Record<string, number>>();

    filteredLogs.forEach((log) => {
      const date = new Date(log.date);
      let key: string;

      switch (period) {
        case 'daily':
          key = `${date.getMonth() + 1}/${date.getDate()}`;
          break;
        case 'weekly': {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
          break;
        }
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!typeMap.has(key)) {
        typeMap.set(key, {});
      }

      const typeData = typeMap.get(key)!;
      const typeName = SPENDING_TYPES[log.type];
      typeData[typeName] = (typeData[typeName] || 0) + log.amount;
    });

    return Array.from(typeMap.entries())
      .map(([date, types]) => ({ date, ...types }))
      .sort((a, b) => {
        const [aMonth, aDay] = a.date.split(/[-\/]/).map(Number);
        const [bMonth, bDay] = b.date.split(/[-\/]/).map(Number);
        return aMonth !== bMonth ? aMonth - bMonth : (aDay || 0) - (bDay || 0);
      });
  }, [filteredLogs, period]);

  const totalSpending = useMemo(
    () => filteredLogs.reduce((sum, log) => sum + log.amount, 0),
    [filteredLogs]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">지출 추세</h2>
          <p className="text-sm text-muted-foreground mt-1">
            총 지출: <span className="font-mono font-semibold text-foreground">{formatNumber(totalSpending)}</span> 청휘석
          </p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
          <TabsList>
            <TabsTrigger value="daily">일간</TabsTrigger>
            <TabsTrigger value="weekly">주간</TabsTrigger>
            <TabsTrigger value="monthly">월간</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="backdrop-blur-md bg-card/80 shadow-lg">
        <CardHeader>
          <CardTitle>시간별 추세</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                formatter={(value: number) => [formatNumber(value), '청휘석']}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="backdrop-blur-md bg-card/80 shadow-lg">
          <CardHeader>
            <CardTitle>카테고리별 비율</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {categoryData.map((entry, index) => {
                    const typeKey = Object.keys(SPENDING_TYPES).find(
                      (key) => SPENDING_TYPES[key as keyof typeof SPENDING_TYPES] === entry.name
                    ) as keyof typeof CHART_COLORS | undefined;
                    const color = typeKey ? CHART_COLORS[typeKey] : 'hsl(var(--muted))';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                  formatter={(value: number) => [formatNumber(value), '청휘석']}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => value}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-card/80 shadow-lg">
          <CardHeader>
            <CardTitle>기간별 합계</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                  formatter={(value: number) => [formatNumber(value), '청휘석']}
                />
                <Legend />
                {Object.entries(SPENDING_TYPES).map(([key, label]) => (
                  <Bar
                    key={key}
                    dataKey={label}
                    stackId="a"
                    fill={CHART_COLORS[key as keyof typeof CHART_COLORS]}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
