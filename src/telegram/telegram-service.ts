import { Update, Ctx, Start, Help, On, Hears, Command } from 'nestjs-telegraf';
import { TelegrafContext } from './telegram-dto';
import firebase from 'firebase-admin';

@Update()
export class TelegramService {
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

  @Hears('hi')
  async hears(@Ctx() ctx: TelegrafContext) {
    await ctx.reply('Hey there');
  }

  @Command('/parente')
  async command(@Ctx() ctx: TelegrafContext) {
    await ctx.reply('Hey there----------');
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
