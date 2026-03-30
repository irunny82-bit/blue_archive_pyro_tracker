import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDashboardData } from '@/hooks/useDashboardData';
import { SPENDING_TYPES, SpendingType } from '@/lib/index';
import { springPresets } from '@/lib/motion';

interface AddLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const logSchema = z.object({
  date: z.string().min(1, '날짜를 입력해주세요'),
  amount: z.number().min(1, '사용량은 1 이상이어야 합니다').max(999999, '사용량이 너무 큽니다'),
  type: z.enum(['AP_RECOVERY', 'SUMMON', 'SHOP', 'EVENT', 'OTHER'] as const, {
    required_error: '사용 목적을 선택해주세요',
  }),
  event_name: z.string().optional(),
  notes: z.string().optional(),
});

type LogFormData = z.infer<typeof logSchema>;

export function AddLogDialog({ open, onOpenChange }: AddLogDialogProps) {
  const { addLog } = useDashboardData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<LogFormData>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      type: 'AP_RECOVERY',
      event_name: '',
      notes: '',
    },
  });

  const selectedType = watch('type');

  const onSubmit = async (data: LogFormData) => {
    setIsSubmitting(true);
    try {
      addLog({
        date: data.date,
        amount: data.amount,
        type: data.type,
        event_name: data.event_name || undefined,
        notes: data.notes || undefined,
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-md border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={springPresets.bouncy}
              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Plus className="w-5 h-5 text-primary" />
            </motion.div>
            사용 내역 추가
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Pyroxene 사용 내역을 기록하여 지출 패턴을 추적하세요.
          </DialogDescription>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springPresets.gentle}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 mt-4"
        >
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-foreground">
              날짜 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
            />
            {errors.date && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive"
              >
                {errors.date.message}
              </motion.p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-foreground">
              사용량 (Pyroxene) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="예: 1200"
              {...register('amount', { valueAsNumber: true })}
              className="bg-background/50 border-border/50 focus:border-primary transition-colors font-mono"
            />
            {errors.amount && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive"
              >
                {errors.amount.message}
              </motion.p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-foreground">
              사용 목적 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue('type', value as SpendingType)}
            >
              <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary transition-colors">
                <SelectValue placeholder="사용 목적을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SPENDING_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive"
              >
                {errors.type.message}
              </motion.p>
            )}
          </div>

          <AnimatePresence mode="wait">
            {selectedType === 'EVENT' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={springPresets.gentle}
                className="space-y-2 overflow-hidden"
              >
                <Label htmlFor="event_name" className="text-sm font-medium text-foreground">
                  이벤트명
                </Label>
                <Input
                  id="event_name"
                  type="text"
                  placeholder="예: 총력전 - 비나"
                  {...register('event_name')}
                  className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-foreground">
              메모 (선택)
            </Label>
            <Textarea
              id="notes"
              placeholder="추가 메모를 입력하세요..."
              {...register('notes')}
              className="bg-background/50 border-border/50 focus:border-primary transition-colors resize-none h-20"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-border/50 hover:bg-muted/50 transition-colors"
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
              ) : (
                '저장'
              )}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
