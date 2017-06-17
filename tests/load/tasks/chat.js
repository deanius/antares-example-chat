import Promise from 'bluebird'

/* eslint-disable */
// each agent can look up by their index what user to be
let senderIds = {
    0: 'Self',
    1: 'Azra',
    2: 'Bubba'
}

// Returns the document(s)/users this test will operate on
export const getTestDocumentIds = () => {
    const chatKey = ['chats', 'chat:demo']

    return Promise.resolve({
        chatKey
    })
}

// Given references to document keys and Antares, returns a factory
// function which will be called to add a chat
export const getTaskGenerator = ({ Antares, chatKey }) => ({ agentIdx, eventIdx }) => {
    let sender = senderIds[agentIdx % 2]
    let prefix = ['Hey', 'Hi'][agentIdx % 2]

    // allow us to look for the return value
    let actionId = Math.round(Math.random() * 10000)

    let serverResponse = Antares.serverAction$
        .filter(({ meta }) => meta && meta.antares && meta.antares.actionId === actionId)
        .first()
        .toPromise()

    return Antares.asteroid.call('antares.acknowledge', {
        type: 'Message.send',
        payload: {
            message: `${prefix}`,
            sender
        },
        meta: {
            antares: {
                key: chatKey,
                actionId,
                reflectAction: true // so we see our response
            }
        }
    }).then(() => serverResponse)
}

export const openSubscriptions = ({ Antares, chatKey }) => {
    Antares.subscribe({ key: chatKey })
    // Antares.asteroid.ddp.on('added', msg => {
    //     console.log ('DDP ', msg)
    // })
    // todo return a promise for when this is ready
}