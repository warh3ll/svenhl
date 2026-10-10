import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/i18n';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const GoalieTableSkeleton = () => {
  const { t } = useI18n();
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-12">#</TableHead>
              <TableHead className="min-w-[180px]">{t('table.player')}</TableHead>
              <TableHead>{t('table.team')}</TableHead>
              <TableHead>{t('stat.gp')}</TableHead>
              <TableHead>{t('stat.gs')}</TableHead>
              <TableHead>{t('stat.w')}</TableHead>
              <TableHead>{t('stat.l')}</TableHead>
              <TableHead>OTL</TableHead>
              <TableHead>{t('stat.svPct')}</TableHead>
              <TableHead>{t('stat.gaa')}</TableHead>
              <TableHead>{t('stat.so')}</TableHead>
              <TableHead>{t('stat.sa')}</TableHead>
              <TableHead>{t('stat.sv')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GoalieTableSkeleton;
