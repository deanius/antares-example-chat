import { AntaresMeteorInit, AntaresInit, inAgencyRun } from 'meteor/deanius:antares'
import { Mongo } from 'meteor/mongo'

import Actions from './actions'
import Epics from './epics'
import { ChatReducer, ViewReducer } from './reducers'

const MetaEnhancers = [() => ({ key: ['Chats', 'chat:demo'] })]
const ReducerForKey = () => ChatReducer
const AntaresConfig = {
    Actions,
    ReducerForKey,
    Epics,
    MetaEnhancers,
    ViewReducer
}

// Pass the config to the meteorized version of AntaresInit
export const Antares = AntaresMeteorInit(AntaresInit)(AntaresConfig)
export const { announce, originate, store, subscribe } = Antares

// Example: In 'any' agent expose a top-level Antares globals for demo purposes
inAgencyRun('any', function () {
    Object.assign(this, {
        Antares,
        Actions,
        announce: Antares.announce,
        log: console.log.bind(console)
    })
})

inAgencyRun('server', () => {
    const Collections = {
        Chats: new Mongo.Collection('Chats')
    }

    Antares.subscribeRenderer(Meteor.bindEnvironment(({ mongoDiff }) => {
        // The mongoDiff object, available after every action, contains enough information to
        // apply the reducer's diffs to a Mongo database.. First we pluck off those interesting fields.
        if (mongoDiff) {
            let { id, collection, upsert, updateOp } = mongoDiff

            // Then construct the arguments mongo needs to do the update
            let mongoArgs = [
                { _id: id },  // the target id for an update, or the _id of the new document
                updateOp,     // the update op eg. $set{ 'field': 'val' }
                { upsert }    // mostly set to true
            ]

            // Do the actual imperative update to the database, and handle exceptions..
            console.log('MDB> ', updateOp)
            Collections[collection].update(...mongoArgs)
        }
    }), {
        mode: 'async',
        xform: diff$ => diff$.delay(1500)    
    })
})