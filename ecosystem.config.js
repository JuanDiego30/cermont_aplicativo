module.exports = {
  apps: [
    {
      name: 'cermont-api',
      script: './src/api/dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/var/log/pm2/cermont-error.log',
      out_file: '/var/log/pm2/cermont-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git', 'src/api/dist'],
      max_restarts: 10,
      min_uptime: '10s',
      autorestart: true,
      shutdown_delay: 5000,
    },
    {
      name: 'cermont-next',
      script: 'npm',
      args: 'run start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/var/log/pm2/cermont-next-error.log',
      out_file: '/var/log/pm2/cermont-next-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '500M',
      autorestart: true,
      shutdown_delay: 5000,
    },
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-vps-host',
      ref: 'origin/main',
      repo: 'git@github.com:JuanDiego30/cermont_aplicativo.git',
      path: '/var/www/cermont',
      'post-deploy': 'npm ci --omit=dev && npm run backend:build && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': 'echo "Deploying to production"',
    },
  },
};
