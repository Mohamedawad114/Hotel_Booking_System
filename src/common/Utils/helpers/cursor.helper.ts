import { ICursorDecoded } from 'src/common/interfaces';

export const encodedCursor = ({
  createdAt,
  id,
}: {
  createdAt: Date;
  id: number;
}) => {
  const str = JSON.stringify({ id, createdAt });
  return Buffer.from(str).toString('base64');
};
export const decoderCursor = (cursor?: string): ICursorDecoded | undefined => {
  if (!cursor) return ;
  const decodedStr = Buffer.from(cursor, 'base64').toString('utf-8');
  return JSON.parse(decodedStr) as ICursorDecoded;
};
