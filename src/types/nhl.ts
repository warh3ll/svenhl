export interface SwedishPlayer {
  id: string;
  name: string;
  team: string;
  teamAbbr: string;
  position: string;
  jerseyNumber: number;
  games: number;
  goals: number;
  assists: number;
  points: number;
  penaltyMinutes: number;
  plusMinus: number;
  timeOnIce: string;
  powerPlayGoals: number;
  powerPlayPoints: number;
  gameWinningGoals: number;
  shots: number;
  shootingPct: number;
}

export interface SwedishGoalie {
  id: string;
  name: string;
  team: string;
  teamAbbr: string;
  jerseyNumber: number;
  games: number;
  gamesStarted: number;
  wins: number;
  losses: number;
  overtimeLosses: number;
  savePercentage: number;
  goalsAgainstAverage: number;
  shutouts: number;
  saves: number;
  shotsAgainst: number;
  timeOnIce: string;
}

export interface GamePoint {
  playerId: string;
  playerName: string;
  type: 'goal' | 'assist';
  period: number;
  time: string;
  description: string;
}

export interface GoaliePerformance {
  goalieId: string;
  goalieName: string;
  team: string;
  saves: number;
  shotsAgainst: number;
  savePercentage: number;
  result: 'W' | 'L' | 'OT';
}

export interface Game {
  id: string;
  date: string;
  homeTeam: string;
  homeTeamAbbr: string;
  awayTeam: string;
  awayTeamAbbr: string;
  homeScore: number;
  awayScore: number;
  status: 'final' | 'live' | 'scheduled';
  swedishPoints: GamePoint[];
  swedishGoalies: GoaliePerformance[];
  highlightUrl?: string;
  period?: string;
  timeRemaining?: string;
}

export type SortField = 'name' | 'team' | 'games' | 'goals' | 'assists' | 'points' | 'penaltyMinutes' | 'plusMinus';
export type GoalieSortField = 'name' | 'team' | 'games' | 'wins' | 'losses' | 'savePercentage' | 'goalsAgainstAverage' | 'shutouts';
export type SortDirection = 'asc' | 'desc';
