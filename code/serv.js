const express = require('express')
const fs = require('fs-extra')
const path = require('path')
const sha1 = require('sha1')
const randomstring = require('randomstring')
const {exec, spawn} = require('child_process')

const funs = require('./imports/functions.js')

const log = console.log
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
    todo: {
      '/add/{id}/{size}': 'Create a VM fast (id = disk ID, size = disk size in GB)',
      '/make/{id}': 'Setup or remake a boilerplate to later creat a vm fast'
    },
    oss: imgs
  })
)

app.get('/add/:id/:size', (req, res) => {
  let startTime = new Date()
  let endTime = undefined
  let data = img(req.params.id)
  let newSize = Number(req.params.size) + 'G'
  let vmDisk = data.path + 'disk.qcow2'
  let vmName = 'test' /*randomstring.generate()*/
  let prepare = cb => 
    fs.ensureDir('./vms/', cb)
  let copy = cb => 
    fs.copy(vmDisk, `./vms/${vmName}.qcow2`, cb)
  let confFile = cb => 
    fs.outputJson(`./vms/${vmName}.json`, {
      name: vmName,
      ram: '2G',
      disk: newSize
    }, cb)
  let changeSize = cb => {
    cb()
  }
  let run = cb => {
    endTime = new Date();
    cb()
  }
  let taskRunner = (toRun, i) => {
    let task = toRun[i]
    if (task) {
      task(() => taskRunner(toRun, i + 1))
    } else {
      res.json({
        status: true,
        time: (Math.round((endTime - startTime) / 100) / 10) + 'S'
      })
    }
  }
  taskRunner([prepare, copy, confFile, changeSize, run], 0)
})

app.get('/make/:id', (req, res) => {
  let data = img(req.params.id)
  let vmIso = data.path + 'disk.iso'
  let vmDisk = data.path + 'disk.qcow2'
  let sendRes = false
  let dune = data => {
    if (!sendRes) {
      sendRes = true
      res.json({
        status: true,
        data
      })
    }
  }
  let error = (...err) => {
    if (!sendRes) {
      sendRes = true
      res.json({
        status: false,
        err
      })
    } else {
      log('got error:', ...err)
    }
  }
  let createDisk = () => {
    exec('qemu-img --version', (err, output, consoleErr) => 
      (err)
        ? error(err, consoleErr)
        : exec(`qemu-img create -f qcow2 ${vmDisk} ${data.diskSize}`, (err, output, consoleErr) => 
            (err)
              ? error(err, consoleErr)
              : setupVm()
          )
    )
  }
  let setupVm = () => {
    let startScript = [
      '-boot','order=d',
      '-drive','file=' + vmDisk + ',format=qcow2',
      '-m','2G',
      '-cdrom',vmIso
    ]
    const vm = spawn('qemu-system-x86_64', startScript)
    vm.stdout.on('data', data => {
      log(`stdout: ${data}`)
    })
    vm.stderr.on('data', data => {
      log(`stderr: ${data}`)
    })
    vm.on('close', code => {
      log(`child process exited with code ${code}`)
    })
  }
  if (!fs.existsSync(vmIso)) {
    funs.downloadFile(
      data.iso, 
      vmIso, 
      err => err ? error(err) : createDisk(), 
      status => log(100 / status.size.total * status.size.transferred)
    )
  } else {
    createDisk()
  }
  dune(data)
})

app.listen(conf.port, () => log(`VastVM server running on port ${conf.port}`))