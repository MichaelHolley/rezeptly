import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { parseEnv } from 'node:util';

const fileEnv = parseEnv(readFileSync(new URL('../.env.test', import.meta.url), 'utf8'));
const testEnv = process.env.CI ? { ...fileEnv, ...process.env } : { ...process.env, ...fileEnv };
const playwrightArgs = process.argv.slice(2);

const run = (command, args, env = process.env) => {
	const result = spawnSync(command, args, { env, stdio: 'inherit' });
	if (result.error) console.error(result.error.message);
	return result.status ?? 1;
};

let exitCode = 0;

if (!process.env.CI) {
	exitCode = run('docker', ['compose', '--profile', 'test', 'rm', '--stop', '--force', 'test-db']);
	if (exitCode === 0) {
		exitCode = run('docker', [
			'compose',
			'--profile',
			'test',
			'up',
			'--detach',
			'--wait',
			'test-db'
		]);
	}
}

try {
	if (exitCode === 0) exitCode = run('pnpm', ['db:migrate'], testEnv);
	if (exitCode === 0) {
		exitCode = run('pnpm', ['exec', 'playwright', 'test', ...playwrightArgs], testEnv);
	}
} finally {
	if (!process.env.CI) {
		const cleanupExitCode = run('docker', [
			'compose',
			'--profile',
			'test',
			'rm',
			'--stop',
			'--force',
			'test-db'
		]);
		if (exitCode === 0) exitCode = cleanupExitCode;
	}
}

process.exitCode = exitCode;
