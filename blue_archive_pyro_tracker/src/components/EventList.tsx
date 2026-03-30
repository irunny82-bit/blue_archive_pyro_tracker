import { motion } from "framer-motion";
import { Calendar, Trophy, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Event, formatDate, formatNumber } from "@/lib/index";

interface EventListProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

export function EventList({ events, onSelectEvent }: EventListProps) {
  const ongoingEvents = events.filter((e) => e.status === "ongoing");
  const upcomingEvents = events.filter((e) => e.status === "upcoming");

  const getStatusBadge = (status: Event["status"]) => {
    switch (status) {
      case "ongoing":
        return (
          <Badge className="bg-chart-1 text-primary-foreground">
            진행 중
          </Badge>
        );
      case "upcoming":
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            예정
          </Badge>
        );
      case "ended":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            종료
          </Badge>
        );
    }
  };

  const getTotalRewards = (event: Event) => {
    const totals = event.reward_table.reduce(
      (acc, reward) => ({
        pyroxene: acc.pyroxene + (reward.rewards.pyroxene || 0),
        credits: acc.credits + (reward.rewards.credits || 0),
        elphis: acc.elphis + (reward.rewards.elphis || 0),
      }),
      { pyroxene: 0, credits: 0, elphis: 0 }
    );
    return totals;
  };

  const EventCard = ({ event }: { event: Event }) => {
    const rewards = getTotalRewards(event);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        className="h-full"
      >
        <Card
          className="h-full cursor-pointer transition-all hover:shadow-lg border-border/50 bg-card/80 backdrop-blur-sm"
          onClick={() => onSelectEvent(event)}
        >
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
                {event.name}
              </CardTitle>
              {getStatusBadge(event.status)}
            </div>
            <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(event.start_date)} ~ {formatDate(event.end_date)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-chart-1" />
                <span className="font-medium text-foreground">주요 보상</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {rewards.pyroxene > 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2">
                    <span className="text-muted-foreground">청휘석</span>
                    <span className="font-semibold text-primary">
                      {formatNumber(rewards.pyroxene)}
                    </span>
                  </div>
                )}
                {rewards.credits > 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-chart-3/10 px-3 py-2">
                    <span className="text-muted-foreground">크레딧</span>
                    <span className="font-semibold text-chart-3">
                      {formatNumber(rewards.credits)}
                    </span>
                  </div>
                )}
                {rewards.elphis > 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-chart-2/10 px-3 py-2">
                    <span className="text-muted-foreground">엘레프</span>
                    <span className="font-semibold text-chart-2">
                      {formatNumber(rewards.elphis)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full group hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onSelectEvent(event);
              }}
            >
              <TrendingUp className="mr-2 h-4 w-4 group-hover:animate-pulse" />
              ROI 계산하기
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {ongoingEvents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-chart-1" />
            <h3 className="text-xl font-semibold text-foreground">진행 중인 이벤트</h3>
            <Badge className="bg-chart-1 text-primary-foreground">
              {ongoingEvents.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ongoingEvents.map((event) => (
              <EventCard key={event.event_id} event={event} />
            ))}
          </div>
        </div>
      )}

      {upcomingEvents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-xl font-semibold text-foreground">예정된 이벤트</h3>
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              {upcomingEvents.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <EventCard key={event.event_id} event={event} />
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            등록된 이벤트가 없습니다
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            새로운 이벤트가 추가되면 여기에 표시됩니다
          </p>
        </motion.div>
      )}
    </div>
  );
}
