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

    const parents = family?.data()?.parents;

    const newParents = [
      ...parents,
      {
        id: ctx?.update?.message?.chat?.id,
        name: ctx?.update?.message?.chat?.first_name,
        userName: ctx?.update?.message?.chat?.username || 'private',
      },
    ];

    try {
      if (family?.data()) {
        firebase
          .firestore()
          .collection('family')
          .doc(ctx?.update?.message?.text)
          .set(
            {
              parents: newParents,
            },
            { merge: true },
          );
        await ctx.reply('Você agora é oficialmente parente dessa plantinha');
      } else {
        console.error('Não encontrado');
        await ctx.reply('Família não encontrada, o código deve estar errado');
      }
    } catch (err) {
      console.error(err.message);
    }
  }
}

@Injectable()
export class SendMessage {
  constructor(chatId, message, @InjectBot() private bot: Telegraf<Context>) {
    try {
      const t = this?.bot?.telegram?.sendMessage(
        String(chatId),
        String(message),
      );
    } catch (err) {
      console.error(err.message);
    }
  }
}
