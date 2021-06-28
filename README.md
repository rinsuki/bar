# @rinsuki/bar

(Binary|Buffer) Async Reader

## Install

```
yarn add @rinsuki/bar
```

## Usage

### NodeStreamAsyncReader

```ts
import { NodeStreamAsyncReader } from "@rinsuki/bar"
import * as fs from "fs"

const stream = fs.createReadStream("/dev/urandom")
const reader = new NodeStreamAsyncReader(stream)
reader.read(4).then(buf => buf.readUInt32LE(0)).then(num => console.log(num))
```

### BaseAsyncReader, NodeBufferBaseAsyncReader

in these classes, you should create sub-class and implement `getNextChunk()`. for example, please see `NodeStreamAsyncReader` [source code](src/node.ts).