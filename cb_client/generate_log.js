var logger = require('pino')()
var inputLogClass = process.argv[2]
process.argv.shift()
process.argv.shift()
process.argv.shift()
var inputLog = process.argv[3]
var server_log = logger.child({ event: 'logging:chaturbae-client' })
server_log.info(process.argv.join(" "))
