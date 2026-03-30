import {
  User,
  PyroxeneLog,
  Event,
  Budget,
  EventReward,
} from '@/lib/index';

const generateLogId = (index: number): string => `log_${Date.now()}_${index}`;
const generateEventId = (index: number): string => `event_${Date.now()}_${index}`;

const today = new Date();
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 30);

const formatDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const sampleUser: User = {
  user_id: 'guest_user_001',
  username: '선생님',
  level: 78,
  pyroxene_balance: 24500,
  credits_balance: 8500000,
  elphis_balance: 450,
};

export const sampleLogs: PyroxeneLog[] = [
  {
    log_id: generateLogId(1),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
    amount: 600,
    type: 'AP_RECOVERY',
    notes: '총력전 준비 3충전',
  },
  {
    log_id: generateLogId(2),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
    amount: 1200,
    type: 'SUMMON',
    event_name: '페스 픽업',
    notes: '10연차 1회',
  },
  {
    log_id: generateLogId(3),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)),
    amount: 400,
    type: 'AP_RECOVERY',
    notes: '일일 2충전',
  },
  {
    log_id: generateLogId(4),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)),
    amount: 600,
    type: 'AP_RECOVERY',
    notes: '총력전 3충전',
  },
  {
    log_id: generateLogId(5),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)),
    amount: 2400,
    type: 'SUMMON',
    event_name: '페스 픽업',
    notes: '10연차 2회',
  },
  {
    log_id: generateLogId(6),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)),
    amount: 400,
    type: 'AP_RECOVERY',
    notes: '일일 2충전',
  },
  {
    log_id: generateLogId(7),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
    amount: 600,
    type: 'AP_RECOVERY',
    notes: '이벤트 스테이지 3충전',
  },
  {
    log_id: generateLogId(8),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)),
    amount: 400,
    type: 'AP_RECOVERY',
    notes: '일일 2충전',
  },
  {
    log_id: generateLogId(9),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
    amount: 1200,
    type: 'SUMMON',
    event_name: '페스 픽업',
    notes: '10연차 1회',
  },
  {
    log_id: generateLogId(10),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000)),
    amount: 600,
    type: 'AP_RECOVERY',
    notes: '총력전 3충전',
  },
  {
    log_id: generateLogId(11),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000)),
    amount: 400,
    type: 'AP_RECOVERY',
    notes: '일일 2충전',
  },
  {
    log_id: generateLogId(12),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)),
    amount: 300,
    type: 'SHOP',
    notes: '상점 엘레프 구매',
  },
  {
    log_id: generateLogId(13),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 11 * 24 * 60 * 60 * 1000)),
    amount: 400,
    type: 'AP_RECOVERY',
    notes: '일일 2충전',
  },
  {
    log_id: generateLogId(14),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000)),
    amount: 600,
    type: 'AP_RECOVERY',
    notes: '이벤트 3충전',
  },
  {
    log_id: generateLogId(15),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000)),
    amount: 400,
    type: 'AP_RECOVERY',
    notes: '일일 2충전',
  },
  {
    log_id: generateLogId(16),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)),
    amount: 3600,
    type: 'SUMMON',
    event_name: '페스 픽업',
    notes: '10연차 3회',
  },
  {
    log_id: generateLogId(17),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)),
    amount: 600,
    type: 'AP_RECOVERY',
    notes: '총력전 3충전',
  },
  {
    log_id: generateLogId(18),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 16 * 24 * 60 * 60 * 1000)),
    amount: 400,
    type: 'AP_RECOVERY',
    notes: '일일 2충전',
  },
  {
    log_id: generateLogId(19),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 17 * 24 * 60 * 60 * 1000)),
    amount: 200,
    type: 'OTHER',
    notes: '기타 소모',
  },
  {
    log_id: generateLogId(20),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 18 * 24 * 60 * 60 * 1000)),
    amount: 400,
    type: 'AP_RECOVERY',
    notes: '일일 2충전',
  },
  {
    log_id: generateLogId(21),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 19 * 24 * 60 * 60 * 1000)),
    amount: 600,
    type: 'AP_RECOVERY',
    notes: '이벤트 3충전',
  },
  {
    log_id: generateLogId(22),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000)),
    amount: 1200,
    type: 'SUMMON',
    event_name: '일반 픽업',
    notes: '10연차 1회',
  },
  {
    log_id: generateLogId(23),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000)),
    amount: 400,
    type: 'AP_RECOVERY',
    notes: '일일 2충전',
  },
  {
    log_id: generateLogId(24),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 22 * 24 * 60 * 60 * 1000)),
    amount: 600,
    type: 'AP_RECOVERY',
    notes: '총력전 3충전',
  },
  {
    log_id: generateLogId(25),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 23 * 24 * 60 * 60 * 1000)),
    amount: 400,
    type: 'AP_RECOVERY',
    notes: '일일 2충전',
  },
  {
    log_id: generateLogId(26),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 24 * 24 * 60 * 60 * 1000)),
    amount: 500,
    type: 'EVENT',
    event_name: '특별 이벤트',
    notes: '이벤트 교환',
  },
  {
    log_id: generateLogId(27),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000)),
    amount: 400,
    type: 'AP_RECOVERY',
    notes: '일일 2충전',
  },
  {
    log_id: generateLogId(28),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 26 * 24 * 60 * 60 * 1000)),
    amount: 600,
    type: 'AP_RECOVERY',
    notes: '이벤트 3충전',
  },
  {
    log_id: generateLogId(29),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 27 * 24 * 60 * 60 * 1000)),
    amount: 400,
    type: 'AP_RECOVERY',
    notes: '일일 2충전',
  },
  {
    log_id: generateLogId(30),
    user_id: 'guest_user_001',
    date: formatDateString(new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000)),
    amount: 2400,
    type: 'SUMMON',
    event_name: '페스 픽업',
    notes: '10연차 2회',
  },
];

