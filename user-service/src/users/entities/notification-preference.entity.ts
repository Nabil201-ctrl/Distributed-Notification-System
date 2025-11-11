import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('notification_preferences')
export class NotificationPreference {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ default: true })
    email_enabled: boolean;

    @Column({ default: true })
    push_enabled: boolean;

    @Column({ default: true })
    marketing_enabled: boolean;

    @Column({ default: true })
    security_alerts_enabled: boolean;

    @Column({ type: 'json', nullable: true })
    quiet_hours: {
        enabled: boolean;
        start_time: string; // HH:mm format
        end_time: string;
        timezone: string;
    };

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToOne(() => User, (user) => user.notification_preferences, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: User;
}