import { Game, SwedishPlayer, SwedishGoalie } from '@/types/nhl';

export const mockGames: Game[] = [
  {
    id: '1',
    date: '2025-12-30T23:00:00Z',
    homeTeam: 'Colorado Avalanche',
    homeTeamAbbr: 'COL',
    awayTeam: 'Vegas Golden Knights',
    awayTeamAbbr: 'VGK',
    homeScore: 4,
    awayScore: 2,
    status: 'final',
    swedishPoints: [
      { playerId: '1', playerName: 'Gabriel Landeskog', type: 'goal', period: 1, time: '12:34', description: 'Landeskog (15) - Wrist shot' },
      { playerId: '2', playerName: 'William Karlsson', type: 'assist', period: 2, time: '08:21', description: 'Karlsson (22) - Secondary assist' },
    ],
    swedishGoalies: [],
    highlightUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: '2',
    date: '2025-12-30T20:00:00Z',
    homeTeam: 'Detroit Red Wings',
    homeTeamAbbr: 'DET',
    awayTeam: 'Ottawa Senators',
    awayTeamAbbr: 'OTT',
    homeScore: 3,
    awayScore: 1,
    status: 'final',
    swedishPoints: [
      { playerId: '3', playerName: 'Lucas Raymond', type: 'goal', period: 1, time: '05:12', description: 'Raymond (18) - Snap shot' },
      { playerId: '3', playerName: 'Lucas Raymond', type: 'assist', period: 2, time: '14:33', description: 'Raymond (32) - Primary assist' },
    ],
    swedishGoalies: [],
    highlightUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: '3',
    date: '2025-12-30T19:00:00Z',
    homeTeam: 'New York Rangers',
    homeTeamAbbr: 'NYR',
    awayTeam: 'Pittsburgh Penguins',
    awayTeamAbbr: 'PIT',
    homeScore: 2,
    awayScore: 1,
    status: 'final',
    swedishPoints: [],
    swedishGoalies: [
      { goalieId: '10', goalieName: 'Filip Gustavsson', team: 'MIN', saves: 28, shotsAgainst: 30, savePercentage: 0.933, result: 'W' }
    ],
    highlightUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: '4',
    date: '2025-12-29T22:00:00Z',
    homeTeam: 'Minnesota Wild',
    homeTeamAbbr: 'MIN',
    awayTeam: 'Dallas Stars',
    awayTeamAbbr: 'DAL',
    homeScore: 5,
    awayScore: 3,
    status: 'final',
    swedishPoints: [
      { playerId: '4', playerName: 'Mika Zibanejad', type: 'goal', period: 2, time: '11:45', description: 'Zibanejad (12) - Power play goal' },
      { playerId: '4', playerName: 'Mika Zibanejad', type: 'goal', period: 3, time: '02:18', description: 'Zibanejad (13) - Empty net' },
      { playerId: '5', playerName: 'Joel Eriksson Ek', type: 'assist', period: 1, time: '08:55', description: 'Eriksson Ek (18) - Primary assist' },
    ],
    swedishGoalies: [
      { goalieId: '11', goalieName: 'Jacob Markström', team: 'NJD', saves: 35, shotsAgainst: 40, savePercentage: 0.875, result: 'L' }
    ],
    highlightUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: '5',
    date: '2025-12-29T19:00:00Z',
    homeTeam: 'Boston Bruins',
    homeTeamAbbr: 'BOS',
    awayTeam: 'Toronto Maple Leafs',
    awayTeamAbbr: 'TOR',
    homeScore: 2,
    awayScore: 4,
    status: 'final',
    swedishPoints: [],
    swedishGoalies: [],
    highlightUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
];

export const mockPlayers: SwedishPlayer[] = [
  { id: '1', name: 'William Nylander', team: 'Toronto Maple Leafs', teamAbbr: 'TOR', position: 'RW', jerseyNumber: 88, games: 40, goals: 22, assists: 28, points: 50, penaltyMinutes: 12, plusMinus: 15, timeOnIce: '19:45', powerPlayGoals: 8, powerPlayPoints: 18, gameWinningGoals: 4, shots: 145, shootingPct: 15.2 },
  { id: '2', name: 'Victor Hedman', team: 'Tampa Bay Lightning', teamAbbr: 'TBL', position: 'D', jerseyNumber: 77, games: 38, goals: 8, assists: 32, points: 40, penaltyMinutes: 24, plusMinus: 12, timeOnIce: '24:30', powerPlayGoals: 3, powerPlayPoints: 15, gameWinningGoals: 2, shots: 98, shootingPct: 8.2 },
  { id: '3', name: 'Lucas Raymond', team: 'Detroit Red Wings', teamAbbr: 'DET', position: 'LW', jerseyNumber: 23, games: 42, goals: 18, assists: 25, points: 43, penaltyMinutes: 8, plusMinus: 8, timeOnIce: '18:20', powerPlayGoals: 5, powerPlayPoints: 12, gameWinningGoals: 3, shots: 120, shootingPct: 15.0 },
  { id: '4', name: 'Mika Zibanejad', team: 'New York Rangers', teamAbbr: 'NYR', position: 'C', jerseyNumber: 93, games: 39, goals: 15, assists: 22, points: 37, penaltyMinutes: 18, plusMinus: 5, timeOnIce: '20:15', powerPlayGoals: 6, powerPlayPoints: 14, gameWinningGoals: 2, shots: 132, shootingPct: 11.4 },
  { id: '5', name: 'Elias Pettersson', team: 'Vancouver Canucks', teamAbbr: 'VAN', position: 'C', jerseyNumber: 40, games: 41, goals: 14, assists: 30, points: 44, penaltyMinutes: 16, plusMinus: 10, timeOnIce: '19:55', powerPlayGoals: 4, powerPlayPoints: 16, gameWinningGoals: 3, shots: 115, shootingPct: 12.2 },
  { id: '6', name: 'Filip Forsberg', team: 'Nashville Predators', teamAbbr: 'NSH', position: 'LW', jerseyNumber: 9, games: 37, goals: 20, assists: 18, points: 38, penaltyMinutes: 22, plusMinus: 3, timeOnIce: '18:45', powerPlayGoals: 7, powerPlayPoints: 13, gameWinningGoals: 5, shots: 155, shootingPct: 12.9 },
  { id: '7', name: 'Gustav Forsling', team: 'Florida Panthers', teamAbbr: 'FLA', position: 'D', jerseyNumber: 42, games: 40, goals: 6, assists: 24, points: 30, penaltyMinutes: 14, plusMinus: 18, timeOnIce: '23:10', powerPlayGoals: 2, powerPlayPoints: 8, gameWinningGoals: 1, shots: 85, shootingPct: 7.1 },
  { id: '8', name: 'Erik Karlsson', team: 'Pittsburgh Penguins', teamAbbr: 'PIT', position: 'D', jerseyNumber: 65, games: 36, goals: 10, assists: 28, points: 38, penaltyMinutes: 20, plusMinus: -2, timeOnIce: '25:00', powerPlayGoals: 4, powerPlayPoints: 18, gameWinningGoals: 2, shots: 142, shootingPct: 7.0 },
  { id: '9', name: 'William Karlsson', team: 'Vegas Golden Knights', teamAbbr: 'VGK', position: 'C', jerseyNumber: 71, games: 38, goals: 12, assists: 20, points: 32, penaltyMinutes: 10, plusMinus: 7, timeOnIce: '17:30', powerPlayGoals: 2, powerPlayPoints: 6, gameWinningGoals: 3, shots: 88, shootingPct: 13.6 },
  { id: '10', name: 'Joel Eriksson Ek', team: 'Minnesota Wild', teamAbbr: 'MIN', position: 'C', jerseyNumber: 14, games: 39, goals: 11, assists: 15, points: 26, penaltyMinutes: 28, plusMinus: 4, timeOnIce: '18:00', powerPlayGoals: 3, powerPlayPoints: 7, gameWinningGoals: 2, shots: 95, shootingPct: 11.6 },
];

export const mockGoalies: SwedishGoalie[] = [
  { id: '1', name: 'Jacob Markström', team: 'New Jersey Devils', teamAbbr: 'NJD', jerseyNumber: 25, games: 32, gamesStarted: 30, wins: 18, losses: 10, overtimeLosses: 4, savePercentage: 0.912, goalsAgainstAverage: 2.65, shutouts: 3, saves: 892, shotsAgainst: 978, timeOnIce: '1845:00' },
  { id: '2', name: 'Filip Gustavsson', team: 'Minnesota Wild', teamAbbr: 'MIN', jerseyNumber: 32, games: 28, gamesStarted: 26, wins: 16, losses: 8, overtimeLosses: 2, savePercentage: 0.921, goalsAgainstAverage: 2.42, shutouts: 4, saves: 756, shotsAgainst: 821, timeOnIce: '1560:00' },
  { id: '3', name: 'Linus Ullmark', team: 'Ottawa Senators', teamAbbr: 'OTT', jerseyNumber: 35, games: 25, gamesStarted: 23, wins: 12, losses: 9, overtimeLosses: 2, savePercentage: 0.908, goalsAgainstAverage: 2.78, shutouts: 2, saves: 645, shotsAgainst: 710, timeOnIce: '1380:00' },
  { id: '4', name: 'Samuel Ersson', team: 'Philadelphia Flyers', teamAbbr: 'PHI', jerseyNumber: 33, games: 22, gamesStarted: 20, wins: 10, losses: 8, overtimeLosses: 2, savePercentage: 0.905, goalsAgainstAverage: 2.88, shutouts: 1, saves: 578, shotsAgainst: 639, timeOnIce: '1200:00' },
];

export const seasons = [
  { value: '20252026', label: '2025-26' },
  { value: '20242025', label: '2024-25' },
  { value: '20232024', label: '2023-24' },
];
