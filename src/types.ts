export interface Currency {
  name: string;
  symbol: string;
}

export interface Country {
  cca3: string;
  ccn3: string;
  nameEn: string;
  nameFr: string;
  capital: string | null;
  region: string;
  regionFr: string;
  subregion: string | null;
  area: number | null;
  languages: string[];
  currencies: Currency[];
  borders: string[];
  latlng: [number, number] | null;
  landlocked: boolean;
  demonymFr: string | null;
  flag: string;
  independent: boolean;
}

export interface PlayableCountry extends Country {
  geometry: GeoJSON.Geometry;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}
