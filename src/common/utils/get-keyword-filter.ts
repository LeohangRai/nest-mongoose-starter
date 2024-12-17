import mongoose, { RootFilterQuery } from 'mongoose';

export function getKeywordFilter<T>(
  keyword: string,
  fields: (keyof T)[],
): RootFilterQuery<T> {
  if (!keyword) return {};
  const filters: mongoose.FilterQuery<T>[] = [];
  for (const field of fields) {
    filters.push({
      [field]: {
        $regex: keyword,
        $options: 'i',
      },
    } as mongoose.FilterQuery<T>);
  }
  return {
    $or: filters,
  };
}
