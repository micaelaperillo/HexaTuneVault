import { DataSource } from 'typeorm';

export const postgres = {
  provide: 'SQL_DATA_SOURCE',
  useFactory: async () => {
    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'hexatunevault',
      synchronize: process.env.NODE_ENV !== 'production',
      entities: [__dirname + '/../../../**/*.entity.ts'],
    });

    return dataSource.initialize();
  },
};
