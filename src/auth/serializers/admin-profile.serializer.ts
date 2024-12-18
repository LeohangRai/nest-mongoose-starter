import { OmitType } from '@nestjs/swagger';
import { UserProfileSerializer } from './user-profile.serializer';

export class AdminProfileSerializer extends OmitType(UserProfileSerializer, [
  'settings',
]) {}
