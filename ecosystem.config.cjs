/**
 * PM2 Ecosystem Configuration — CERMONT S.A.S.
 *
 * Usage (VPS Linux):
 *   npm run build                 # Build all workspaces
 *   npm run pm2:start             # Start both apps
 *   pm2 save                      # Persist process list
 *   pm2 startup                   # Generate systemd autostart command
 *                                  # (run the printed command with sudo)
 *
 * Local development:
 *   npm run dev                   # Use turbo for local dev — NOT pm2
 *
 * @see docs/deploy/pm2-vps.md
 * @type {import('pm2').StartOptions[]}
 */
// eslint-disable-next-line no-undef
module.exports = {
	apps: [
		{
			name: "cermont-backend",
			cwd: "./backend",
			script: "dist/server.js",
			instances: 1,
			exec_mode: "fork",
			env: {
				NODE_ENV: "production",
				PORT: "4000",
			},
			max_memory_restart: "512M",
			error_file: "./logs/backend-error.log",
			out_file: "./logs/backend-out.log",
			time: true,
			stop_exit_codes: [0],
		},
		{
			name: "cermont-frontend",
			cwd: "./frontend",
			script: "node_modules/next/dist/bin/next",
			args: "start -p 3000",
			instances: 1,
			exec_mode: "fork",
			env: {
				NODE_ENV: "production",
				PORT: "3000",
			},
			max_memory_restart: "512M",
			error_file: "./logs/frontend-error.log",
			out_file: "./logs/frontend-out.log",
			time: true,
			stop_exit_codes: [0],
		},
	],
};
