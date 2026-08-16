export interface ICursorDecoded {
  id: number;
  value: number | Date;
  sortedField:'createdAt' | 'rating' | 'ranking';
}
