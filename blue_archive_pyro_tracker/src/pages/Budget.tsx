import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useDashboardData } from '@/hooks/useDashboardData';
import { BudgetManager } from '@/components/BudgetManager';
import { SpendingCharts } from '@/components/SpendingCharts';
import { calculateBudgetStatus, formatNumber, formatDate } from '@/lib/index';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

export default function Budget() {
  const { budget, logs, updateBudget } = useDashboardData();
  const budgetStatus = calculateBudgetStatus(budget);

  const budgetHistory = useMemo(() => {
    const history: Array<{
      period: string;
      limit: number;
      spending: number;
      percentage: number;
    }> = [];

    const currentDate = new Date();
    const monthsToShow = 6;

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);

      const periodLogs = logs.filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= periodStart && logDate <= periodEnd;
      });

      const spending = periodLogs.reduce((sum, log) => sum + log.amount, 0);
      const limit = budget.limit;
      const percentage = limit > 0 ? (spending / limit) * 100 : 0;

      history.push({
        period: periodStart.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' }),
        limit,
        spending,
        percentage,
      });
    }

    return history;
  }, [logs, budget.limit]);

  const weeklyBreakdown = useMemo(() => {
    const budgetStart = new Date(budget.start_date);
    const budgetEnd = new Date(budget.end_date);
    const totalDays = Math.ceil((budgetEnd.getTime() - budgetStart.getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(totalDays / 7);

    const breakdown: Array<{
      week: number;
      spending: number;
      percentage: number;
    }> = [];

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(budgetStart);
      weekStart.setDate(budgetStart.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekLogs = logs.filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= weekStart && logDate <= weekEnd;
      });

      const spending = weekLogs.reduce((sum, log) => sum + log.amount, 0);
      const weeklyLimit = budget.limit / weeks;
      const percentage = weeklyLimit > 0 ? (spending / weeklyLimit) * 100 : 0;

      breakdown.push({
        week: i + 1,
        spending,
        percentage,
      });
    }

    return breakdown;
  }, [logs, budget]);

  const insights = useMemo(() => {
    const insights: Array<{
      type: 'success' | 'warning' | 'danger' | 'info';
      message: string;
      icon: typeof CheckCircle2;
    }> = [];

    if (budgetStatus.isOverBudget) {
      insights.push({
        type: 'danger',
        message: `예산을 ${formatNumber(Math.abs(budgetStatus.remaining))} 초과했습니다. 지출을 줄이는 것을 권장합니다.`,
        icon: AlertTriangle,
      });
    } else if (budgetStatus.isWarning) {
      insights.push({
        type: 'warning',
        message: `예산의 ${budgetStatus.percentage.toFixed(0)}%를 사용했습니다. 남은 기간 동안 신중한 지출이 필요합니다.`,
        icon: TrendingUp,
      });
    } else {
      insights.push({
        type: 'success',
        message: `예산 관리가 잘 되고 있습니다. 남은 예산: ${formatNumber(budgetStatus.remaining)}`,
        icon: CheckCircle2,
      });
    }

    const avgMonthlySpending =
      budgetHistory.length > 0
        ? budgetHistory.reduce((sum, h) => sum + h.spending, 0) / budgetHistory.length
        : 0;

    if (budget.current_spending > avgMonthlySpending * 1.2) {
      insights.push({
        type: 'warning',
        message: `이번 기간 지출이 평균보다 20% 높습니다. 평균: ${formatNumber(avgMonthlySpending)}`,
        icon: TrendingUp,
      });
    } else if (budget.current_spending < avgMonthlySpending * 0.8) {
      insights.push({
        type: 'info',
        message: `이번 기간 지출이 평균보다 20% 낮습니다. 평균: ${formatNumber(avgMonthlySpending)}`,
        icon: TrendingDown,
      });
    }

    return insights;
  }, [budgetStatus, budgetHistory, budget.current_spending]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <motion.div
        className="container mx-auto max-w-7xl space-y-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItem}>
          <h1 className="text-4xl font-bold text-foreground mb-2">예산 관리</h1>
          <p className="text-muted-foreground">청휘석 예산을 설정하고 지출 패턴을 분석하세요</p>
        </motion.div>

        <motion.div variants={staggerItem} className="grid gap-6 md:grid-cols-3">
          <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">현재 예산</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{formatNumber(budget.limit)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {budget.period === 'monthly' ? '월간' : '주간'} 한도
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">사용 금액</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{formatNumber(budget.current_spending)}</div>
              <Progress value={budgetStatus.percentage} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">{budgetStatus.percentage.toFixed(1)}% 사용</p>
            </CardContent>
          </Card>

          <Card
            className={`bg-card/80 backdrop-blur-md border-border/50 shadow-lg ${
              budgetStatus.isOverBudget
                ? 'border-destructive/50'
                : budgetStatus.isWarning
                ? 'border-yellow-500/50'
                : 'border-green-500/50'
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">남은 예산</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${
                  budgetStatus.isOverBudget
                    ? 'text-destructive'
                    : budgetStatus.isWarning
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}
              >
                {budgetStatus.isOverBudget ? '-' : ''}
                {formatNumber(Math.abs(budgetStatus.remaining))}
              </div>
              <Badge
                variant={budgetStatus.isOverBudget ? 'destructive' : 'secondary'}
                className="mt-2"
              >
                {budgetStatus.isOverBudget ? '예산 초과' : budgetStatus.isWarning ? '주의 필요' : '안전'}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>예산 설정</CardTitle>
              <CardDescription>
                {formatDate(budget.start_date)} ~ {formatDate(budget.end_date)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BudgetManager budget={budget} onUpdateBudget={updateBudget} />
            </CardContent>
          </Card>
        </motion.div>

        {insights.length > 0 && (
          <motion.div variants={staggerItem}>
            <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle>인사이트</CardTitle>
                <CardDescription>AI 기반 예산 분석 및 권장사항</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight, index) => {
                  const Icon = insight.icon;
                  return (
                    <motion.div
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-lg border ${
                        insight.type === 'success'
                          ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                          : insight.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800'
                          : insight.type === 'danger'
                          ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                          : 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...springPresets.gentle, delay: index * 0.1 }}
                    >
                      <Icon
                        className={`w-5 h-5 mt-0.5 ${
                          insight.type === 'success'
                            ? 'text-green-600'
                            : insight.type === 'warning'
                            ? 'text-yellow-600'
                            : insight.type === 'danger'
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`}
                      />
                      <p className="text-sm text-foreground flex-1">{insight.message}</p>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div variants={staggerItem}>
          <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>월별 예산 히스토리</CardTitle>
              <CardDescription>최근 6개월 예산 대비 지출 추이</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetHistory.map((item, index) => (
                  <motion.div
                    key={index}
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springPresets.gentle, delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{item.period}</span>
                      <span className="text-muted-foreground">
                        {formatNumber(item.spending)} / {formatNumber(item.limit)}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(item.percentage, 100)}
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.percentage.toFixed(1)}% 사용</span>
                      {item.percentage > 100 && (
                        <Badge variant="destructive" className="text-xs">
                          초과
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>주간 지출 분석</CardTitle>
              <CardDescription>현재 예산 기간 내 주별 지출 현황</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {weeklyBreakdown.map((week, index) => (
                  <motion.div
                    key={index}
                    className="p-4 rounded-lg border border-border bg-muted/30"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...springPresets.snappy, delay: index * 0.05 }}
                  >
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {week.week}주차
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-2">
                      {formatNumber(week.spending)}
                    </div>
                    <Progress value={Math.min(week.percentage, 100)} className="h-1.5 mb-1" />
                    <div className="text-xs text-muted-foreground">
                      {week.percentage.toFixed(0)}%
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>지출 차트</CardTitle>
              <CardDescription>카테고리별 지출 분석 및 추세</CardDescription>
            </CardHeader>
            <CardContent>
              <SpendingCharts logs={logs} />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
