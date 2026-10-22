import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { fileStorage as FileStorage } from './fileStorage'

/*
 * A fake of the Capacitor Filesystem plugin: files live in a Map, keyed by path. It behaves
 * like the real one where fileStorage depends on it: `stat` and `readFile` throw for a missing
 * file, `rename` deletes the destination first (like Android), and writes take a moment, so
 * two saves started together really interleave unless something makes them wait.
 */
const disk = vi.hoisted(() => ({
  files: new Map<string, string>(),
  /** Paths whose next read throws (a file that exists but can't be read). */
  brokenReads: new Set<string>(),
  /** How many of the next writes fail (a full disk, say). */
  failingWrites: 0,
}))

vi.mock('@capacitor/filesystem', () => {
  const later = () => new Promise((resolve) => setTimeout(resolve, 0))
  const mustExist = (path: string) => {
    if (!disk.files.has(path)) throw new Error(`File does not exist: ${path}`)
  }

  return {
    Directory: { Data: 'DATA' },
    Encoding: { UTF8: 'utf8' },
    Filesystem: {
      stat: async ({ path }: { path: string }) => {
        mustExist(path)
        return { type: 'file' }
      },
      readFile: async ({ path }: { path: string }) => {
        if (disk.brokenReads.has(path)) throw new Error(`Can't read ${path}`)
        mustExist(path)
        return { data: disk.files.get(path) }
      },
      writeFile: async ({ path, data }: { path: string; data: string }) => {
        await later()
        if (disk.failingWrites > 0) {
          disk.failingWrites--
          throw new Error('Disk full')
        }
        disk.files.set(path, data)
        return { uri: path }
      },
      rename: async ({ from, to }: { from: string; to: string }) => {
        mustExist(from)
        disk.files.delete(to)
        await later()
        disk.files.set(to, disk.files.get(from) ?? '')
        disk.files.delete(from)
      },
      copy: async ({ from, to }: { from: string; to: string }) => {
        mustExist(from)
        disk.files.set(to, disk.files.get(from) ?? '')
        return { uri: to }
      },
      deleteFile: async ({ path }: { path: string }) => {
        mustExist(path)
        disk.files.delete(path)
      },
    },
  }
})

let fileStorage: typeof FileStorage
let errorLog: ReturnType<typeof vi.spyOn>

beforeEach(async () => {
  disk.files.clear()
  disk.brokenReads.clear()
  disk.failingWrites = 0
  // fileStorage keeps its queues and locks in memory: a fresh copy per test
  vi.resetModules()
  ;({ fileStorage } = await import('./fileStorage'))
  // Some tests fail on purpose: keep the expected errors out of the output, but count them
  errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('saving and loading', () => {
  it('gives back what was saved, with no .tmp left behind', async () => {
    await fileStorage.setItem('test', '{"v":1}')
    expect(await fileStorage.getItem('test')).toBe('{"v":1}')
    expect([...disk.files.keys()]).toEqual(['aldia/test.json'])
  })

  it('gives null when nothing was ever saved', async () => {
    expect(await fileStorage.getItem('test')).toBeNull()
  })

  it('loads the .tmp when the app died between writing it and swapping it in', async () => {
    disk.files.set('aldia/test.json.tmp', '{"v":2}')
    expect(await fileStorage.getItem('test')).toBe('{"v":2}')
  })
})

describe('the save queue', () => {
  it('keeps the last of two saves started at the same time', async () => {
    await Promise.all([
      fileStorage.setItem('test', '{"v":1}'),
      fileStorage.setItem('test', '{"v":2}'),
    ])
    expect(await fileStorage.getItem('test')).toBe('{"v":2}')
    expect(errorLog).not.toHaveBeenCalled()
  })

  it('keeps saving after one save fails', async () => {
    disk.failingWrites = 1
    await fileStorage.setItem('test', '{"v":1}')
    await fileStorage.setItem('test', '{"v":2}')
    expect(await fileStorage.getItem('test')).toBe('{"v":2}')
    expect(errorLog).toHaveBeenCalledTimes(1)
  })
})

describe('protecting the data', () => {
  it('sets broken JSON aside as .corrupt.json and starts clean', async () => {
    disk.files.set('aldia/test.json', '{broken')
    expect(await fileStorage.getItem('test')).toBeNull()
    expect(disk.files.get('aldia/test.corrupt.json')).toBe('{broken')

    // The copy is safe, so saving a fresh version is allowed
    await fileStorage.setItem('test', '{"v":1}')
    expect(disk.files.get('aldia/test.json')).toBe('{"v":1}')
  })

  it('refuses to save over a file it could not read', async () => {
    disk.files.set('aldia/test.json', '{"keep":true}')
    disk.brokenReads.add('aldia/test.json')
    expect(await fileStorage.getItem('test')).toBeNull()

    await fileStorage.setItem('test', '{"v":1}')
    expect(disk.files.get('aldia/test.json')).toBe('{"keep":true}')
  })
})

describe('removeItem', () => {
  it('deletes both the file and a leftover .tmp', async () => {
    disk.files.set('aldia/test.json', '{"v":1}')
    disk.files.set('aldia/test.json.tmp', '{"v":2}')
    await fileStorage.removeItem('test')
    expect(disk.files.size).toBe(0)
  })
})
