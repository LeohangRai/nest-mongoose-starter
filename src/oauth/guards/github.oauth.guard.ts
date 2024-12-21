import { AuthGuard } from '@nestjs/passport';

export class GithubOauthGuard extends AuthGuard('github') {}
