import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  PyroxeneLog,
  SpendingType,
  SPENDING_TYPES,
  formatNumber,
  formatDate,
} from '@/lib/index';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Trash2,
  Edit,
  ArrowUpDown,
  Search,
  Filter,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SortField = 'date' | 'amount' | 'type';
type SortOrder = 'asc' | 'desc';

export default function Logs() {
  const { logs, deleteLog, updateLog } = useDashboardData();
  const { toast } = useToast();

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterType, setFilterType] = useState<SpendingType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLog, setEditingLog] = useState<PyroxeneLog | null>(null);
  const [deleteConfirmLog, setDeleteConfirmLog] = useState<PyroxeneLog | null>(null);

  const [editForm, setEditForm] = useState({
    date: '',
    amount: 0,
    type: 'AP_RECOVERY' as SpendingType,
    event_name: '',
    notes: '',
  });

  const filteredAndSortedLogs = useMemo(() => {
    let result = [...logs];

    if (filterType !== 'all') {
      result = result.filter((log) => log.type === filterType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (log) =>
          log.event_name?.toLowerCase().includes(query) ||
          log.notes?.toLowerCase().includes(query) ||
          SPENDING_TYPES[log.type].toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [logs, sortField, sortOrder, filterType, searchQuery]);

  const totalSpending = useMemo(() => {
    return filteredAndSortedLogs.reduce((sum, log) => sum + log.amount, 0);
  }, [filteredAndSortedLogs]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['날짜', '금액', '사용 목적', '이벤트명', '메모'];
    const rows = filteredAndSortedLogs.map((log) => [
      formatDate(log.date),
      log.amount.toString(),
      SPENDING_TYPES[log.type],
      log.event_name || '',
      log.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pyroxene_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: '내보내기 완료',
      description: 'CSV 파일이 다운로드되었습니다.',
    });
  };

  const handleEditClick = (log: PyroxeneLog) => {
    setEditingLog(log);
    setEditForm({
      date: log.date,
      amount: log.amount,
      type: log.type,
      event_name: log.event_name || '',
      notes: log.notes || '',
    });
  };

  const handleEditSave = () => {
    if (!editingLog) return;

    updateLog(editingLog.log_id, {
      date: editForm.date,
      amount: editForm.amount,
      type: editForm.type,
      event_name: editForm.event_name || undefined,
      notes: editForm.notes || undefined,
    });

    setEditingLog(null);
    toast({
      title: '수정 완료',
      description: '사용 내역이 수정되었습니다.',
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirmLog) return;

    deleteLog(deleteConfirmLog.log_id);
    setDeleteConfirmLog(null);
    toast({
      title: '삭제 완료',
      description: '사용 내역이 삭제되었습니다.',
      variant: 'destructive',
    });
  };

  const getTypeColor = (type: SpendingType): string => {
    const colors: Record<SpendingType, string> = {
      AP_RECOVERY: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
      SUMMON: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
      SHOP: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
      EVENT: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      OTHER: 'bg-muted text-muted-foreground border-border',
    };
    return colors[type];
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="container mx-auto max-w-7xl"
      >
        <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl font-bold text-foreground">사용 내역</CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  전체 Pyroxene 사용 내역을 확인하고 관리하세요
                </CardDescription>
              </div>
              <Button
                onClick={handleExportCSV}
                variant="outline"
                className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
              >
                <Download className="w-4 h-4" />
                CSV 내보내기
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="이벤트명, 메모, 사용 목적 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>

              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as SpendingType | 'all')}
              >
                <SelectTrigger className="w-full md:w-[200px] bg-background/50 border-border/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="타입 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 타입</SelectItem>
                  {Object.entries(SPENDING_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
              <div>
                <p className="text-sm text-muted-foreground">필터링된 내역</p>
                <p className="text-2xl font-bold text-foreground">{filteredAndSortedLogs.length}건</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">총 사용량</p>
                <p className="text-2xl font-bold text-primary">{formatNumber(totalSpending)}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/70">
                      <TableHead className="w-[120px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('date')}
                          className="gap-1 hover:bg-background/50"
                        >
                          날짜
                          <ArrowUpDown className="w-3 h-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('amount')}
                          className="gap-1 hover:bg-background/50"
                        >
                          금액
                          <ArrowUpDown className="w-3 h-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[140px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('type')}
                          className="gap-1 hover:bg-background/50"
                        >
                          사용 목적
                          <ArrowUpDown className="w-3 h-3" />
                        </Button>
                      </TableHead>
                      <TableHead>이벤트명</TableHead>
                      <TableHead>메모</TableHead>
                      <TableHead className="w-[100px] text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          사용 내역이 없습니다
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedLogs.map((log, index) => (
                        <motion.tr
                          key={log.log_id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02, duration: 0.2 }}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="font-mono text-sm">{formatDate(log.date)}</TableCell>
                          <TableCell className="font-mono font-semibold text-primary">
                            {formatNumber(log.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getTypeColor(log.type)}>
                              {SPENDING_TYPES[log.type]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{log.event_name || '-'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {log.notes || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(log)}
                                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirmLog(log)}
                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={!!editingLog} onOpenChange={(open) => !open && setEditingLog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>사용 내역 수정</DialogTitle>
            <DialogDescription>사용 내역 정보를 수정하세요</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">날짜</Label>
              <Input
                id="edit-date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">금액</Label>
              <Input
                id="edit-amount"
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">사용 목적</Label>
              <Select
                value={editForm.type}
                onValueChange={(value) => setEditForm({ ...editForm, type: value as SpendingType })}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SPENDING_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-event">이벤트명 (선택)</Label>
              <Input
                id="edit-event"
                value={editForm.event_name}
                onChange={(e) => setEditForm({ ...editForm, event_name: e.target.value })}
                placeholder="이벤트명 입력"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">메모 (선택)</Label>
              <Textarea
                id="edit-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="메모 입력"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLog(null)}>
              취소
            </Button>
            <Button onClick={handleEditSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmLog} onOpenChange={(open) => !open && setDeleteConfirmLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용 내역 삭제</DialogTitle>
            <DialogDescription>
              이 내역을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          {deleteConfirmLog && (
            <div className="py-4 space-y-2">
              <p className="text-sm">
                <span className="font-semibold">날짜:</span> {formatDate(deleteConfirmLog.date)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">금액:</span> {formatNumber(deleteConfirmLog.amount)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">사용 목적:</span> {SPENDING_TYPES[deleteConfirmLog.type]}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmLog(null)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
