import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender } from 'src/common/enums/gender.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  profilePic?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
