const express = require('express')
const fs = require('fs-extra')
const path = require('path')
const app = express()
const conf = {
  port: 3303
}

// get a list of availeble setup
let imgs = []
const getImgsList = callback => {
  let cbStatus = typeof callback == 'function'
  let cb = !cbStatus
    ? (() => 0)
    : callback
  fs.readdir('./imgs/', (err, files) => 
    !err
      ? cb(imgs = files
        .filter(el => el.indexOf('.') == -1)
        .map(el => ({
          path: `./imgs/${el}/inf.json`,
          foldername: el
        }))
        .map(el => Object.assign({}, el, fs.readJsonSync(el.path)))
        .filter(el => typeof el.name == 'string')
        .map(el => Object.assign({}, el, {
          working: fs.existsSync(path.resolve(__dirname, `./imgs/${el.foldername}/fastbuild.qcow2`))
        })))
      : cbStatus 
        ? cb(false) 
        : process.exit('the imgs folder does not exsist in ./code/')
  )
}
getImgsList()

app.get('/', (req, res) => 
  res.json({
    status: true,
    msg: 'Server is running, use /info/ to view availible OSes to setup or use'
  })
)

app.get('/info/', (req, res) => 
  res.json({
    status: true,
    msg: imgs
  })
)

app.listen(conf.port, () => console.log(`VastVM server running on port ${conf.port}`))