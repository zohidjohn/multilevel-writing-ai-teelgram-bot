# Quick Start Guide

## 1. Install Dependencies

```bash
cd telegram-admin-bot
npm install
```

## 2. Configure Environment

Edit the `.env` file and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**To get your Supabase credentials:**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the "Project URL" → `SUPABASE_URL`
5. Copy the "service_role" key (⚠️ Keep it secret!) → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Run the Bot

**For local development (uses polling):**

```bash
npm run dev
```

The bot will start and you'll see:

```
Starting bot with polling...
Bot is running!
Press Ctrl+C to stop the bot
```

## 4. Test the Bot

1. Open Telegram and search for your bot
2. Start a conversation
3. Send the authentication code: `D0h8596l^^MNiw`
4. You should see the main menu appear
5. Try adding a student by clicking "Student List" → "Add Student"

## 5. Production Setup (Webhook)

When deploying to production:

1. Set environment variables:

   ```env
   NODE_ENV=production
   WEBHOOK_URL=https://your-domain.com
   PORT=3000
   ```

2. Build and start:

   ```bash
   npm run build
   npm run start:prod
   ```

3. Make sure your server is accessible at `https://your-domain.com/webhook`

## Troubleshooting

- **Bot not responding?** Check that `BOT_TOKEN` in `.env` is correct
- **Can't add students?** Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- **TypeScript errors?** Run `npm install` to ensure all dependencies are installed
