import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('albums')
export class AlbumEntity {
  @PrimaryColumn()
  name: string = '';

  @Column()
  cover: string = '';

  @Column()
  releaseDate: string = '';

  @Column()
  totalTracks: number = 0;

  @Column('simple-array')
  artists: string[] = [];
}
