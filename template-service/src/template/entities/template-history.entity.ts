import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Template } from './template.entity';

@Entity('template_history')
export class TemplateHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Template, template => template.history)
  template: Template;

  @Column()
  templateId: string; // Foreign key to Template

  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  body: string;

  @Column('jsonb', { nullable: true })
  variables: Record<string, any>;

  @CreateDateColumn()
  versionedAt: Date; // Timestamp when this version was created
}
