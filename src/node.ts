import { BaseAsyncReader } from "./base";

export class NodeBufferBaseAsyncReader extends BaseAsyncReader {
    concatChunks(chunks: readonly Uint8Array[], length: number): Buffer {
        return Buffer.concat(chunks, length)
    }
}

export class NodeStreamAsyncReader extends NodeBufferBaseAsyncReader {
    private iterator: AsyncIterator<Buffer>

    constructor(stream: AsyncIterable<Buffer>) {
        super()
        this.iterator = stream[Symbol.asyncIterator]()
    }

    getNextChunk() {
        return this.iterator.next()
    }
}