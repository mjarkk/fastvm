const express = require('express')
const app = express()
const conf = {
  port: 3303
}

app.get('/', (req, res) => 
  res.send('Hello World!')
)

app.listen(conf.port, () => console.log(`VastVM server running on port ${conf.port}`))