import { useState, useCallback, useMemo } from 'react';
import {
  User,
  PyroxeneLog,
  Event,
  Budget,
  SpendingType,
} from '@/lib/index';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  sampleUser,
  sampleLogs,
  sampleEvents,
  sampleBudget,
} from '@/data/index';

interface DashboardData {
  user: User;
  logs: PyroxeneLog[];
  events: Event[];
  budget: Budget;
}

interface DashboardActions {
  addLog: (log: Omit<PyroxeneLog, 'log_id' | 'user_id'>) => void;
  updateLog: (logId: string, updates: Partial<PyroxeneLog>) => void;
  deleteLog: (logId: string) => void;
  updateUser: (updates: Partial<User>) => void;
  updateBudget: (updates: Partial<Budget>) => void;
  resetData: () => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

type UseDashboardDataReturn = DashboardData & DashboardActions;

const generateLogId = (): string => `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialData: DashboardData = {
  user: sampleUser,
  logs: sampleLogs,
  events: sampleEvents,
  budget: sampleBudget,
};

export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useLocalStorage<DashboardData>('ba_pyro_tracker_data', initialData);

  const addLog = useCallback(
    (log: Omit<PyroxeneLog, 'log_id' | 'user_id'>) => {
      const newLog: PyroxeneLog = {
        ...log,
        log_id: generateLogId(),
        user_id: data.user.user_id,
      };

      const updatedLogs = [...data.logs, newLog];

      const logDate = new Date(newLog.date);
      const budgetStart = new Date(data.budget.start_date);
      const budgetEnd = new Date(data.budget.end_date);

      let updatedBudget = { ...data.budget };
      if (logDate >= budgetStart && logDate <= budgetEnd) {
        updatedBudget.current_spending += newLog.amount;
      }

      const updatedUser = {
        ...data.user,
        pyroxene_balance: Math.max(0, data.user.pyroxene_balance - newLog.amount),
      };

      setData({
        ...data,
        logs: updatedLogs,
        budget: updatedBudget,
        user: updatedUser,
      });
    },
    [data, setData]
  );

  const updateLog = useCallback(
    (logId: string, updates: Partial<PyroxeneLog>) => {
      const logIndex = data.logs.findIndex((log) => log.log_id === logId);
      if (logIndex === -1) return;

      const oldLog = data.logs[logIndex];
      const updatedLog = { ...oldLog, ...updates };
      const updatedLogs = [...data.logs];
      updatedLogs[logIndex] = updatedLog;

      const oldLogDate = new Date(oldLog.date);
      const newLogDate = new Date(updatedLog.date);
      const budgetStart = new Date(data.budget.start_date);
      const budgetEnd = new Date(data.budget.end_date);

      let updatedBudget = { ...data.budget };

      const wasInBudgetPeriod = oldLogDate >= budgetStart && oldLogDate <= budgetEnd;
      const isInBudgetPeriod = newLogDate >= budgetStart && newLogDate <= budgetEnd;

      if (wasInBudgetPeriod && !isInBudgetPeriod) {
        updatedBudget.current_spending -= oldLog.amount;
      } else if (!wasInBudgetPeriod && isInBudgetPeriod) {
        updatedBudget.current_spending += updatedLog.amount;
      } else if (wasInBudgetPeriod && isInBudgetPeriod) {
        updatedBudget.current_spending = updatedBudget.current_spending - oldLog.amount + updatedLog.amount;
      }

      const amountDiff = updatedLog.amount - oldLog.amount;
      const updatedUser = {
        ...data.user,
        pyroxene_balance: Math.max(0, data.user.pyroxene_balance - amountDiff),
      };

      setData({
        ...data,
        logs: updatedLogs,
        budget: updatedBudget,
        user: updatedUser,
      });
    },
    [data, setData]
  );

  const deleteLog = useCallback(
    (logId: string) => {
      const logToDelete = data.logs.find((log) => log.log_id === logId);
      if (!logToDelete) return;

      const updatedLogs = data.logs.filter((log) => log.log_id !== logId);

      const logDate = new Date(logToDelete.date);
      const budgetStart = new Date(data.budget.start_date);
      const budgetEnd = new Date(data.budget.end_date);

      let updatedBudget = { ...data.budget };
      if (logDate >= budgetStart && logDate <= budgetEnd) {
        updatedBudget.current_spending = Math.max(0, updatedBudget.current_spending - logToDelete.amount);
      }

      const updatedUser = {
        ...data.user,
        pyroxene_balance: data.user.pyroxene_balance + logToDelete.amount,
      };

      setData({
        ...data,
        logs: updatedLogs,
        budget: updatedBudget,
        user: updatedUser,
      });
    },
    [data, setData]
  );

  const updateUser = useCallback(
    (updates: Partial<User>) => {
      setData({
        ...data,
        user: { ...data.user, ...updates },
      });
    },
    [data, setData]
  );

  const updateBudget = useCallback(
    (updates: Partial<Budget>) => {
      const updatedBudget = { ...data.budget, ...updates };

      if (updates.start_date || updates.end_date) {
        const budgetStart = new Date(updatedBudget.start_date);
        const budgetEnd = new Date(updatedBudget.end_date);

        const currentSpending = data.logs
          .filter((log) => {
            const logDate = new Date(log.date);
            return logDate >= budgetStart && logDate <= budgetEnd;
          })
          .reduce((sum, log) => sum + log.amount, 0);

        updatedBudget.current_spending = currentSpending;
      }

      setData({
        ...data,
        budget: updatedBudget,
      });
    },
    [data, setData]
  );

  const resetData = useCallback(() => {
    setData(initialData);
  }, [setData]);

  const exportData = useCallback((): string => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importData = useCallback(
    (jsonData: string): boolean => {
      try {
        const parsedData = JSON.parse(jsonData) as DashboardData;

        if (
          !parsedData.user ||
          !Array.isArray(parsedData.logs) ||
          !Array.isArray(parsedData.events) ||
          !parsedData.budget
        ) {
          return false;
        }

        setData(parsedData);
        return true;
      } catch (error) {
        console.error('Failed to import data:', error);
        return false;
      }
    },
    [setData]
  );

  return {
    user: data.user,
    logs: data.logs,
    events: data.events,
    budget: data.budget,
    addLog,
    updateLog,
    deleteLog,
    updateUser,
    updateBudget,
    resetData,
    exportData,
    importData,
  };
}
