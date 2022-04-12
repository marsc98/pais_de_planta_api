import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalogicReadController } from './send-analogic-read/analogic-read.controller';
import { TelegramController } from './telegram/telegram.controller';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramService } from './telegram/telegram-service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TelegrafModule.forRoot({
      token: process?.env?.TELEGRAM_BOT_TOKEN,
    }),
  ],
  controllers: [AnalogicReadController, TelegramController],
  providers: [TelegramService],
})
export class AppModule {}
