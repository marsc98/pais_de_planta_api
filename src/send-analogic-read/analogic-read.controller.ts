import { AnalogicReadDTO } from './analogic-read-dto';
import { Body, Controller, Get, Post } from '@nestjs/common';
import firebase from 'firebase-admin';
import { TelegramService } from '../telegram/telegram-service';

@Controller('analogic-read')
export class AnalogicReadController {
  constructor(private telegramService: TelegramService) {}
  @Post('/')
  async postRead(@Body() analogicRead: AnalogicReadDTO) {
    const date = new Date();
    try {
      const family = await firebase
        .firestore()
        .collection('family')
        .doc(analogicRead?.familyId)
        .get();

      const plants = family?.data()?.plants;

      const plant = family?.data()?.plants[analogicRead?.plantName];

      const newMeasurements = plant?.measurements;
      newMeasurements.push({
        date: date,
        measurement: analogicRead?.humidity,
      });

      firebase
        .firestore()
        .collection('family')
        .doc(analogicRead?.familyId)
        .update({
          plants: {
            ...plants,
            [analogicRead?.plantName]: {
              measurements: newMeasurements,
            },
          },
        });

      if (Number(analogicRead?.humidity) < 700) {
        const result = await firebase
          .firestore()
          .collection('family')
          .doc(analogicRead?.familyId)
          .get();

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

        result?.data()?.parents?.map((parent) => {
          this.telegramService.sendMessage(
            parent?.id,
            'A sua plantinha está com pouca águinha',
          );
        });
      }
      return 200;
    } catch (err) {
      console.error(err.message);
      return -1;
    }
  }

  @Get('/')
  getRead() {
    return { message: 'Hello World' };
  }
}
