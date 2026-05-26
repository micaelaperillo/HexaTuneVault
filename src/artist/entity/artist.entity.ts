import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity('artists')
export class ArtistEntity {
  @PrimaryColumn({ length: 128 })
  name: string;

  @Column({ length: 2048 })
  avatar: string;

  @CreateDateColumn()
  createdAt?: Date;

  constructor(name: string, avatar: string) {
    this.name = name;
    this.avatar = avatar;
  }
}
