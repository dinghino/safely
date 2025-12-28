import { generateFiles } from 'fumadocs-typescript'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const backendRoot = path.resolve(__dirname, '../../../packages/backend/convex')
const outputDir = path.resolve(__dirname, '../content/developer/api')

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

function getFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true })
  const files = dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name)
    return dirent.isDirectory() ? getFiles(res) : res
  })
  return Array.prototype.concat(...files)
}

const allFiles = getFiles(backendRoot)
const targetFiles = allFiles.filter(
  (f) =>
    f.endsWith('.ts') &&
    !f.includes('_generated') &&
    !f.includes('tsconfig.json') &&
    !f.includes('convex.config.ts') &&
    !f.includes('auth.config.ts'), // Exclude config files
)

console.log(`Generating docs for ${targetFiles.length} files from ${backendRoot}...`)

// generate docs
// Note: verify `generate` options in fumadocs-typescript documentation if possible.
// Assuming basic usage:
generateFiles({
  input: targetFiles,
  output: outputDir,
})
  .then(() => {
    console.log('Documentation generated successfully!')
  })
  .catch((err) => {
    console.error('Error generating documentation:')
    console.dir(err, { depth: null })
    if (err.stack) console.error(err.stack)
    process.exit(1)
  })
