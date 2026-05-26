import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity('artists')
export class ArtistEntity {
  @PrimaryColumn({ length: 128 })
  name: string;

  @Column({ length: 2048 })
  description: string;

  @CreateDateColumn()
  createdAt?: Date;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }
}
