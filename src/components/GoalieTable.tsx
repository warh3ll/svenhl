import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SwedishGoalie, GoalieSortField, SortDirection } from '@/types/nhl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import TeamLogo from '@/components/TeamLogo';
import PlayerHeadshot from '@/components/PlayerHeadshot';

interface GoalieTableProps {
  goalies: SwedishGoalie[];
}

const GoalieTable = ({ goalies }: GoalieTableProps) => {
  const [sortField, setSortField] = useState<GoalieSortField>('savePercentage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedGoalies = useMemo(() => {
    return [...goalies].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }

      // For GAA, lower is better so we invert the sort
      if (sortField === 'goalsAgainstAverage') {
        return sortDirection === 'asc' 
          ? (bVal as number) - (aVal as number)
          : (aVal as number) - (bVal as number);
      }

      return sortDirection === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [goalies, sortField, sortDirection]);

  const handleSort = (field: GoalieSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: GoalieSortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" /> 
      : <ArrowDown className="h-4 w-4" />;
  };

  const SortableHeader = ({ field, children, className }: { field: GoalieSortField; children: React.ReactNode; className?: string }) => (
    <TableHead 
      className={cn("cursor-pointer select-none hover:bg-muted/50 transition-colors", className)}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIcon field={field} />
      </div>
    </TableHead>
  );

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-12">#</TableHead>
              <SortableHeader field="name" className="min-w-[180px]">Player</SortableHeader>
              <SortableHeader field="team">Team</SortableHeader>
              <SortableHeader field="games">GP</SortableHeader>
              <TableHead>GS</TableHead>
              <SortableHeader field="wins">W</SortableHeader>
              <SortableHeader field="losses">L</SortableHeader>
              <TableHead>OT</TableHead>
              <SortableHeader field="savePercentage">SV%</SortableHeader>
              <SortableHeader field="goalsAgainstAverage">GAA</SortableHeader>
              <SortableHeader field="shutouts">SO</SortableHeader>
              <TableHead>SV</TableHead>
              <TableHead>SA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedGoalies.map((goalie, index) => (
              <TableRow key={goalie.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                <TableCell>
                  <Link to={`/player/${goalie.id}`} className="group">
                    <div className="flex items-center gap-3">
                      <PlayerHeadshot playerId={goalie.id} playerName={goalie.name} teamAbbr={goalie.teamAbbr} size="sm" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{goalie.name}</span>
                        <span className="text-xs text-muted-foreground">#{goalie.jerseyNumber}</span>
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TeamLogo teamAbbr={goalie.teamAbbr} size="sm" />
                    <span className="font-medium">{goalie.teamAbbr}</span>
                  </div>
                </TableCell>
                <TableCell>{goalie.games}</TableCell>
                <TableCell>{goalie.gamesStarted}</TableCell>
                <TableCell className="font-semibold text-[hsl(var(--goal))]">{goalie.wins}</TableCell>
                <TableCell>{goalie.losses}</TableCell>
                <TableCell>{goalie.overtimeLosses}</TableCell>
                <TableCell className="font-bold text-primary">{(goalie.savePercentage * 100).toFixed(1)}%</TableCell>
                <TableCell className="font-semibold">{goalie.goalsAgainstAverage.toFixed(2)}</TableCell>
                <TableCell>{goalie.shutouts}</TableCell>
                <TableCell>{goalie.saves}</TableCell>
                <TableCell>{goalie.shotsAgainst}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GoalieTable;
