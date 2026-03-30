import { User, Budget, formatNumber, calculateBudgetStatus } from "@/lib/index";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Gem, Coins, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { springPresets } from "@/lib/motion";

interface AccountSummaryProps {
  user: User;
  budget: Budget;
  recentSpending: number;
}

export function AccountSummary({ user, budget, recentSpending }: AccountSummaryProps) {
  const budgetStatus = calculateBudgetStatus(budget);

  const resources = [
    {
      icon: Gem,
      label: "청휘석",
      value: user.pyroxene_balance,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Coins,
      label: "크레딧",
      value: user.credits_balance,
      color: "text-chart-5",
      bgColor: "bg-chart-5/10",
    },
    {
      icon: Award,
      label: "엘레프",
      value: user.elphis_balance,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
      className="space-y-4"
    >
      <Card className="p-6 backdrop-blur-md bg-card/80 border-border/50 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">선생님 프로필</h2>
            <p className="text-sm text-muted-foreground mt-1">{user.username}</p>
          </div>
          <Badge
            variant="secondary"
            className="text-lg px-4 py-2 bg-primary/10 text-primary border-primary/20"
          >
            Lv. {user.level}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <motion.div
                key={resource.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...springPresets.snappy, delay: index * 0.1 }}
                className={`flex items-center gap-3 p-4 rounded-xl ${resource.bgColor} border border-border/30`}
              >
                <div className={`p-2 rounded-lg bg-background/50 ${resource.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{resource.label}</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatNumber(resource.value)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {budget.period === "monthly" ? "이번 달" : "이번 주"} 예산
              </span>
            </div>
            <span
              className={`text-sm font-semibold ${
                budgetStatus.isOverBudget
                  ? "text-destructive"
                  : budgetStatus.isWarning
                  ? "text-chart-5"
                  : "text-chart-3"
              }`}
            >
              {formatNumber(Math.abs(budgetStatus.remaining))}
              {budgetStatus.isOverBudget ? " 초과" : " 남음"}
            </span>
          </div>

          <div className="space-y-2">
            <Progress
              value={Math.min(budgetStatus.percentage, 100)}
              className={`h-3 [&>div]:transition-all [&>div]:duration-500 ${
                budgetStatus.isOverBudget
                  ? "[&>div]:bg-destructive"
                  : budgetStatus.isWarning
                  ? "[&>div]:bg-chart-5"
                  : "[&>div]:bg-chart-3"
              }`}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                사용: {formatNumber(budget.current_spending)} / {formatNumber(budget.limit)}
              </span>
              <span>{budgetStatus.percentage.toFixed(1)}%</span>
            </div>
          </div>

          {budgetStatus.isOverBudget && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={springPresets.snappy}
              className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
            >
              <p className="text-xs text-destructive font-medium">
                ⚠️ 예산을 초과했습니다. 지출을 조절해주세요.
              </p>
            </motion.div>
          )}

          {budgetStatus.isWarning && !budgetStatus.isOverBudget && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={springPresets.snappy}
              className="mt-3 p-3 rounded-lg bg-chart-5/10 border border-chart-5/20"
            >
              <p className="text-xs text-chart-5 font-medium">
                ⚡ 예산의 80% 이상을 사용했습니다.
              </p>
            </motion.div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">최근 7일 지출</span>
            <span className="text-lg font-semibold text-foreground">
              {formatNumber(recentSpending)}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
