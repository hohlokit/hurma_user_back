import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync, readFile, writeFileSync } from 'fs'
import sharp from 'sharp'
import createHttpError from 'http-errors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default async ({ file, savePath = '', newFilename = null }) => {
  const { path: tempPath, originalFilename } = file
  const filenameArr = originalFilename.split('.')

  if (!filenameArr.length) return { filename: null, buffer: null, url: null }
  const ext = filenameArr[filenameArr.length - 1]

  if (!['png', 'jpeg', 'jpg'].includes(ext))
    throw createHttpError(
      400,
      'Unsupported image format. Should be one of .png, .jpg, .jpeg'
    )

  const destPath = join(__dirname, '../', '/uploads', savePath)
  const filename = newFilename ? `${newFilename}.${ext}` : originalFilename

  try {
    mkdirSync(destPath, { recursive: true })
  } catch (e) {
    console.log('Cannot create folder ', e)
  }

  readFile(tempPath, (err, data) => {
    if (err) {
      console.log(err)
    }
    writeFileSync(join(destPath, filename), data, (error) => {
      if (error) {
        console.log(error)
      }
    })
  })

  const buffer = await sharp(tempPath).png().toBuffer()

  return {
    buffer,
    url: `${destPath}/${filename}`,
    filename,
  }
}