const sevenDaysLater = new Date(today);
sevenDaysLater.setDate(today.getDate() + 7);

const fourteenDaysLater = new Date(today);
fourteenDaysLater.setDate(today.getDate() + 14);

const twentyOneDaysLater = new Date(today);
twentyOneDaysLater.setDate(today.getDate() + 21);

const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(today.getDate() - 3);

export const sampleEvents: Event[] = [
  {
    event_id: generateEventId(1),
    name: '총력전: 비나 (INSANE)',
    start_date: formatDateString(threeDaysAgo),
    end_date: formatDateString(sevenDaysLater),
    status: 'ongoing',
    reward_table: [
      {
        require_point: 5000,
        rewards: {
          pyroxene: 300,
          credits: 50000,
          elphis: 10,
        },
      },
      {
        require_point: 10000,
        rewards: {
          pyroxene: 500,
          credits: 100000,
          elphis: 20,
        },
      },
      {
        require_point: 15000,
        rewards: {
          pyroxene: 800,
          credits: 150000,
          elphis: 30,
          fragments: 5,
        },
      },
    ],
  },
  {
    event_id: generateEventId(2),
    name: '이벤트 스테이지: 여름 축제',
    start_date: formatDateString(today),
    end_date: formatDateString(fourteenDaysLater),
    status: 'ongoing',
    reward_table: [
      {
        require_point: 3000,
        rewards: {
          pyroxene: 200,
          credits: 30000,
        },
      },
      {
        require_point: 6000,
        rewards: {
          pyroxene: 400,
          credits: 60000,
          elphis: 15,
        },
      },
      {
        require_point: 10000,
        rewards: {
          pyroxene: 700,
          credits: 100000,
          elphis: 25,
          fragments: 3,
        },
      },
    ],
  },
  {
    event_id: generateEventId(3),
    name: '대결전: 호드',
    start_date: formatDateString(sevenDaysLater),
    end_date: formatDateString(fourteenDaysLater),
    status: 'upcoming',
    reward_table: [
      {
        require_point: 8000,
        rewards: {
          pyroxene: 400,
          credits: 80000,
          elphis: 15,
        },
      },
      {
        require_point: 15000,
        rewards: {
          pyroxene: 700,
          credits: 150000,
          elphis: 30,
        },
      },
      {
        require_point: 25000,
        rewards: {
          pyroxene: 1200,
          credits: 250000,
          elphis: 50,
          fragments: 10,
        },
      },
    ],
  },
  {
    event_id: generateEventId(4),
    name: '특임 2배 이벤트',
    start_date: formatDateString(fourteenDaysLater),
    end_date: formatDateString(twentyOneDaysLater),
    status: 'upcoming',
    reward_table: [
      {
        require_point: 2000,
        rewards: {
          pyroxene: 150,
          credits: 40000,
        },
      },
      {
        require_point: 5000,
        rewards: {
          pyroxene: 350,
          credits: 80000,
          elphis: 10,
        },
      },
      {
        require_point: 8000,
        rewards: {
          pyroxene: 600,
          credits: 120000,
          elphis: 20,
          fragments: 5,
        },
      },
    ],
  },
];

const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

const currentMonthSpending = sampleLogs
  .filter((log) => {
    const logDate = new Date(log.date);
    return logDate >= monthStart && logDate <= monthEnd;
  })
  .reduce((sum, log) => sum + log.amount, 0);

export const sampleBudget: Budget = {
  budget_id: 'budget_001',
  user_id: 'guest_user_001',
  period: 'monthly',
  limit: 20000,
  current_spending: currentMonthSpending,
  start_date: formatDateString(monthStart),
  end_date: formatDateString(monthEnd),
};
