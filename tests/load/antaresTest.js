// imports, boilerplate etc
import { AntaresInit } from 'antares-protocol'
import WebSocket from 'faye-websocket'
import Rx from 'rxjs'
import Promise from 'bluebird'
import ProgressBar from 'ascii-progress'
import math from 'mathjs'
import Fiber from 'fibers'
import taskModules from './tasks'

global.WebSocket = WebSocket.Client
const { Observable } = Rx

// config params
/* ************** Test config ******************* */

const Config = {
    connectionUrl: 'ws://localhost:3333/websocket',
    mongoUrl: 'mongodb://localhost:3031/meteor',
    agentCount: 2,
    actionCountPerAgent: 2,
    actionIntervalAverage: 900,
    actionTimeout: 1000,
    agentOffset: 'none', // none (stagger eventually)
    randomizer: 'poisson' // none|poisson
}

const envs = {
    development: {
        connectionUrl: 'ws://localhost:3333/websocket'
    },
    production: {
        agentCount: 1,
        actionCountPerAgent: 3,
        connectionUrl: 'wss://antares-chat-db.meteorapp.com/websocket'
    }
}

// npm run test:load -- development|production
const moduleName = 'chat'
const taskModule = taskModules[moduleName]

const env = process.argv[2] || 'development'
Object.assign(
    Config,
    { env },
    envs[env]
)

const results = {
    success: 0,
    error: 0,
    errors: [],
    durations: [],
    serverSentMessages: {
        antares: 0,
        ddp: 0
    },
    serverSentBytes: {
        antares: -1,
        ddp: -1
    }
}
const markSuccess = () => { results.success += 1 }
const markFailure = (err) => {
    results.error += 1
    results.errors.push(err)
}
const markDuration = duration => results.durations.push(duration)

const colls = [...(taskModule.subscribedCollections || []), 'Antares.remoteActions']
if (taskModule.openSubscriptions) {
    console.log('Listening to collections:  ', colls)
}

// Allow nice querying - TODO move into non-Meteor antares
const serverAction = new Rx.Subject

// mark the size of a DDP message
const markSize = msg => {
    if (!colls.includes(msg.collection)) return

    serverAction.next(msg.fields)
    const byteSize = JSON.stringify(msg).length
    const type = msg.collection.startsWith('Antares') ? 'antares' : 'ddp'
    results.serverSentBytes[type] += byteSize
    results.serverSentMessages[type] += 1
}

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

// how many ms this agent's work is staggered w.r.t test beginning
const getAgentStagger = () => {
    // broken, effectively doing return 0
    return 0
    // let stagger = agentIdx * (Config.actionIntervalAverage / Config.agentCount)
    // return stagger
}

const getDelay = () => {
    // return Config.actionIntervalAverage
    if (Config.randomizer !== 'poisson') return Config.actionIntervalAverage
    return Config.actionIntervalAverage * (- Math.log(Math.random()))
}

// ************** Antares config *******************
const Antares = AntaresInit({ // eslint-disable-line new-cap
    connectionUrl: Config.connectionUrl,
    ReducerForKey: () => (state = {}) => state
})
Antares.serverAction$ = serverAction.asObservable()


/* ****** data lookups must use a Fiber *****/
let testDocIds = new Promise(resolve => {
    new Fiber(() => {
        resolve(taskModule.getTestDocumentIds({ Antares, mongoUrl: Config.mongoUrl }))
    }).run()
})

// TODO login each agent when each agent gets its own connection
let whenLoggedIn = Promise.resolve()
if (Config.login) {
    // when we're logged in a user record comes back - create a Promise for it
    whenLoggedIn = whenLoggedIn.then(() => {
        debugger
        return Antares.asteroid.loginWithPassword(Config.login)
    }).timeout(5000, "Login timed out" + JSON.stringify(Config.login) + '-' + Config.connectionUrl)
}

// Now do the really fun stuff
testDocIds
    .then(testDocIds => {
        // Wait for readiness
        if (taskModule.openSubscriptions) {
            return whenLoggedIn
                .then(() =>
                    taskModule.openSubscriptions(Object.assign(testDocIds, { Antares }))
                )
                .then(() => testDocIds)
        }
        return testDocIds
    })
    .then(testDocIds => {
        if (taskModule.openSubscriptions) {
            Antares.asteroid.ddp.on('added', markSize)
            Antares.asteroid.ddp.on('changed', markSize)
        }
        return testDocIds
    })
    .then(testDocIds => {
        const taskGenerator = taskModule.getTaskGenerator(Object.assign(testDocIds, { Antares, Config }))
        runTests(taskGenerator)
    })
    .catch(ex => {
        console.log(ex)
        process.exit(1)
    })

function runTests(getAgentTask) {

    /* ************** Finally, define and run it ! ******************* */
    let agentWork = (progress, agentIdx) => Observable
        .range(0, Config.actionCountPerAgent)
        .concatMap(eventIdx => {
            progress.tick()
            return Observable.fromPromise(
                Promise.resolve(getAgentTask({ agentIdx, eventIdx }))
                .timeout(Config.actionTimeout)
                .then(markSuccess, markFailure)
            ).timeInterval().do(({ interval }) => markDuration(interval))
            .concat(Observable.timer(getDelay()))
        })

    let allWork = Observable
        .range(0, Config.agentCount)
        .mergeMap(agentIdx => {
            const progress = new ProgressBar({
                schema: ':bar :current/:total :percent :elapseds :etas',
                total: Config.actionCountPerAgent,
                blank: '◦',
                filled: '●'
            })
            return agentWork(progress, agentIdx)
                  .startWith(Observable.timer(getAgentStagger(agentIdx)))
        })

    allWork.subscribe({
        complete() {
            /* Show results and exit */
            // eslint-disable-next-line
            console.log('\nTests completed ', results.error ? 'with some errors.' : 'cleanly YAY!')
            analyzeResults()
            // eslint-disable-next-line
            console.log(Config)
            // eslint-disable-next-line
            console.log('Results:\n', JSON.stringify(results, null, 2))
            process.exit(0)
        },
        error(e) {
            // eslint-disable-next-line
            console.log('\nDied with error: ', e)
            analyzeResults()
            // eslint-disable-next-line
            console.log('Results:\n', JSON.stringify(results, null, 2))
            process.exit(1)
        }
    })
}
