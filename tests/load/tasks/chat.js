/* eslint-disable */
// each agent can look up by their index what user to be
let senderIds = {
    0: 'Self',
    1: 'Other 1',
    2: 'Other 2'
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
    return Antares.asteroid.call('antares.acknowledge', {
        type: 'Message.send',
        payload: {
            message: `${prefix}`,
            sender
        },
        meta: {
            antares: {
                key: chatKey,
                actionId: Math.round(Math.random() * 10000)
            }
        }
    })
}
