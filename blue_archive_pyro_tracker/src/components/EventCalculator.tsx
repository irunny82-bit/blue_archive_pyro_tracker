import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Event, formatNumber, calculateROI } from '@/lib/index';
import { springPresets, fadeInUp } from '@/lib/motion';

interface EventCalculatorProps {
  events: Event[];
  selectedEvent?: Event;
}

export function EventCalculator({ events, selectedEvent }: EventCalculatorProps) {
  const [currentEvent, setCurrentEvent] = useState<Event | undefined>(selectedEvent);
  const [targetPoints, setTargetPoints] = useState<number>(15000);
  const [dailyRefills, setDailyRefills] = useState<number>(3);
  const [daysToPlay, setDaysToPlay] = useState<number>(7);
  const [apPerRefill] = useState<number>(60);
  const [pyroxenePerRefill] = useState<number>(100);
  const [showResults, setShowResults] = useState<boolean>(false);

  const ongoingEvents = useMemo(
    () => events.filter((e) => e.status === 'ongoing' || e.status === 'upcoming'),
    [events]
  );

  const simulationResults = useMemo(() => {
    if (!currentEvent) return null;

    const totalRefills = dailyRefills * daysToPlay;
    const totalPyroxeneSpent = totalRefills * pyroxenePerRefill;
    const totalAPGained = totalRefills * apPerRefill;

    const achievedRewards = currentEvent.reward_table
      .filter((reward) => reward.require_point <= targetPoints)
      .reduce(
        (acc, reward) => ({
          pyroxene: (acc.pyroxene || 0) + (reward.rewards.pyroxene || 0),
          credits: (acc.credits || 0) + (reward.rewards.credits || 0),
          elphis: (acc.elphis || 0) + (reward.rewards.elphis || 0),
          fragments: (acc.fragments || 0) + (reward.rewards.fragments || 0),
        }),
        { pyroxene: 0, credits: 0, elphis: 0, fragments: 0 }
      );

    const roiData = calculateROI(totalPyroxeneSpent, achievedRewards);

    return {
      totalPyroxeneSpent,
      totalAPGained,
      achievedRewards,
      ...roiData,
    };
  }, [currentEvent, targetPoints, dailyRefills, daysToPlay, apPerRefill, pyroxenePerRefill]);

  const handleSimulate = () => {
    setShowResults(true);
  };

  const handleEventChange = (eventId: string) => {
    const event = events.find((e) => e.event_id === eventId);
    setCurrentEvent(event);
    setShowResults(false);
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
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">이벤트 ROI 계산기</CardTitle>
              <CardDescription>투자 대비 효율을 시뮬레이션하세요</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-select">이벤트 선택</Label>
              <Select
                value={currentEvent?.event_id || 'none'}
                onValueChange={handleEventChange}
              >
                <SelectTrigger id="event-select">
                  <SelectValue placeholder="이벤트를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">이벤트를 선택하세요</SelectItem>
                  {ongoingEvents.map((event) => (
                    <SelectItem key={event.event_id} value={event.event_id}>
                      {event.name}
                      <Badge
                        variant={event.status === 'ongoing' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {event.status === 'ongoing' ? '진행중' : '예정'}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-points">목표 포인트</Label>
              <Input
                id="target-points"
                type="number"
                value={targetPoints}
                onChange={(e) => setTargetPoints(Number(e.target.value))}
                placeholder="15000"
                min="0"
                step="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="daily-refills">일일 AP 충전 횟수</Label>
              <Input
                id="daily-refills"
                type="number"
                value={dailyRefills}
                onChange={(e) => setDailyRefills(Number(e.target.value))}
                placeholder="3"
                min="0"
                max="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="days-to-play">참여 일수</Label>
              <Input
                id="days-to-play"
                type="number"
                value={daysToPlay}
                onChange={(e) => setDaysToPlay(Number(e.target.value))}
                placeholder="7"
                min="1"
                max="30"
              />
            </div>
          </div>

          <Button
            onClick={handleSimulate}
            disabled={!currentEvent}
            className="w-full"
            size="lg"
          >
            <Calculator className="w-4 h-4 mr-2" />
            시뮬레이션 실행
          </Button>

          {showResults && simulationResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springPresets.gentle}
              className="space-y-4 pt-4 border-t border-border"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">시뮬레이션 결과</h3>
                {simulationResults.isProfit ? (
                  <Badge variant="default" className="bg-chart-3 text-white">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    흑자
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    적자
                  </Badge>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      예상 소모 청휘석
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-destructive">
                      -{formatNumber(simulationResults.totalPyroxeneSpent)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      총 {dailyRefills * daysToPlay}회 충전
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      회수 청휘석
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-chart-3">
                      +{formatNumber(simulationResults.achievedRewards.pyroxene || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      이벤트 보상
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card
                className={`border-2 ${
                  simulationResults.isProfit
                    ? 'border-chart-3 bg-chart-3/5'
                    : 'border-destructive bg-destructive/5'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">순손익</span>
                    <span
                      className={`text-2xl font-bold ${
                        simulationResults.isProfit ? 'text-chart-3' : 'text-destructive'
                      }`}
                    >
                      {simulationResults.netPyroxene >= 0 ? '+' : ''}
                      {formatNumber(simulationResults.netPyroxene)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(Math.abs(simulationResults.roi), 100)}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    ROI: {simulationResults.roi.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              {simulationResults.achievedRewards.credits > 0 ||
              simulationResults.achievedRewards.elphis > 0 ||
              simulationResults.achievedRewards.fragments > 0 ? (
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">추가 보상</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {simulationResults.achievedRewards.credits > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">크레딧</span>
                        <span className="font-medium">
                          {formatNumber(simulationResults.achievedRewards.credits)}
                        </span>
                      </div>
                    )}
                    {simulationResults.achievedRewards.elphis > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">엘레프</span>
                        <span className="font-medium">
                          {formatNumber(simulationResults.achievedRewards.elphis)}
                        </span>
                      </div>
                    )}
                    {simulationResults.achievedRewards.fragments > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">조각</span>
                        <span className="font-medium">
                          {formatNumber(simulationResults.achievedRewards.fragments)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}

              {!simulationResults.isProfit && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                >
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive mb-1">적자 경고</p>
                    <p className="text-muted-foreground">
                      이 이벤트는 청휘석 손실이 예상됩니다. 참여 횟수를 줄이거나 다른 이벤트를
                      고려해보세요.
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
