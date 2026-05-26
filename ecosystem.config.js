/**
 * PM2 Ecosystem Configuration — Cermont VPS Self-Healing
 *
 * Optimized for entry-level VPS (1-2GB RAM):
 * - Backend: max 280MB heap, restart before OOM
 * - Frontend: max 230MB heap, restart before OOM
 *
 * Usage on VPS:
 *   npm install -g pm2
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save                    # persists after reboot
 *   pm2 startup                 # generates init script
 *
 * View logs:    pm2 logs
 * View status: pm2 status
 * Monitor:     pm2 monit
 */
module.exports = {
	apps: [
		{
			name: "cermont-backend",
			cwd: "./backend",
			script: "npm",
			args: "run start",
			exec_mode: "fork",
			instances: 1,
			autorestart: true,
			watch: false,

			// Memory guard - restart before OOM (280MB for 1GB VPS)
			max_memory_restart: "280M",
			restart_delay: 3000,
			max_restarts: 10,
			min_uptime: "10s",

			// Exponential backoff: 100ms -> 200ms -> 400ms
			exp_backoff_restart_delay: 100,

			env_production: {
				NODE_ENV: "production",
				NODE_OPTIONS: "--max-old-space-size=280",
				PORT: 5000,
			},

			// Logging
			out_file: "./logs/backend-out.log",
			error_file: "./logs/backend-error.log",
			log_date_format: "YYYY-MM-DD HH:mm:ss Z",
			merge_logs: true,
		},
		{
			name: "cermont-frontend",
			cwd: "./frontend",
			script: "npm",
			args: "run start",
			exec_mode: "fork",
			instances: 1,
			autorestart: true,
			watch: false,

			// Memory guard (230MB for 1GB VPS)
			max_memory_restart: "230M",
			restart_delay: 3000,
			max_restarts: 10,
			min_uptime: "10s",
			exp_backoff_restart_delay: 100,

			env_production: {
				NODE_ENV: "production",
				NODE_OPTIONS: "--max-old-space-size=230",
				PORT: 3000,
			},

			out_file: "./logs/frontend-out.log",
			error_file: "./logs/frontend-error.log",
			log_date_format: "YYYY-MM-DD HH:mm:ss Z",
			merge_logs: true,
		},
	],
};
