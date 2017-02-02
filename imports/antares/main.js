import { AntaresMeteorInit, AntaresInit, inAgencyRun } from 'meteor/deanius:antares'

// TODO: Build up a config object, via imports
let Actions = {}
const AntaresConfig = {
    Actions
}

// Pass the config to the meteorized version of AntaresInit
export const Antares = AntaresMeteorInit(AntaresInit)(AntaresConfig)

// Example: In 'any' agent expose a top-level Antares globals for demo purposes
inAgencyRun('any', function () {
    Object.assign(this, {
        Antares,
        announce: Antares.announce,
        log: console.log.bind(console)
    })
})
