export class Mutex {
    chain = Promise.resolve();
    async withLock(fn) {
        const previous = this.chain;
        let release;
        this.chain = new Promise((resolve) => {
            release = resolve;
        });
        await previous;
        try {
            return await fn();
        }
        finally {
            release?.();
        }
    }
}
