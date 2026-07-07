/** @type {import('pm2').StartOptions[]} */
module.exports = {
	apps: [
		{
			name: "cermont-backend",
			cwd: "./backend",
			script: "dist/server.js",
			instances: 2,
			exec_mode: "cluster",
			env: {
				NODE_ENV: "production",
				PORT: "4000",
			},
			max_memory_restart: "500M",
			log_date_format: "YYYY-MM-DD HH:mm:ss Z",
			error_file: "../logs/backend-error.log",
			out_file: "../logs/backend-out.log",
			merge_logs: true,
			time: true,
		},
		{
			name: "cermont-frontend",
			cwd: "./frontend",
			script: "node_modules/.bin/next",
			args: "start -p 3000",
			env: {
				NODE_ENV: "production",
			},
			max_memory_restart: "500M",
			log_date_format: "YYYY-MM-DD HH:mm:ss Z",
			error_file: "../logs/frontend-error.log",
			out_file: "../logs/frontend-out.log",
			merge_logs: true,
			time: true,
		},
	],
};
