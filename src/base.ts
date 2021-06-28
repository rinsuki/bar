export class BaseAsyncReader {
    private buffers: Uint8Array[] = []
    isFinished: boolean = false
    private length = 0

    private _waitForNextChunk?: Promise<void>

    async getNextChunk(): Promise<{done?: boolean, value?: Uint8Array}> {
        throw new Error("Please implement waitNextChunk in your subclass!")
    }

    async readNextChunk() {
        if (this._waitForNextChunk != null) return await this._waitForNextChunk
        if (this.isFinished) {
            throw new Error("this iterator is already finished!")
        }
        return this._waitForNextChunk = (async () => {
            const res = await this.getNextChunk()
            if (res.done === true) {
                this.isFinished = true
            }
            const buffer = res.value
            if (buffer == null) throw new Error("this iterator has been finished")
            this.addBuffer(buffer)
            this._waitForNextChunk = undefined
            return
        })()
    }

    addBuffer(buffer: Uint8Array) {
        this.length += buffer.length
        this.buffers.push(buffer)
    }

    /**
     * concat multiple Uint8Arrays.
     */
    concatChunks(chunks: readonly Uint8Array[], length: number) {
        const result = new Uint8Array(length)
        let now = 0
        for (const chunk of chunks) {
            result.set(chunk, now)
            now += chunk.length
        }
        return result
    }

    async read(bytes: number): Promise<ReturnType<this["concatChunks"]>> {
        while (this.length < bytes) {
            await this.readNextChunk()
        }
        let chunks: Uint8Array[] = []
        let readed = 0
        while (readed < bytes) {
            let chunk = this.buffers.shift()
            if (chunk == null) throw new Error("chunk missing (internal invalid state)")
            this.length -= chunk.length
            const ifAdded = readed + chunk.length
            if (ifAdded > bytes) {
                const shouldRead = bytes - readed
                const b = chunk.subarray(shouldRead)
                chunk = chunk.subarray(0, shouldRead)
                this.buffers.unshift(b)
                this.length += b.length
            }
            chunks.push(chunk)
            readed += chunk.length
        }
        return this.concatChunks(chunks, bytes) as ReturnType<this["concatChunks"]>
    }
}