interface TelegrafContext {
  reply: (e) => string;
  update: {
    message: {
      chat: { id: string; first_name: string; username: string };
      text: string;
      from: object;
    };
  };
}

export { TelegrafContext };
