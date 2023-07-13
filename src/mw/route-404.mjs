export default (req, res, _) => {
  console.log('\x1b[31m%s', String('-').repeat(50))
  console.log(`Message: Not found.`)
  console.log(`Path: ${req.path}`)
  console.log('\x1b[31m%s', String('-').repeat(50))

  res.status(404).json({ message: 'Not found.' })
}
