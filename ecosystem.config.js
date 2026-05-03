module.exports = {
	apps: [
		{
			name: "cermont-backend",
			script: "dist/server.js",
			cwd: "./backend",
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: "1G",
			env: {
				NODE_ENV: "production",
				PORT: 4000,
			},
		},
		{
			name: "cermont-frontend",
			script: "node_modules/next/dist/bin/next",
			args: "start",
			cwd: "./frontend",
			instances: "max",
			exec_mode: "cluster",
			autorestart: true,
			watch: false,
			max_memory_restart: "1G",
			env: {
				NODE_ENV: "production",
				PORT: 3000,
			},
		},
	],
};
