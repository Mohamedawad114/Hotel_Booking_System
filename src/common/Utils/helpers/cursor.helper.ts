import { ICursorDecoded } from 'src/common/interfaces';
export const encodedCursor = ({
  id,
  value,
  sortField = 'createdAt',
}: {
  id: number;
  value: Date | number;
  sortField?: 'createdAt' | 'rating' | 'ranking';
}) => {
  return Buffer.from(
    JSON.stringify({
      id,
      value,
      sortField,
    }),
  ).toString('base64');
};
export const decoderCursor = (cursor?: string): ICursorDecoded | undefined => {
  if (!cursor) return;
  const decodedStr = Buffer.from(cursor, 'base64').toString('utf-8');
  return JSON.parse(decodedStr) as ICursorDecoded;
};
