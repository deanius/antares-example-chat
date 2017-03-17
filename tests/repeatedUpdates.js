/* eslint-disable no-unused-vars */
import { AntaresInit } from 'antares-protocol'
import WebSocket from 'faye-websocket'
import Rx from 'rxjs'
import Promise from 'bluebird'
import ProgressBar from 'ascii-progress'
import math from 'mathjs'
import Actions from '../imports/antares/actions'

global.WebSocket = WebSocket.Client
const { Observable } = Rx

/* ************** Test config ******************* */
// Broken urls for dev:
// ws://antares-example-chat.herokuapp.com/sockjs/130/5ufzdpq0/websocket
//   Results: times out at 2500 msec
//
// 'ws://antares-example-chat.herokuapp.com/websocket'
// wss://antares-example-chat.herokuapp.com:443/websocket
///   [ 364, 32, 32, 32, 79 ]
// Results:
//  {
//   "success": 5,
//   "error": 0
//  }  - but no chats went to the site
const connectionUrl = 'wss://antares-example-chat.herokuapp.com:443/websocket'
// const connectionUrl = 'ws://localhost:3333/websocket'

// Test parameters
const numAgents = 2
const numActionsPerAgent = 7

// Non-zero timeBetweenActions are subject to the randomFactor.
// This is an analgous to a random (very random) but consistently
// average network travel time of this:
const timeBetweenActions = 0
// No randomness: 1
// Poisson randomness: -Math.log(1.0 - Math.random())  // (Preserves average rate)
const getRandomFactor = () => -Math.log(1.0 - Math.random())

// consider a test failed if it takes longer than maxWaitTime
const maxWaitTime = 2500

// Start all at once: 0
// Stagger evenly: timeBetweenActions / numAgents
const agentOffset = 0 //timeBetweenActions / numAgents

/* ************** Antares config ******************* */
const Antares = AntaresInit({ // eslint-disable-line new-cap
    connectionUrl,
    ReducerForKey: () => (state = {}) => state,
    MetaEnhancers: [
        () => ({ key: ['Chats', 'chat:demo'] })
    ]
})
Antares.announce({
    type: 'Antares.store',
    payload: { messages: [] },
    meta: {
        antares: {
            localOnly: true
        }
    }
})
// If we want results to come back (for waiting upon them, or calculating their size)
Antares.subscribe('*')

// /* ************** Test identifiers lookup ******************* */
// // If we need to do this maybe its a sign we should have set the ids beforehand
// let Fiber = require('fibers')
// // eslint-disable-next-line new-cap
// Fiber(function() {
//     let connect = require('@carbon-io/leafnode').connect
//     let db = connect('mongodb://localhost:3031/meteor')
//     let userId = db.getCollection('users').findOne({ username: 'automation_admin' })
//     let results = c.find({}).toArray().map(c => ({
//         id: c._id,
//         permissions: c.permissions
//     }))
//     console.log(results)
//     process.exit()
// }).run()
// /////////////////////////////////////

/* ************** Antares config ******************* */
// each call to announce will include enhancers for us
const enhance = [
    () => null, /* payload */
    () => ({    /* meta */
        key: ['Chats', 'chat:demo']
    })
]

const dateMark = () => String(Math.round(new Date().getTime() / 1000)).substring(5)

const senders = ['Self', 'Other 1', 'Other 2']
const getAgentTask = ({ agentIdx, eidx }) => () =>
    Promise.resolve().then(() =>     
        Antares.announce(Actions.Message.send, {
            sender: senders[agentIdx],
            message: `Hey, ${dateMark().substring(2)} (${senders[agentIdx]})`
        })
    ).timeout(maxWaitTime)

/* ************** Result reporting ******************* */
const results = {
    success: 0,
    error: 0,
    durations: []
}
const markSuccess = () => { results.success += 1 }
const markFailure = (ex) => {
    results.error += 1
    console.log('\nERR> ', ex)
}

const markDuration = duration => results.durations.push(duration)
const analyzeResults = () => {
    const durations = results.durations
    Object.assign(results, {
        average: math.mean(durations),
        stdev: math.std(durations),
        max: math.max(durations),
        '80th%': math.quantileSeq(durations, 0.8),
        '99th%': math.quantileSeq(durations, 0.99)
    })
}

/* ************** Finally, define and run it ! ******************* */
let agentWork = (progress, agentIdx) => Observable
    .range(0, numActionsPerAgent)
    .concatMap(eidx => {
        progress.tick()
        let nextEventDelay = getRandomFactor() * timeBetweenActions
        return Observable.fromPromise(Promise
            .delay(nextEventDelay)
            .then(getAgentTask({ agentIdx, eidx }))
            .then(markSuccess, markFailure)
        ).timeInterval()
        .do(({ interval }) => markDuration(Math.round(interval - nextEventDelay)))
    })
    // Staggered starts
    .startWith(Observable.timer(agentIdx * agentOffset))

let allWork = Observable
    .range(0, numAgents)
    .mergeMap(agentIdx => {
        const progress = new ProgressBar({
            schema: ':bar :current/:total :percent :elapseds :etas',
            total: numActionsPerAgent,
            blank: '◦',
            filled: '●'
        })
        return agentWork(progress, agentIdx)
    })

const errFn = (e) => {
    console.log('Died with error: ', e)
    analyzeResults()
    console.log('Results:\n', JSON.stringify(results, null, 2))
    process.exit(1)
}

const runScript = () => allWork.subscribe({
    complete: () => {
        /* Show results and exit */
        console.log('Tests completed ', results.error ? 'with some errors.' : 'cleanly YAY!')
        analyzeResults()
        console.log('Timings:\n', results.durations)
        delete results.durations
        console.log('Results:\n', JSON.stringify(results, null, 2))
        process.exit(0)
    },
    error: errFn
})

// get our first action out of the way, then measure timing
Antares.announce('ping')
    .then(runScript)
    .catch(errFn)