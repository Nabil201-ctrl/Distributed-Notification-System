import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    Index,
    OneToMany
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserPreference } from './user-preference.entity';
import { PushToken } from './push-token.entity';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
    SERVICE = 'service', // For inter-service communication
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    name: string;

    @Column({ unique: true, length: 255 })
    @Index()
    email: string;

    @Column()
    @Exclude()
    password?: string;

    @Column({ type: 'text', nullable: true })
    push_token: string | null;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @Column({ default: true })
    @Exclude()
    is_active?: boolean;

    @Column({ default: false })
    email_verified: boolean;

    @Column({ type: 'text', nullable: true })
    @Exclude()
    refresh_token?: string | null;

    @Column({ type: 'timestamp', nullable: true })
    @Exclude()
    last_login?: Date | null;

    @CreateDateColumn()
    @Exclude()
    created_at?: Date;

    @UpdateDateColumn()
    @Exclude()
    updated_at?: Date;

    @OneToOne(() => UserPreference, (pref) => pref.user, {
        cascade: true,
        eager: true,
    })
    preferences: UserPreference;

    @OneToMany(() => PushToken, (token) => token.user, { cascade: true })
    push_tokens: PushToken[];
}