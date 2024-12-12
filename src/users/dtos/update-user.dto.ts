import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Gender } from 'src/common/enums/gender.enum';
import { CreateUserSettingsDto } from './create-user-settings.dto';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  profilePic?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserSettingsDto)
  settings?: CreateUserSettingsDto;
}
