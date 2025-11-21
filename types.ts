export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface SearchEntryPoint {
  renderedContent?: string;
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface MapSource {
  uri: string;
  title: string;
  placeAnswerSources?: {
    reviewSnippets?: {
      content: string;
      author?: string;
    }[];
  };
}

export interface GroundingChunk {
  web?: WebSource;
  maps?: MapSource;
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  searchEntryPoint?: SearchEntryPoint;
  webSearchQueries?: string[];
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  groundingMetadata?: GroundingMetadata;
  isError?: boolean;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
}
