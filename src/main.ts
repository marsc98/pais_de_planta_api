import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as firebase from 'firebase-admin';

async function bootstrap() {
  firebase.initializeApp({
    credential: firebase.credential.cert({
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      projectId: process.env.FIREBASE_PROJECT_ID,
    } as Partial<firebase.ServiceAccount>),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3003);
}
bootstrap();
