import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { Sema } from "async-sema";
import type { ExecutionContext } from "ava";
import { execa } from "execa";

declare module "async-sema" {
	interface Sema { // eslint-disable-line @typescript-eslint/consistent-type-definitions
		acquire(): Promise<void>;
	}
}

/** An `execa` wrapper configured to combine `stdout` and `stderr` and disable terminal colors. */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const $$ = execa({ all: true, env: { NO_COLOR: "1" }, reject: false });

export type ConcurrencyContext = Awaited<ReturnType<typeof withConcurrency>>;

/** Parses the `concurrency` environment variable and returns a semaphore. */
export const withConcurrency = async () => {
	// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
	const max = Number(process.env["concurrency"]) || 5;
	const semaphore = new Sema(max);

	return {
		/** Acquires the semaphore lock. */
		lock: async () => semaphore.acquire(),
		/** The maximum number of concurrent locks. */
		max,
		/** Releases the semaphore lock. */
		unlock: () => semaphore.release(),
	};
};

/**
 * Makes a temporary directory and registers a teardown to remove it. Returns the path to the temporary directory.
 *
 * @param t The AVA execution context.
 * @param prefix The prefix for the temporary directory name.
 */
export const withTemporaryDirectory = async (t: ExecutionContext, prefix: string) => {
	// eslint-disable-next-line unicorn/max-nested-calls
	const temporaryDir = await fs.mkdtemp(path.join(await fs.realpath(os.tmpdir()), prefix));

	t.teardown(async () => {
		await fs.rm(temporaryDir, { force: true, recursive: true });
	});

	return temporaryDir;
};
