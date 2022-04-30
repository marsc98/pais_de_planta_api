import {
  Update,
  Ctx,
  Start,
  Help,
  On,
  Hears,
  Command,
  InjectBot,
} from 'nestjs-telegraf';
import { TelegrafContext } from './telegram-dto';
import firebase from 'firebase-admin';
import { Telegraf } from 'telegraf';
import { Context } from './context-dto';
import { Injectable } from '@nestjs/common';

@Update()
export class TelegramService {
  constructor(@InjectBot() private bot: Telegraf<Context>) {}

  sendMessage(chatId: string | number, message: string): void {
    this?.bot?.telegram?.sendMessage(chatId, message);
  }

  @Start()
  async start(@Ctx() ctx: TelegrafContext) {
    await ctx.reply(
      'Olá parente da plantinha, apartir de agora iremos te avisar por aqui como está sua plantinha, nos envie o código da familia da sua plantinha:',
    );
  }

  @Help()
  async help(@Ctx() ctx: TelegrafContext) {
    await ctx.reply('Send me a sticker');
  }

  @Hears(['Hi', 'Oi', 'oi', 'hi'])
  async hears(@Ctx() ctx: TelegrafContext) {
    console.log(ctx?.update?.message?.from);
    await ctx.reply('Oiiii');
  }

  @Command('/medicoes')
  async command(@Ctx() ctx: TelegrafContext) {
    const family = await firebase
      .firestore()
      .collection('family')
      .where('parents', 'array-contains', ctx?.update?.message?.chat?.id)
      .get();
    await ctx.reply(family);
  }

  @On('message')
  async on(@Ctx() ctx: TelegrafContext) {
    const family = await firebase
      .firestore()
      .collection('family')
      .doc(ctx.update.message.text)
      .get();
    if (family?.data()) {
      firebase
        .firestore()
        .collection('family')
        .doc(ctx?.update?.message?.text)
        .set(
          {
            parents: [
              ...family?.data().parents,
              {
                id: ctx?.update?.message?.chat?.id,
                name: ctx?.update?.message?.chat?.first_name,
                userName: ctx?.update?.message?.chat?.username,
              },
            ],
          },
          { merge: true },
        );
      await ctx.reply('Você agora é oficialmente parente dessa plantinha');
    } else {
      console.log('Não encontrado');
      await ctx.reply('Família não encontrada, o código deve estar errado');
    }
  }
}

@Injectable()
export class SendMessage {
  constructor(chatId, message, @InjectBot() private bot: Telegraf<Context>) {
    console.log('chatId: ' + chatId);
    console.log('message: ' + message);
    try {
      const t = this?.bot?.telegram?.sendMessage(
        String(chatId),
        String(message),
      );
      console.log(t && t);
    } catch (err) {
      console.log('Erro:');
      console.log(err.message);
    }
  }
}
