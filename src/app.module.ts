import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { readFileSync } from 'fs';
import { load as yamlLoad } from 'js-yaml';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => yamlLoad(readFileSync('config/default.yml', 'utf-8'))],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.mongo_url'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
