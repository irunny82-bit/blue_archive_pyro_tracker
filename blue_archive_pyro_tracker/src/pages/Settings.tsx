import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Moon, Sun, Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { formatNumber } from '@/lib/index';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Settings() {
  const { user, updateUser, exportData, importData, resetData } = useDashboardData();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
    toast({
      title: checked ? '다크 모드 활성화' : '라이트 모드 활성화',
      description: '테마가 변경되었습니다.',
    });
  };

  const handleSaveProfile = () => {
    updateUser(editedUser);
    setIsEditing(false);
    toast({
      title: '프로필 저장 완료',
      description: '사용자 정보가 업데이트되었습니다.',
    });
  };

  const handleExportData = () => {
    const jsonData = exportData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ba_pyro_tracker_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: '데이터 내보내기 완료',
      description: 'JSON 파일이 다운로드되었습니다.',
    });
  };

  const handleExportCSV = () => {
    const jsonData = JSON.parse(exportData());
    const logs = jsonData.logs;
    
    const csvHeader = '날짜,금액,사용 목적,이벤트명,메모\n';
    const csvRows = logs.map((log: any) => 
      `${log.date},${log.amount},${log.type},${log.event_name || ''},${log.notes || ''}`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ba_pyro_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'CSV 내보내기 완료',
      description: '사용 내역이 CSV 파일로 다운로드되었습니다.',
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importData(content);
      if (success) {
        setEditedUser(user);
        toast({
          title: '데이터 가져오기 완료',
          description: '데이터가 성공적으로 복원되었습니다.',
        });
      } else {
        toast({
          title: '가져오기 실패',
          description: '올바른 JSON 파일이 아닙니다.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleResetData = () => {
    resetData();
    setEditedUser(user);
    setIsEditing(false);
    toast({
      title: '데이터 초기화 완료',
      description: '모든 데이터가 샘플 데이터로 초기화되었습니다.',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <motion.div
        className="container mx-auto max-w-4xl"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItem} className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">설정</h1>
          <p className="text-muted-foreground">프로필 및 앱 설정을 관리하세요</p>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="mb-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                사용자 프로필
              </CardTitle>
              <CardDescription>레벨 및 보유 자원 정보를 관리합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">선생님 이름</Label>
                  <Input
                    id="username"
                    value={isEditing ? editedUser.username : user.username}
                    onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                    disabled={!isEditing}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">선생님 레벨</Label>
                  <Input
                    id="level"
                    type="number"
                    value={isEditing ? editedUser.level : user.level}
                    onChange={(e) => setEditedUser({ ...editedUser, level: parseInt(e.target.value) || 0 })}
                    disabled={!isEditing}
                    className="bg-background/50"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pyroxene">청휘석</Label>
                  <Input
                    id="pyroxene"
                    type="number"
                    value={isEditing ? editedUser.pyroxene_balance : user.pyroxene_balance}
                    onChange={(e) => setEditedUser({ ...editedUser, pyroxene_balance: parseInt(e.target.value) || 0 })}
                    disabled={!isEditing}
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground">{formatNumber(user.pyroxene_balance)}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">크레딧</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={isEditing ? editedUser.credits_balance : user.credits_balance}
                    onChange={(e) => setEditedUser({ ...editedUser, credits_balance: parseInt(e.target.value) || 0 })}
                    disabled={!isEditing}
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground">{formatNumber(user.credits_balance)}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elphis">엘레프</Label>
                  <Input
                    id="elphis"
                    type="number"
                    value={isEditing ? editedUser.elphis_balance : user.elphis_balance}
                    onChange={(e) => setEditedUser({ ...editedUser, elphis_balance: parseInt(e.target.value) || 0 })}
                    disabled={!isEditing}
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground">{formatNumber(user.elphis_balance)}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="flex-1">
                    프로필 수정
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSaveProfile} className="flex-1">
                      저장
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedUser(user);
                      }}
                      className="flex-1"
                    >
                      취소
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="mb-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isDarkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                테마 설정
              </CardTitle>
              <CardDescription>앱의 외관을 변경합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="dark-mode" className="text-base font-medium">
                    다크 모드
                  </Label>
                  <p className="text-sm text-muted-foreground">어두운 테마로 전환합니다</p>
                </div>
                <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={handleDarkModeToggle} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="mb-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                데이터 관리
              </CardTitle>
              <CardDescription>데이터를 백업하거나 복원합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button onClick={handleExportData} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  JSON 내보내기
                </Button>
                <Button onClick={handleExportCSV} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  CSV 내보내기
                </Button>
              </div>

              <Separator />

              <div>
                <Label htmlFor="import-file" className="cursor-pointer">
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      데이터 가져오기
                    </span>
                  </Button>
                </Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">JSON 파일을 선택하여 데이터를 복원합니다</p>
              </div>

              <Separator />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    데이터 초기화
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      정말 초기화하시겠습니까?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      모든 사용 내역, 예산 설정, 프로필 정보가 삭제되고 샘플 데이터로 복원됩니다. 이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      초기화
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>계정 연동</CardTitle>
              <CardDescription>소셜 로그인으로 데이터를 클라우드에 저장하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/50 bg-muted/30 p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  OAuth 소셜 로그인 기능은 향후 업데이트에서 지원될 예정입니다.
                </p>
                <p className="text-xs text-muted-foreground">
                  현재는 로컬 스토리지를 사용하여 데이터를 저장합니다. 브라우저 데이터를 삭제하면 모든 정보가 사라지므로 정기적으로 백업하세요.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
