// ============================================================================
// PM2 ECOSYSTEM CONFIGURATION - CERMONT ATG
// ============================================================================
// Deploy command: pm2 start ecosystem.config.js --env production
// ============================================================================

module.exports = {
  apps: [
    // ========================================
    // BACKEND - Express API Server
    // ========================================
    {
      name: 'cermont-backend',
      script: './backend/dist/server.js',
      cwd: '/var/www/cermont',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './backend/logs/error.log',
      out_file: './backend/logs/access.log',
      merge_logs: true,
      
      // Restart behavior
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Health monitoring
      exp_backoff_restart_delay: 100,
    },
    
    // ========================================
    // FRONTEND - Next.js Application
    // ========================================
    {
      name: 'cermont-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/cermont/frontend',
      instances: 2,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-access.log',
      merge_logs: true,
      
      // Restart behavior
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      
      // Graceful shutdown
      kill_timeout: 5000,
    },
  ],
  
  // ========================================
  // DEPLOY CONFIGURATION
  // ========================================
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-vps-ip'],
      ref: 'origin/main',
      repo: 'git@github.com:JuanDiego30/cermont_aplicativo.git',
      path: '/var/www/cermont',
      'pre-deploy-local': '',
      'post-deploy': 'pnpm install && pnpm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      ssh_options: 'StrictHostKeyChecking=no',
    },
    staging: {
      user: 'deploy',
      host: ['staging-vps-ip'],
      ref: 'origin/develop',
      repo: 'git@github.com:JuanDiego30/cermont_aplicativo.git',
      path: '/var/www/cermont-staging',
      'post-deploy': 'pnpm install && pnpm run build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging',
      },
    },
  },
};
