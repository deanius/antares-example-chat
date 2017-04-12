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

const moduleName = process.argv[2] || 'chat'
const taskModule = taskModules[moduleName]

// config params
/* ************** Test config ******************* */

const Config = {
    connectionUrl: 'ws://antares-chat-db.meteorapp.com/websocket',
    mongoUrl: 'mongodb://localhost:3031/meteor',
    agentCount: 2,
    actionCountPerAgent: 3,
    actionIntervalAverage: 100,
    actionTimeout: 5000,
    agentOffset: 'none', // none (stagger eventually)
    randomizer: 'poisson' // none|poisson
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

/* ****** data lookups must use a Fiber *****/
let testDocIds = new Promise(resolve => {
    new Fiber(() => {
        resolve(taskModule.getTestDocumentIds({ Antares, mongoUrl: Config.mongoUrl }))
    }).run()
})

// Now do the really fun stuff
testDocIds.then(testDocIds => {
    const taskGenerator = taskModule.getTaskGenerator(Object.assign(testDocIds, { Antares }))
    runTests(taskGenerator) // eslint-disable-line no-use-before-define
})

function runTests(getAgentTask) {
    const results = {
        success: 0,
        error: 0,
        errors: [],
        durations: []
    }
    const markSuccess = () => { results.success += 1 }
    const markFailure = (err) => {
        results.error += 1
        results.errors.push(err)
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
