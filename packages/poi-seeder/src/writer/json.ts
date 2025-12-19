import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import type { Writer } from '@/types'

export class JsonWriter implements Writer {
  private filePath: string
  constructor(filePath: string) {
    const filedir = path.dirname(__dirname)
    this.filePath = path.resolve(filedir, '..', 'output', filePath)
    // create directory if not exists
    const dir = path.dirname(this.filePath)
    fs.mkdir(dir, { recursive: true }).catch((err) => {
      console.error('Error creating directory for JSON writer:', err)
    })
  }
  async write(data: any[]): Promise<void> {
    const json = JSON.stringify(data, null, 2)
    await fs.writeFile(this.filePath, json, 'utf-8')
  }
}
