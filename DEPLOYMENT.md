# Deployment Guide for Dokploy

This guide explains how to deploy the Telegram Admin Bot to a VPS using Dokploy.

## Prerequisites

- VPS with Dokploy installed
- Docker installed on the VPS
- Telegram Bot Token
- Supabase credentials

## Environment Variables

Create a `.env` file with the following variables:

```env
BOT_TOKEN=your_telegram_bot_token
AUTH_CODE=D0h8596l^^MNiw
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Deployment Steps

### Option 1: Using Dokploy UI

1. **Login to Dokploy**
   - Access your Dokploy dashboard

2. **Create New Application**
   - Click "New Application" or "Add Project"
   - Choose "Docker" or "Git Repository"

3. **Configure Git Repository (if using Git)**
   - Repository URL: `https://github.com/zohidjohn/multilevel-writing-ai-teelgram-bot.git`
   - Branch: `main`
   - Build Command: `npm run build`
   - Start Command: `npm start`

4. **Set Environment Variables**
   - Add all required environment variables from `.env.example`
   - Make sure to set `BOT_TOKEN`, `AUTH_CODE`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`

5. **Deploy**
   - Click "Deploy" or "Save"
   - Wait for the build to complete
   - Check logs to ensure the bot started successfully

### Option 2: Using Docker Compose (Manual)

1. **SSH into your VPS**
   ```bash
   ssh user@your-vps-ip
   ```

2. **Clone the repository**
   ```bash
   git clone https://github.com/zohidjohn/multilevel-writing-ai-teelgram-bot.git
   cd multilevel-writing-ai-teelgram-bot
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your credentials
   ```

4. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

5. **Check logs**
   ```bash
   docker-compose logs -f telegram-bot
   ```

### Option 3: Using Dockerfile directly

1. **Build the image**
   ```bash
   docker build -t telegram-admin-bot .
   ```

2. **Run the container**
   ```bash
   docker run -d \
     --name telegram-admin-bot \
     --restart unless-stopped \
     --env-file .env \
     telegram-admin-bot
   ```

## Verifying Deployment

1. **Check container status**
   ```bash
   docker ps | grep telegram-bot
   ```

2. **View logs**
   ```bash
   docker logs -f telegram-admin-bot
   ```

3. **Test the bot**
   - Open Telegram
   - Search for your bot
   - Send `/start` command
   - Send the authentication code
   - You should see the main menu

## Troubleshooting

### Bot not responding
- Check logs: `docker logs telegram-admin-bot`
- Verify `BOT_TOKEN` is correct
- Ensure bot is not rate-limited

### Connection errors
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check network connectivity from VPS

### Build failures
- Ensure Node.js 20+ is available in Docker
- Check that all dependencies are in `package.json`
- Review build logs for specific errors

## Updating the Bot

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Rebuild and restart**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

## Monitoring

- Check logs regularly: `docker logs -f telegram-admin-bot`
- Monitor resource usage: `docker stats telegram-admin-bot`
- Set up log rotation if needed

## Security Notes

- Never commit `.env` file to Git
- Use strong `AUTH_CODE` in production
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- Regularly update dependencies

