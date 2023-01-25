const mongoose = require('mongoose')
require('dotenv').config()

async function main() {
    await mongoose.connect(process.env.CONNECTION_BD,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}

main().catch(err => console.log(err))

module.exports = mongoose