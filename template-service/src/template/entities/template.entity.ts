import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TemplateHistory } from './template-history.entity';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  type: string; // e.g., 'email', 'sms', 'push'

  @Column()
  body: string; // The actual template content

  @Column('jsonb', { nullable: true })
  variables: Record<string, any>; // JSON object for template variables

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TemplateHistory, history => history.template)
  history: TemplateHistory[];
}
