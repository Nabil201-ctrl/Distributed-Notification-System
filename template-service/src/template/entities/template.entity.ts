import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TemplateHistory } from './template-history.entity';

@Entity('templates')
export class Template {
  @ApiProperty({ description: 'Unique identifier of the template', example: '433aaf14-1f39-44cc-a48d-1cc779204081' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Human readable unique name for the template', example: 'welcome_email' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Channel type such as email, sms or push', example: 'email' })
  @Column()
  type: string; 

  @ApiProperty({
    description: 'Template body that supports placeholder variables',
    example: '<p>Hello {{name}}, welcome aboard!</p>',
  })
  @Column()
  body: string; 

  @ApiProperty({
    description: 'JSON object describing variables embedded in the template',
    example: { name: 'Ada', product: 'ALPHA release' },
    type: 'object',
    additionalProperties: { type: 'string' }
  })
  @Column('jsonb', { nullable: true })
  variables: Record<string, any>; 

  @ApiProperty({ description: 'Creation timestamp', example: '2025-11-12T09:11:06.010Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Time the template was last updated', example: '2025-11-12T09:11:06.010Z' })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TemplateHistory, history => history.template)
  history: TemplateHistory[];
}
