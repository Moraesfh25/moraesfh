export interface TeamDetail {
  id: number;
  name: string;
  code: string;
  country: string;
  founded: number;
  logo: string;
  national: boolean;
}

export interface VenueDetail {
  id: number;
  name: string;
  address: string;
  city: string;
  capacity: number;
  surface: string;
  image: string;
}

export interface APIFootballTeamResponse {
  team: TeamDetail;
  venue: VenueDetail;
}
