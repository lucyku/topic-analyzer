export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  timestamp: Date;
  results?: any; // Add specific type based on your search results
} 