import { AntaresMeteorInit, AntaresInit, inAgencyRun } from 'meteor/deanius:antares'
import { Observable } from 'meteor/deanius:antares'
import { ViewReducer } from './reducers'

// Build up a config object, via imports
const AntaresConfig = {
    ViewReducer
}

// Pass the config to the meteorized version of AntaresInit
export const Antares = AntaresMeteorInit(AntaresInit)(AntaresConfig)

// expose Antares 'instance methods'
export const { announce, store, subscribe } = Antares

// In 'any' agent expose a top-level Antares global for demo purposes
inAgencyRun('any', function () {
    Object.assign(this, {
        Antares,
        Observable
    })
    // TODO define startup code here
})
