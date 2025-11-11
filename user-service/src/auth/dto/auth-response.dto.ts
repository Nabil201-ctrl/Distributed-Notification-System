import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
    @ApiProperty()
    access_token: string;

    @ApiProperty()
    refresh_token: string;

    @ApiProperty()
    token_type: string;

    @ApiProperty()
    expires_in: number;

    @ApiProperty()
    user: {
        id: string;
        name: string;
        email: string;
        preferences: {
            email: boolean;
            push: boolean;
        };
    };
}