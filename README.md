# Telegram Admin Bot for Multi-level Writing AI

A Telegram bot for managing students in the Multi-level Writing AI platform. This bot allows teachers to add, edit, and delete students without accessing the Supabase dashboard directly.

## Features

- 🔐 Authentication via code
- 📋 View student list
- ➕ Add single or bulk students (comma-separated emails)
- ✏️ Edit student emails
- 🗑️ Delete students
- 🔄 Message editing (no message clutter)
- 🔄 Polling mode (simple, no webhook setup needed)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required environment variables:

- `BOT_TOKEN` - Your Telegram bot token (already provided)
- `AUTH_CODE` - Authentication code for teachers (already provided: `D0h8596l^^MNiw`)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (required to bypass RLS)

### 3. Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL and paste it as `SUPABASE_URL`
4. Copy the `service_role` key (⚠️ Keep this secret!) and paste it as `SUPABASE_SERVICE_ROLE_KEY`

### 4. Run the Bot

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm run build
npm start
```

## Usage

1. Start a conversation with the bot on Telegram
2. Send the authentication code: `D0h8596l^^MNiw`
3. The bot will show the main menu
4. Navigate through the menu to manage students

### Commands

- `/start` - Start the bot or return to main menu
- `/cancel` - Cancel current operation
- `/help` - Show help message

### Adding Students

- **Single student**: Enter one email address
- **Bulk students**: Enter multiple emails separated by commas
  - Example: `student1@example.com, student2@example.com, student3@example.com`

## Project Structure

```
telegram-admin-bot/
├── src/
│   ├── index.ts          # Main bot entry point
│   ├── config.ts         # Configuration and environment variables
│   ├── supabase.ts       # Supabase client and database operations
│   ├── types.ts          # TypeScript type definitions
│   ├── menu.ts           # Menu display functions
│   └── handlers.ts       # Message and callback handlers
├── .env                  # Environment variables (not in git)
├── .env.example          # Example environment variables
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## Security Notes

- ⚠️ The `SUPABASE_SERVICE_ROLE_KEY` has full access to your database. Keep it secret!
- ⚠️ The authentication code should be kept secure and only shared with authorized teachers
- The bot uses the service role key to bypass Row Level Security (RLS) for admin operations

## Troubleshooting

### Bot not responding

- Check that `BOT_TOKEN` is correct
- Verify the bot is running (check console for errors)

### Can't add/edit/delete students

- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check that the `allowed_users` table exists in your Supabase database
- Ensure the service role key has proper permissions

### Bot not connecting

- Verify the bot is using polling mode (check console for "Starting bot with polling...")
- Ensure `BOT_TOKEN` is valid and the bot is not already running elsewhere

## License

ISC
