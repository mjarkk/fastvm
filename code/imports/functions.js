const fs = require('fs-extra')
const path = require('path')
const sha1 = require('sha1')
const request = require('request')
const progress = require('request-progress')

module.exports = {
  getImgsList(callback) {
    let links = {}
    let cbStatus = typeof callback == 'function'
    let end = data => {
      if (cbStatus) {
        callback(data, links)
      }
    }
    fs.readdir('./imgs/', (err, files) => 
      !err
        ? end(files
          .filter(el => el.indexOf('.') == -1)
          .map(el => ({
            path: `./imgs/${el}/`,
            foldername: el,
            id: sha1(el)
          }))
          .map(el => Object.assign({}, el, fs.readJsonSync(el.path + 'inf.json')))
          .filter(el => typeof el.name == 'string') // filter out bad folders
          .map(el => Object.assign({}, el, {
            working: fs.existsSync(el.path + 'fastbuild.qcow2')
          }))
          .map((el, id) => {
            links[el.id] = id
            return Object.assign({}, el, {
              next: el.working 
                ? `/add/${el.id}/` 
                : `/make/${el.id}/`,
              whatIsNextUp: el.working 
                ? `Add a vm working new vm` 
                : `Build this OS to later add VMs faster` 
            })
          }))
        : cbStatus 
          ? end(false) 
          : process.exit('the imgs folder does not exsist in ./code/')
    )
  },
  downloadFile(url, to, callback, status) {
    // url = <string> (the url to download)
    // to = <string> (the write location)
    // callback = <function(<object(error)> || <undefined>)> (when the request is dune)
    // status = <function> (download status)
    progress(request(url))
    .on('progress', status)
    .on('end', () => callback())
    .on('error', callback)
    .pipe(fs.createWriteStream(to))
  }
}