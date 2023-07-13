import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync, readFile, writeFileSync } from 'fs'
import sharp from 'sharp'
import createHttpError from 'http-errors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default async ({ file, savePath = '', newFilename = null }) => {
  console.log(3.1)
  const { path: tempPath, originalFilename } = file
  const filenameArr = originalFilename.split('.')

  if (!filenameArr.length) return { filename: null, buffer: null, url: null }
  const ext = filenameArr[filenameArr.length - 1]
  console.log(3.2)

  if (!['png', 'jpeg', 'jpg'].includes(ext))
    throw createHttpError(
      400,
      'Unsupported image format. Should be one of .png, .jpg, .jpeg'
    )
  console.log(3.3)

  const destPath = join(__dirname, '../', '/uploads', savePath)
  const filename = newFilename ? `${newFilename}.${ext}` : originalFilename
  console.log(3.4)

  try {
    mkdirSync(destPath, { recursive: true })
  } catch (e) {
    console.log(3.5)

    console.log('Cannot create folder ', e)
  }
  console.log(3.6)

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
  console.log(3.7)
  const buffer = await sharp(tempPath).png().toBuffer()

  return {
    buffer,
    url: `${destPath}/${filename}`,
    filename,
  }
}
