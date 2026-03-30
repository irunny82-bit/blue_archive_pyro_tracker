import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDashboardData } from '@/hooks/useDashboardData';
import { AccountSummary } from '@/components/AccountSummary';
import { SpendingCharts } from '@/components/SpendingCharts';
import { EventList } from '@/components/EventList';
import { EventCalculator } from '@/components/EventCalculator';
import { Event } from '@/lib/index';
import { IMAGES } from '@/assets/images';
import { springPresets, staggerContainer, staggerItem } from '@/lib/motion';

export default function Dashboard() {
  const { user, logs, events, budget } = useDashboardData();
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();

  const recentSpending = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return logs
      .filter((log) => new Date(log.date) >= sevenDaysAgo)
      .reduce((sum, log) => sum + log.amount, 0);
  }, [logs]);

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    const calculatorSection = document.getElementById('event-calculator');
    if (calculatorSection) {
      calculatorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `url(${IMAGES.BG_GRADIENT_1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/70" />

      <div className="relative z-10 w-full px-4 py-8 md:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-[1600px] mx-auto space-y-8"
        >
          <motion.div variants={staggerItem}>
            <AccountSummary user={user} budget={budget} recentSpending={recentSpending} />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <motion.div variants={staggerItem} className="lg:col-span-1">
              <SpendingCharts logs={logs} />
            </motion.div>

            <motion.div variants={staggerItem} className="lg:col-span-1">
              <EventList events={events} onSelectEvent={handleSelectEvent} />
            </motion.div>
          </div>

          <motion.div variants={staggerItem} id="event-calculator">
            <EventCalculator events={events} selectedEvent={selectedEvent} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
