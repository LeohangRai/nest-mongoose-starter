import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { KeywordPaginateAndSortQueryDto } from 'src/common/dtos/query.dto';
import { Gender } from 'src/common/enums/gender.enum';
import { User } from 'src/schemas/user.schema';

export class GetUsersQueryDto extends KeywordPaginateAndSortQueryDto<User> {
  @ApiPropertyOptional({
    enum: Gender,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
