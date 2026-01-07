import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SwedishPlayer, SortField, SortDirection } from '@/types/nhl';
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

interface PlayerTableProps {
  players: SwedishPlayer[];
}

const PlayerTable = ({ players }: PlayerTableProps) => {
  const [sortField, setSortField] = useState<SortField>('points');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [players, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" /> 
      : <ArrowDown className="h-4 w-4" />;
  };

  const SortableHeader = ({ field, children, className }: { field: SortField; children: React.ReactNode; className?: string }) => (
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
              <TableHead>Pos</TableHead>
              <SortableHeader field="games">GP</SortableHeader>
              <SortableHeader field="goals">G</SortableHeader>
              <SortableHeader field="assists">A</SortableHeader>
              <SortableHeader field="points">PTS</SortableHeader>
              <SortableHeader field="plusMinus">+/-</SortableHeader>
              <SortableHeader field="penaltyMinutes">PIM</SortableHeader>
              <TableHead>PPG</TableHead>
              <TableHead>GWG</TableHead>
              <TableHead>S%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPlayers.map((player, index) => (
              <TableRow key={player.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                <TableCell>
                  <Link to={`/player/${player.id}`} className="group">
                    <div className="flex items-center gap-3">
                      <PlayerHeadshot playerId={player.id} playerName={player.name} size="sm" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{player.name}</span>
                        <span className="text-xs text-muted-foreground">#{player.jerseyNumber}</span>
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TeamLogo teamAbbr={player.teamAbbr} size="sm" />
                    <span className="font-medium">{player.teamAbbr}</span>
                  </div>
                </TableCell>
                <TableCell>{player.position}</TableCell>
                <TableCell>{player.games}</TableCell>
                <TableCell className="font-semibold">{player.goals}</TableCell>
                <TableCell className="font-semibold">{player.assists}</TableCell>
                <TableCell className="font-bold text-primary">{player.points}</TableCell>
                <TableCell className={player.plusMinus >= 0 ? 'text-[hsl(var(--goal))]' : 'text-destructive'}>
                  {player.plusMinus > 0 ? '+' : ''}{player.plusMinus}
                </TableCell>
                <TableCell>{player.penaltyMinutes}</TableCell>
                <TableCell>{player.powerPlayGoals}</TableCell>
                <TableCell>{player.gameWinningGoals}</TableCell>
                <TableCell>{player.shootingPct.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PlayerTable;
