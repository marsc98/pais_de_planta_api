import { AnalogicReadDTO } from './analogic-read-dto';
import { Body, Controller, Get, Post } from '@nestjs/common';
import firebase from 'firebase-admin';
import { TelegramService } from '../telegram/telegram-service';

@Controller('analogic-read')
export class AnalogicReadController {
  constructor(private telegramService: TelegramService) {}
  @Post('/')
  async postRead(@Body() analogicRead: AnalogicReadDTO) {
    try {
      firebase
        .firestore()
        .collection('family')
        .doc(analogicRead?.familyId)
        .collection('plants')
        .doc(analogicRead?.plantName)
        .update({
          reads: firebase.firestore.FieldValue.arrayUnion({
            humidity: analogicRead.humidity,
            date: new Date(),
          }),
        });

      if (Number(analogicRead?.humidity) < 700) {
        const result = await firebase
          .firestore()
          .collection('family')
          .doc(analogicRead?.familyId)
          .get();

        console.log(result.data());

        result?.data()?.parents?.map((parent) => {
          this.telegramService.sendMessage(
            parent?.id,
            'A sua plantinha está com muuuita água',
          );
        });
      }

      if (Number(analogicRead?.humidity) > 900) {
        const result = await firebase
          .firestore()
          .collection('family')
          .doc(analogicRead?.familyId)
          .get();

        console.log(result.data());

        result?.data()?.parents?.map((parent) => {
          this.telegramService.sendMessage(
            parent?.id,
            'A sua plantinha está com pouca águinha',
          );
        });
      }
      return 200;
    } catch (err) {
      console.log(err.message);
      return -1;
    }
  }

  @Get('/')
  getRead() {
    return { message: 'Hello World' };
  }
}
