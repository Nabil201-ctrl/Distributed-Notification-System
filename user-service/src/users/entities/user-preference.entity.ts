import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from './user.entity';

@Entity('user_preferences')
export class UserPreference {
    @PrimaryGeneratedColumn('uuid')
    @Exclude()
    id?: string;

    @Column({ type: 'uuid' })
    @Exclude()
    user_id?: string;

    @Column({ default: true })
    email: boolean;

    @Column({ default: true })
    push: boolean;

    @CreateDateColumn()
    @Exclude()
    created_at?: Date;

    @UpdateDateColumn()
    @Exclude()
    updated_at?: Date;

    @OneToOne(() => User, (user) => user.preferences, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: User;
}