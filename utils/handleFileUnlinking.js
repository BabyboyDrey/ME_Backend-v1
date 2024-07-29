const checkAndDeleteFile = require('./checkAndDeleteFile')

async function handleFileUnlinking (files) {
  if (files) {
    for (const key in files) {
      for (const file of files[key]) {
        await new Promise((resolve, reject) => {
          checkAndDeleteFile(`uploads/${file.filename}`, err => {
            if (err) reject(err)
            else resolve()
          })
        })
      }
    }
  }
}

module.exports = handleFileUnlinking
