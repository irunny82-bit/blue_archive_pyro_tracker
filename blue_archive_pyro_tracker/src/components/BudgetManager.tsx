import { useState } from 'react';
import { motion } from 'framer-motion';
import { Budget, formatNumber, formatDate, calculateBudgetStatus } from '@/lib/index';
import { springPresets, fadeInUp } from '@/lib/motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertCircle, CheckCircle2, Edit2, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface BudgetManagerProps {
  budget: Budget;
  onUpdateBudget: (budget: Budget) => void;
}

export function BudgetManager({ budget, onUpdateBudget }: BudgetManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBudget, setEditedBudget] = useState<Budget>(budget);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(budget.start_date));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(budget.end_date));

  const budgetStatus = calculateBudgetStatus(budget);

  const handleEdit = () => {
    setEditedBudget(budget);
    setStartDate(new Date(budget.start_date));
    setEndDate(new Date(budget.end_date));
    setIsEditing(true);
  };

  const handleSave = () => {
    const updatedBudget: Budget = {
      ...editedBudget,
      start_date: startDate ? startDate.toISOString().split('T')[0] : editedBudget.start_date,
      end_date: endDate ? endDate.toISOString().split('T')[0] : editedBudget.end_date,
    };
    onUpdateBudget(updatedBudget);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedBudget(budget);
    setStartDate(new Date(budget.start_date));
    setEndDate(new Date(budget.end_date));
    setIsEditing(false);
  };

  const getProgressColor = () => {
    if (budgetStatus.isOverBudget) return 'bg-destructive';
    if (budgetStatus.isWarning) return 'bg-warning';
    return 'bg-primary';
  };

  const getStatusIcon = () => {
    if (budgetStatus.isOverBudget) {
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    }
    if (budgetStatus.isWarning) {
      return <AlertCircle className="h-5 w-5 text-warning" />;
    }
    return <CheckCircle2 className="h-5 w-5 text-primary" />;
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={springPresets.gentle}
      className="w-full"
    >
      <Card className="backdrop-blur-md bg-card/80 border-border/50 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">예산 관리</CardTitle>
              <CardDescription className="mt-1">
                {budget.period === 'weekly' ? '주간' : '월간'} 청휘석 사용 예산
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                수정
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  저장
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {budgetStatus.isOverBudget && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>예산 초과</AlertTitle>
              <AlertDescription>
                예산을 {formatNumber(Math.abs(budgetStatus.remaining))} 청휘석 초과했습니다.
              </AlertDescription>
            </Alert>
          )}

          {budgetStatus.isWarning && !budgetStatus.isOverBudget && (
            <Alert className="border-warning/50 bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertTitle className="text-warning">예산 주의</AlertTitle>
              <AlertDescription className="text-warning">
                예산의 {budgetStatus.percentage.toFixed(0)}%를 사용했습니다. 남은 예산: {formatNumber(budgetStatus.remaining)} 청휘석
              </AlertDescription>
            </Alert>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="period">예산 기간</Label>
                <Select
                  value={editedBudget.period}
                  onValueChange={(value: 'weekly' | 'monthly') =>
                    setEditedBudget({ ...editedBudget, period: value })
                  }
                >
                  <SelectTrigger id="period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">주간</SelectItem>
                    <SelectItem value="monthly">월간</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">예산 한도 (청휘석)</Label>
                <Input
                  id="limit"
                  type="number"
                  value={editedBudget.limit}
                  onChange={(e) =>
                    setEditedBudget({ ...editedBudget, limit: parseInt(e.target.value) || 0 })
                  }
                  className="font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>시작일</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP', { locale: ko }) : '날짜 선택'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>종료일</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP', { locale: ko }) : '날짜 선택'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">예산 기간</p>
                  <p className="text-lg font-semibold">
                    {formatDate(budget.start_date)} ~ {formatDate(budget.end_date)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-muted-foreground">예산 한도</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatNumber(budget.limit)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className="text-sm font-medium">사용 현황</span>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">
                    {budgetStatus.percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={Math.min(budgetStatus.percentage, 100)}
                  className="h-3"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    사용: {formatNumber(budget.current_spending)}
                  </span>
                  <span
                    className={`font-semibold ${
                      budgetStatus.isOverBudget
                        ? 'text-destructive'
                        : budgetStatus.isWarning
                        ? 'text-warning'
                        : 'text-primary'
                    }`}
                  >
                    {budgetStatus.isOverBudget ? '초과: ' : '남은 예산: '}
                    {formatNumber(Math.abs(budgetStatus.remaining))}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">일일 평균 사용</p>
                  <p className="text-lg font-semibold">
                    {formatNumber(
                      Math.round(
                        budget.current_spending /
                          Math.max(
                            1,
                            Math.ceil(
                              (new Date().getTime() - new Date(budget.start_date).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                          )
                      )
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">예상 종료 시 사용량</p>
                  <p className="text-lg font-semibold">
                    {formatNumber(
                      Math.round(
                        (budget.current_spending /
                          Math.max(
                            1,
                            Math.ceil(
                              (new Date().getTime() - new Date(budget.start_date).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                          )) *
                          Math.ceil(
                            (new Date(budget.end_date).getTime() -
                              new Date(budget.start_date).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
