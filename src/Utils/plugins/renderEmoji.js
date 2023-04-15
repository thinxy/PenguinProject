import { fillTextWithTwemoji } from "node-canvas-with-twemoji-and-discord-emoji";

export default async (ctx, message, x, y) => {
  return await fillTextWithTwemoji(ctx, message, x, y);
};