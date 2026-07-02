export interface StandingTeam {
  pos: number;
  team: string;
  j: number;
  v: number;
  e: number;
  d: number;
  gp: number;
  gc: number;
  pts: number;
}

export interface APIFootballStanding {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number | null;
      against: number | null;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number | null;
      against: number | null;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number | null;
      against: number | null;
    };
  };
  update: string;
}

export interface APIFootballStandingsLeague {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
  season: number;
  standings: APIFootballStanding[][];
}

export interface APIFootballStandingsResponse {
  league: APIFootballStandingsLeague;
}
