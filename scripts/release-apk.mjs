// Builds the signed release APK and copies it to release/aldia-<version>.apk.
// Usage: npm run release:apk (on the tagged main, right after npm run release:tag)
//
// Steps: web build -> copy it into the Android project -> Gradle assembleRelease -> copy the APK.
// Needs android/keystore.properties (see the README): without it the APK would come out unsigned.

import { execFileSync, spawn, spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const tag = `v${version}`
const isWindows = process.platform === 'win32'

const builtApk = path.join(root, 'android/app/build/outputs/apk/release/app-release.apk')
const releaseDir = path.join(root, 'release')
const finalApk = path.join(releaseDir, `aldia-${version}.apk`)

/** Prints why it stopped and exits. */
const stop = (message) => {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

/** Runs a command with its output on screen; stops the script if it fails. */
const run = (command, args, cwd = root) => {
  const line = `${command} ${args.join(' ')}`
  console.log(`\n▶ ${line}`)
  // One string through the shell: Windows can only start npm, npx and gradlew.bat through
  // cmd, and Node warns when args are passed separately with `shell` (ours are all fixed)
  const result = spawnSync(line, { cwd, stdio: 'inherit', shell: true })
  if (result.status !== 0) stop(`"${line}" failed (see above).`)
}

if (!fs.existsSync(path.join(root, 'android/keystore.properties'))) {
  stop(
    'android/keystore.properties is missing, so the APK would not be signed. See the README.',
  )
}

// The release file should be exactly the tagged commit. Not a hard stop: a test build is fine
let atTag = false
try {
  atTag =
    execFileSync('git', ['describe', '--tags', '--exact-match'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim() === tag
} catch {
  // not on any tag
}
if (!atTag) {
  console.warn(
    `\n⚠ This commit isn't tagged ${tag}. Fine for a test, but don't upload this APK.`,
  )
}

run('npm', ['run', 'build'])
run('npx', ['cap', 'sync', 'android'])
// Full path: Windows may not look in the current folder for a bare "gradlew.bat".
// Quoted because the shell would split a path with spaces
const androidDir = path.join(root, 'android')
const gradlew = path.join(androidDir, isWindows ? 'gradlew.bat' : 'gradlew')
run(`"${gradlew}"`, ['assembleRelease'], androidDir)

fs.mkdirSync(releaseDir, { recursive: true })
fs.copyFileSync(builtApk, finalApk)

console.log(`
✔ Aldia ${version} is ready${atTag ? '' : ' (test build, not tagged)'}

  Your APK is here:
  ${finalApk}

  (the release/ folder in the project, ignored by git)
`)

// Opens the folder with the APK selected, so it's ready to drag into GitHub
if (isWindows) {
  spawn('explorer', [`/select,${finalApk}`], { detached: true, stdio: 'ignore' }).unref()
}
