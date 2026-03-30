export const ROUTE_PATHS = {
  HOME: '/',
  DASHBOARD: '/',
  LOGS: '/logs',
  EVENTS: '/events',
  BUDGET: '/budget',
  SETTINGS: '/settings',
} as const;

export type SpendingType = 'AP_RECOVERY' | 'SUMMON' | 'SHOP' | 'EVENT' | 'OTHER';

export const SPENDING_TYPES: Record<SpendingType, string> = {
  AP_RECOVERY: 'AP 회복',
  SUMMON: '캐릭터 모집',
  SHOP: '상점 구매',
  EVENT: '이벤트 소모',
  OTHER: '기타',
};

export interface User {
  user_id: string;
  username: string;
  level: number;
  pyroxene_balance: number;
  credits_balance: number;
  elphis_balance: number;
}

export interface PyroxeneLog {
  log_id: string;
  user_id: string;
  date: string;
  amount: number;
  type: SpendingType;
  event_name?: string;
  notes?: string;
}

export interface EventReward {
  require_point: number;
  rewards: {
    pyroxene?: number;
    credits?: number;
    elphis?: number;
    fragments?: number;
  };
}

export interface Event {
  event_id: string;
  name: string;
  start_date: string;
  end_date: string;
  reward_table: EventReward[];
  status: 'ongoing' | 'upcoming' | 'ended';
}

export interface Budget {
  budget_id: string;
  user_id: string;
  period: 'weekly' | 'monthly';
  limit: number;
  current_spending: number;
  start_date: string;
  end_date: string;
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ko-KR').format(num);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

export const calculateROI = (
  pyroxeneSpent: number,
  rewardsReceived: {
    pyroxene?: number;
    credits?: number;
    elphis?: number;
    fragments?: number;
  }
): { netPyroxene: number; isProfit: boolean; roi: number } => {
  const pyroxeneGained = rewardsReceived.pyroxene || 0;
  const netPyroxene = pyroxeneGained - pyroxeneSpent;
  const isProfit = netPyroxene >= 0;
  const roi = pyroxeneSpent > 0 ? (netPyroxene / pyroxeneSpent) * 100 : 0;

  return { netPyroxene, isProfit, roi };
};

export const calculateBudgetStatus = (
  budget: Budget
): { remaining: number; percentage: number; isOverBudget: boolean; isWarning: boolean } => {
  const remaining = budget.limit - budget.current_spending;
  const percentage = (budget.current_spending / budget.limit) * 100;
  const isOverBudget = percentage > 100;
  const isWarning = percentage >= 80 && percentage <= 100;

  return { remaining, percentage, isOverBudget, isWarning };
};
