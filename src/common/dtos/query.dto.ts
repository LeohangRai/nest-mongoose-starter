import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { SortDirection } from '../enums/sort-direction.enum';

export class KeywordQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  keyword?: string;
}

export class PaginateQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit?: number;
}

export class KeywordAndPaginateQueryDto extends IntersectionType(
  KeywordQueryDto,
  PaginateQueryDto,
) {}

export class KeywordPaginateAndSortQueryDto<
  T extends Record<string, any>,
> extends KeywordAndPaginateQueryDto {
  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsString()
  sortBy?: keyof T;

  @ApiPropertyOptional({
    enum: SortDirection,
  })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;
}

export const DEFAULT_QUERY_PAGE = 1;
export const DEFAULT_QUERY_LIMIT = 10;
