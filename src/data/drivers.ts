export type Driver = {
  id: string;
  name: string;
  teamId: string;
  currentRank: number;
  wins: number;
  points: number;
};

export const drivers: Driver[] = [
  { id: 'max-verstappen', name: 'Max Verstappen', teamId: 'red-bull', currentRank: 1, wins: 8, points: 437 },
  { id: 'lando-norris', name: 'Lando Norris', teamId: 'mclaren', currentRank: 2, wins: 4, points: 374 },
  { id: 'charles-leclerc', name: 'Charles Leclerc', teamId: 'ferrari', currentRank: 3, wins: 1, points: 356 },
  { id: 'oscar-piastri', name: 'Oscar Piastri', teamId: 'mclaren', currentRank: 4, wins: 2, points: 292 },
  { id: 'carlos-sainz', name: 'Carlos Sainz', teamId: 'ferrari', currentRank: 5, wins: 0, points: 290 },
  { id: 'george-russell', name: 'George Russell', teamId: 'mercedes', currentRank: 6, wins: 1, points: 245 },
  { id: 'lewis-hamilton', name: 'Lewis Hamilton', teamId: 'mercedes', currentRank: 7, wins: 0, points: 223 },
  { id: 'sergio-perez', name: 'Sergio Pérez', teamId: 'red-bull', currentRank: 8, wins: 0, points: 152 },
  { id: 'fernando-alonso', name: 'Fernando Alonso', teamId: 'aston-martin', currentRank: 9, wins: 0, points: 70 },
  { id: 'pierre-gasly', name: 'Pierre Gasly', teamId: 'alpine', currentRank: 10, wins: 0, points: 42 },
  { id: 'nico-hulkenberg', name: 'Nico Hülkenberg', teamId: 'haas', currentRank: 11, wins: 0, points: 41 },
  { id: 'yuki-tsunoda', name: 'Yuki Tsunoda', teamId: 'rb-f1-team', currentRank: 12, wins: 0, points: 30 },
  { id: 'lance-stroll', name: 'Lance Stroll', teamId: 'aston-martin', currentRank: 13, wins: 0, points: 24 },
  { id: 'esteban-ocon', name: 'Esteban Ocon', teamId: 'alpine', currentRank: 14, wins: 0, points: 23 },
  { id: 'kevin-magnussen', name: 'Kevin Magnussen', teamId: 'haas', currentRank: 15, wins: 0, points: 16 },
  { id: 'alexander-albon', name: 'Alexander Albon', teamId: 'williams', currentRank: 16, wins: 0, points: 12 },
  { id: 'daniel-ricciardo', name: 'Daniel Ricciardo', teamId: 'rb-f1-team', currentRank: 17, wins: 0, points: 12 },
  { id: 'oliver-bearman', name: 'Oliver Bearman', teamId: 'haas', currentRank: 18, wins: 0, points: 7 },
  { id: 'franco-colapinto', name: 'Franco Colapinto', teamId: 'williams', currentRank: 19, wins: 0, points: 5 },
  { id: 'guanyu-zhou', name: 'Guanyu Zhou', teamId: 'sauber', currentRank: 20, wins: 0, points: 4 },
  { id: 'liam-lawson', name: 'Liam Lawson', teamId: 'rb-f1-team', currentRank: 21, wins: 0, points: 4 },
  { id: 'valtteri-bottas', name: 'Valtteri Bottas', teamId: 'sauber', currentRank: 22, wins: 0, points: 0 },
  { id: 'logan-sargeant', name: 'Logan Sargeant', teamId: 'williams', currentRank: 23, wins: 0, points: 0 },
  { id: 'jack-doohan', name: 'Jack Doohan', teamId: 'alpine', currentRank: 24, wins: 0, points: 0 },
];
