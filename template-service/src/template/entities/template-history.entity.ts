import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Template } from './template.entity';

@Entity('template_history')
export class TemplateHistory {
  @ApiProperty({ description: 'Unique identifier of the history entry' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Template, template => template.history)
  template: Template;

  @ApiProperty({ description: 'Reference to the template ID', example: '433aaf14-1f39-44cc-a48d-1cc779204081' })
  @Column()
  templateId: string; // Foreign key to Template

  @ApiProperty({ example: 'welcome_email' })
  @Column()
  name: string;

  @ApiProperty({ example: 'email' })
  @Column()
  type: string;

  @ApiProperty({ example: '<p>Hello {{name}}, welcome aboard!</p>' })
  @Column()
  body: string;

  @ApiProperty({
    type: 'object',
    example: { name: 'Ada', product: 'Beta release' },
    additionalProperties: { type: 'string' }
  })
  @Column('jsonb', { nullable: true })
  variables: Record<string, any>;

  @ApiProperty({ description: 'When this version was created', example: '2025-11-12T09:11:06.010Z' })
  @CreateDateColumn()
  versionedAt: Date; // Timestamp when this version was created
}
