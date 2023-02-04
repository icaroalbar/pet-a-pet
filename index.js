const express = require('express')
const cors = require('cors')

const app = express()

const PrimaryRouters = require('./routers/PrimaryRouters')
const UserRoutes = require('./routers/UserRoutes')
const PetRoutes = require('./routers/PetRoutes')

app.use(express.json())
app.use(cors({ credentials: true, origin: 'http://localhost:3000'}))
app.use(express.static('public'))

app.use('/', PrimaryRouters)
app.use('/users', UserRoutes)
app.use('/pets', PetRoutes)

app.listen(5000, () => console.log('Servidor em funcionamento em http://localhost:5000'))