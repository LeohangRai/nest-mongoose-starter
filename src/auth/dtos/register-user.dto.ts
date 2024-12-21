import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  VALID_PASSWORD_REGEX,
  VALID_USERNAME_REGEX,
} from 'src/common/constants/regex';
import { Gender } from 'src/common/enums/gender.enum';
import { CreateUserSettingsDto } from 'src/users/dtos/create-user-settings.dto';
import {
  INVALID_PASSWORD_ERROR_MSG,
  INVALID_USERNAME_ERROR_MSG,
} from './error-msgs';

export class RegisterUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsLowercase()
  @Matches(VALID_USERNAME_REGEX, {
    message: INVALID_USERNAME_ERROR_MSG,
  })
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  displayName: string;

  @ApiProperty({
    format: 'email',
  })
  @IsNotEmpty()
  @IsEmail()
  @IsLowercase()
  email: string;

  @ApiPropertyOptional({
    enum: Gender,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profilePic?: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  @Matches(VALID_PASSWORD_REGEX, {
    message: INVALID_PASSWORD_ERROR_MSG,
  })
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserSettingsDto)
  settings?: CreateUserSettingsDto;
}
