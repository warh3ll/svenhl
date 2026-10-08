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
import MaterialIcon from '@/components/ui/material-icon';
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
    if (sortField !== field) return <MaterialIcon name="swap_vert" size="sm" className="opacity-50" />;
    return sortDirection === 'asc' 
      ? <MaterialIcon name="arrow_upward" size="sm" /> 
      : <MaterialIcon name="arrow_downward" size="sm" />;
  };

  // The sort control is a real button so it can be reached and used with the keyboard,
  // and aria-sort tells screen readers which column is sorted and in which direction
  const SortableHeader = ({ field, children, className }: { field: GoalieSortField; children: React.ReactNode; className?: string }) => (
    <TableHead
      className={cn("p-0", className)}
      aria-sort={sortField !== field ? 'none' : sortDirection === 'asc' ? 'ascending' : 'descending'}
    >
      <button
        type="button"
        onClick={() => handleSort(field)}
        className="flex h-12 w-full select-none items-center gap-1 px-4 font-medium transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        {children}
        <SortIcon field={field} />
      </button>
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
                      <PlayerHeadshot playerId={goalie.id} playerName={goalie.name} teamAbbr={goalie.teamAbbr} season={goalie.season} size="sm" />
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
                <TableCell className="font-semibold text-[hsl(var(--positive))]">{goalie.wins}</TableCell>
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
