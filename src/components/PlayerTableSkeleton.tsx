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

const PlayerTableSkeleton = () => {
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
              <TableHead>{t('stat.pos')}</TableHead>
              <TableHead>{t('stat.gp')}</TableHead>
              <TableHead>{t('stat.g')}</TableHead>
              <TableHead>{t('stat.a')}</TableHead>
              <TableHead>{t('stat.pts')}</TableHead>
              <TableHead>{t('stat.plusMinus')}</TableHead>
              <TableHead>{t('stat.pim')}</TableHead>
              <TableHead>{t('stat.ppg')}</TableHead>
              <TableHead>{t('stat.gwg')}</TableHead>
              <TableHead>{t('stat.sPct')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PlayerTableSkeleton;
