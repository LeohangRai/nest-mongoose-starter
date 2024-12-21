import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserWithTimestamps } from 'src/schemas/user.schema';
import { UAParser } from 'ua-parser-js';
import { GithubOauthGuard } from './guards/github.oauth.guard';
import { OauthService } from './oauth.service';

@Controller('oauth')
@ApiTags('oauth (users)')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @Get('github')
  @UseGuards(GithubOauthGuard)
  async login() {}

  @Get('github/callback')
  @ApiExcludeEndpoint()
  @UseGuards(GithubOauthGuard)
  /**
   * this callback/method is called after the user is authenticated by the GitHub OAuth provider
   * (meaning, after the github strategy validate() method is called, which attaches the user to the request object)
   */
  async authCallback(
    @GetUser() user: UserWithTimestamps,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ua = UAParser(req.headers['user-agent']);
    const uaPayload = {
      ipAddress: req.ip,
      userAgent: ua.ua,
      browser: ua.browser.name,
      os: ua.os.name,
    };
    return this.oauthService.webLogin(user, uaPayload, res);
  }
}
