# @tommy-mitchell/test-helpers

Common test helpers and dependencies for my projects.

Re-exports the following dependencies:

- [`dedent`](https://github.com/dmnd/dedent)
- [`execa`](https://github.com/sindresorhus/execa)
- [`get-executable-bin-path`](https://github.com/tommy-mitchell/get-executable-bin-path)
- [`test-quadruple`](https://github.com/tommy-mitchell/test-quadruple)

## Install

```sh
npm install --save-dev @tommy-mitchell/test-helpers
```

<details>
<summary>Other package managers</summary>
<p>

```sh
yarn add --dev @tommy-mitchell/test-helpers
```

```sh
pnpm add --save-dev @tommy-mitchell/test-helpers
```

</p>
</details>

## Usage

```ts
import {
    $$,
    type ConcurrencyContext,
    getExecutableBinPath,
    withConcurrency,
    withTemporaryDirectory,
} from "@tommy-mitchell/test-helpers";
import anyTest, { type TestFn } from "ava";

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
```

## API

### `$$`

An `execa` wrapper configured to combine `stdout` and `stderr` and disable terminal colors.

### `withConcurrency(): Promise<{ max, lock, unlock }>`

Parses the `concurrency` environment variable and returns a semaphore.

#### `max`

Type: `number`

The maximum number of concurrent operations.

#### `lock`

Type: `() => Promise<void>`

Acquires the semaphore lock.

#### `unlock`

Type: `() => void`

Releases the semaphore lock.

### `withTemporaryDirectory(t, prefix): Promise<string>`

Makes a temporary directory and registers a teardown to remove it. Returns the path to the temporary directory.

#### `t`

Type: `Ava.ExecutionContext`

The AVA execution context.

#### `prefix`

Type: `string`

The prefix for the temporary directory name.

## Related

- [AVA](https://github.com/avajs/ava) - Node.js test runner that lets you develop with confidence 🚀
