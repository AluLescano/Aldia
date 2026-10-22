// DEPENDENCIES
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem'

// TYPES
import type { StateStorage } from 'zustand/middleware'

// Every Aldia file lives in this folder, inside the app's private storage
const FOLDER = 'aldia'

/** The file a store is saved in, e.g. `aldia/settings.json`. */
const pathFor = (name: string) => `${FOLDER}/${name}.json`

/** Where a new save is written first, before it replaces the real file. */
const tmpPathFor = (name: string) => `${pathFor(name)}.tmp`

/** True if the file is there. `stat` throws when it isn't, so any error means "no". */
async function fileExists(path: string): Promise<boolean> {
  try {
    await Filesystem.stat({ path, directory: Directory.Data })
    return true
  } catch {
    return false
  }
}

/** Reads a file as text (the plugin can hand back a Blob on the web). */
async function readText(path: string): Promise<string> {
  const { data } = await Filesystem.readFile({
    path,
    directory: Directory.Data,
    encoding: Encoding.UTF8,
  })
  return typeof data === 'string' ? data : await data.text()
}

/** Writes the new version to the .tmp file, then swaps it in. Never call it directly: use the queue. */
async function saveNow(name: string, value: string): Promise<void> {
  const tmpPath = tmpPathFor(name)
  // 1. Write the whole new version next to the real file
  await Filesystem.writeFile({
    path: tmpPath,
    data: value,
    directory: Directory.Data,
    encoding: Encoding.UTF8,
    recursive: true, // creates the `aldia` folder the first time
  })
  // 2. Swap it in. The real file is never half-written
  await Filesystem.rename({
    from: tmpPath,
    to: pathFor(name),
    directory: Directory.Data,
  })
}

// The last task queued for each file. A new task starts only after it finishes
const queues = new Map<string, Promise<void>>()
// Files we found but couldn't read. Saving over them would destroy data we never saw, so it's refused
const unreadable = new Set<string>()

/** Runs file tasks one at a time per name, in the order they were asked for. */
function enqueue(name: string, task: () => Promise<void>): Promise<void> {
  const previous = queues.get(name) ?? Promise.resolve()
  const next = previous.then(task).catch((error) => {
    // Swallow the error so the chain keeps going: one failed save must not block every later one
    console.error(`[fileStorage] "${name}" failed`, error)
  })
  queues.set(name, next)
  return next
}

/** Reads one of a store's files. Broken JSON is set aside as `.corrupt.json` and counts as "nothing saved". */
async function readChecked(name: string, path: string): Promise<string | null> {
  let text: string
  try {
    text = await readText(path)
  } catch (error) {
    unreadable.add(name)
    console.error(
      `[fileStorage] "${name}" exists but can't be read; saving it is blocked`,
      error,
    )
    return null
  }

  try {
    JSON.parse(text) // only to check it; Zustand parses it again
    return text
  } catch {
    try {
      await Filesystem.copy({
        from: path,
        to: `${FOLDER}/${name}.corrupt.json`,
        directory: Directory.Data,
      })
      console.error(
        `[fileStorage] "${name}" had broken JSON; kept a copy as ${name}.corrupt.json`,
      )
    } catch (error) {
      // Couldn't even keep a copy: then don't let a save destroy the only one
      unreadable.add(name)
      console.error(
        `[fileStorage] "${name}" had broken JSON and no copy could be kept`,
        error,
      )
    }
    return null
  }
}

/** Saves each store as a JSON file in the app's private folder (Zustand `persist` storage). */
export const fileStorage: StateStorage<Promise<void>> = {
  getItem: async (name) => {
    const path = pathFor(name)
    if (await fileExists(path)) return readChecked(name, path)
    // The app died between the two steps of a save: the new version only exists as .tmp
    const tmpPath = tmpPathFor(name)
    if (await fileExists(tmpPath)) return readChecked(name, tmpPath)
    return null
  },

  setItem: (name, value) => {
    if (unreadable.has(name)) {
      console.error(`[fileStorage] not saving "${name}": its file couldn't be read`)
      return Promise.resolve()
    }
    return enqueue(name, () => saveNow(name, value))
  },

  removeItem: (name) =>
    enqueue(name, async () => {
      for (const path of [pathFor(name), tmpPathFor(name)]) {
        if (await fileExists(path)) {
          await Filesystem.deleteFile({ path, directory: Directory.Data })
        }
      }
    }),
}
