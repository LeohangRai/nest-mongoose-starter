import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github';
import { AuthProvider } from 'src/common/enums/auth-provider.enum';
import { UserWithTimestamps } from 'src/schemas/user.schema';
import { OauthService } from '../oauth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    configService: ConfigService,
    private readonly oauthService: OauthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('oauth.github.client_id'),
      clientSecret: configService.getOrThrow<string>(
        'oauth.github.client_secret',
      ),
      callbackURL: `${configService.get('app.url') || 'http://localhost'}:${configService.get('app.port') || 7000}/oauth/github/callback`,
      scope: ['public_profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<UserWithTimestamps> {
    return this.oauthService.upsertOauthUser({
      provider: AuthProvider.GITHUB,
      providerId: profile.id,
      displayName: profile.displayName,
      profilePic: profile.photos?.[0].value,
      email: profile.emails?.[0].value,
    });
  }
}
