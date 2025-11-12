import { ApiProperty } from '@nestjs/swagger';

export class UserPreferenceResponse {
    @ApiProperty()
    email: boolean;

    @ApiProperty()
    push: boolean;
}

export class UserResponse {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    push_token: string | null;

    @ApiProperty()
    is_active: boolean;

    @ApiProperty()
    email_verified: boolean;

    @ApiProperty()
    created_at: Date;

    @ApiProperty({ type: UserPreferenceResponse })
    preferences: UserPreferenceResponse;
}