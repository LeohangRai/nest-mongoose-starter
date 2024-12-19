import { ApiHeader } from '@nestjs/swagger';
import { CustomHeader } from 'src/auth/enums/custom-header.enum';

/**
 * Decorator to define the refresh token header for API endpoints.
 *
 * @returns A decorator function that applies the ApiHeader metadata.
 */
export const ApiRefreshTokenHeader = () =>
  ApiHeader({
    name: CustomHeader.RefreshToken,
    description: 'refresh token for generating new access token',
    required: true,
    schema: {
      type: 'string',
    },
  });
