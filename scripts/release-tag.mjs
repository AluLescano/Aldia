// Tags the current `main` with the version in package.json and pushes the tag.
// Usage: npm run release:tag (after the `dev` -> `main` release PR is merged and pulled)
//
// It refuses to tag unless everything is in place, because a tag is meant to never move:
// on `main`, nothing uncommitted, same commit as GitHub's `main`, and the tag is new.

import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const tag = `v${version}`

/** Runs a git command in the repo and returns its output, trimmed. */
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()

/** Prints why it stopped and exits without touching anything. */
const stop = (message) => {
  console.error(`\n✖ ${message}\n  Nothing was tagged.\n`)
  process.exit(1)
}

const branch = git('rev-parse', '--abbrev-ref', 'HEAD')
if (branch !== 'main') {
  stop(`You're on "${branch}". Releases are tagged on main: git switch main`)
}

if (git('status', '--porcelain') !== '') {
  stop('There are uncommitted changes. Commit or stash them first.')
}

console.log('Checking GitHub...')
git('fetch', '--quiet', 'origin', 'main', '--tags')
if (git('rev-parse', 'HEAD') !== git('rev-parse', 'origin/main')) {
  stop("Your main isn't the same as GitHub's. Run git pull (or push) first.")
}

// rev-parse --verify fails (throws) when the tag doesn't exist, which is what we want
let tagExists = true
try {
  git('rev-parse', '--quiet', '--verify', `refs/tags/${tag}`)
} catch {
  tagExists = false
}
if (tagExists) {
  stop(
    `${tag} already exists. Bump the version first (npm run release:patch or release:minor).`,
  )
}

git('tag', '-a', tag, '-m', `Aldia ${version}`)
git('push', '--quiet', 'origin', tag)

console.log(`
✔ Tagged and pushed ${tag}

Next:
  1. npm run release:apk   (builds the signed APK from this tag)
  2. GitHub → Releases → Draft a new release → tag ${tag}, attach the APK, tick "pre-release"
`)
