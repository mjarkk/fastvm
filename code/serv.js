const express = require('express')
const fs = require('fs-extra')
const path = require('path')
const sha1 = require('sha1')

const funs = require('./imports/functions.js')

const app = express()
const conf = {
  port: 3303
}

// get a list of availeble setup
let imgs = []
let links = {}
const getImgsList = cb => 
  funs.getImgsList((_imgs, _links) => {
    imgs = _imgs
    links = _links
    if (typeof cb == 'function') {
      cb()
    }
  })
getImgsList()

// get image
const img = id => 
  (typeof id == 'number') 
    ? imgs[id]
    : imgs[links[id]]


app.get('/', (req, res) => 
  res.json({
    status: true,
    msg: 'Server is running, use /info/ to view availible OSes to setup or use',
    next: '/info'
  })
)

app.get('/info/', (req, res) => 
  res.json({
    status: true,
    msg: imgs
  })
)

app.get('/make/:id', (req, res) => {
  let data = img(req.params.id)
  res.json(data)
})

app.listen(conf.port, () => console.log(`VastVM server running on port ${conf.port}`))