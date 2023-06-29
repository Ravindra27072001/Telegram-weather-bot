import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram.module'; // Importing the TelegramModule module

@Module({
  imports: [TelegramModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
