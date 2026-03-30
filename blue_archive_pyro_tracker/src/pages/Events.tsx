import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Event } from '@/lib/index';
import { useDashboardData } from '@/hooks/useDashboardData';
import { EventList } from '@/components/EventList';
import { EventCalculator } from '@/components/EventCalculator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';

export default function Events() {
  const { events } = useDashboardData();
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const ongoingEvents = events.filter((e) => e.status === 'ongoing');
  const upcomingEvents = events.filter((e) => e.status === 'upcoming');
  const endedEvents = events.filter((e) => e.status === 'ended');

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsCalculatorOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <motion.div
        className="container mx-auto px-4 py-12"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={staggerItem} className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">이벤트 관리</h1>
          <p className="text-muted-foreground">진행 중인 이벤트와 예정된 이벤트를 확인하고 보상을 계산하세요</p>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Tabs defaultValue="ongoing" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="ongoing" className="relative">
                진행 중
                {ongoingEvents.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-primary-foreground bg-primary rounded-full">
                    {ongoingEvents.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="relative">
                예정
                {upcomingEvents.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-accent-foreground bg-accent rounded-full">
                    {upcomingEvents.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="ended">
                종료
                {endedEvents.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-muted-foreground bg-muted rounded-full">
                    {endedEvents.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ongoing">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {ongoingEvents.length > 0 ? (
                  <EventList events={ongoingEvents} onSelectEvent={handleSelectEvent} />
                ) : (
                  <motion.div
                    variants={fadeInUp}
                    className="text-center py-16 bg-card/50 backdrop-blur-sm rounded-xl border border-border"
                  >
                    <p className="text-muted-foreground text-lg">진행 중인 이벤트가 없습니다</p>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="upcoming">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {upcomingEvents.length > 0 ? (
                  <EventList events={upcomingEvents} onSelectEvent={handleSelectEvent} />
                ) : (
                  <motion.div
                    variants={fadeInUp}
                    className="text-center py-16 bg-card/50 backdrop-blur-sm rounded-xl border border-border"
                  >
                    <p className="text-muted-foreground text-lg">예정된 이벤트가 없습니다</p>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="ended">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {endedEvents.length > 0 ? (
                  <EventList events={endedEvents} onSelectEvent={handleSelectEvent} />
                ) : (
                  <motion.div
                    variants={fadeInUp}
                    className="text-center py-16 bg-card/50 backdrop-blur-sm rounded-xl border border-border"
                  >
                    <p className="text-muted-foreground text-lg">종료된 이벤트가 없습니다</p>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedEvent?.name} - 보상 계산기
            </DialogTitle>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPresets.gentle}
          >
            <EventCalculator events={events} selectedEvent={selectedEvent} />
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
