// eslint-disable-next-line ava/no-ignored-test-files
import anyTest, { type TestFn } from "ava";
import {
	$$,
	type ConcurrencyContext,
	getExecutableBinPath,
	withConcurrency,
	withTemporaryDirectory,
} from "./src/index.ts";

const test = anyTest as TestFn<{
	binPath: string;
	concurrency: ConcurrencyContext;
}>;

test.before("setup context", async t => {
	t.context.binPath = await getExecutableBinPath({
		map: binPath => binPath.replace("dist", "src").replace(".js", ".ts"),
	});

	t.context.concurrency = await withConcurrency();
	t.log("CLI concurrency:", t.context.concurrency.max);
});

test.beforeEach("setup concurrency", async t => {
	await t.context.concurrency.lock();
});

test.afterEach.always(t => {
	t.context.concurrency.unlock();
});

test("cli", async t => {
	const cwd = await withTemporaryDirectory(t, "foo-cli-");
	const result = await $$(t.context.binPath, { cwd });
});
