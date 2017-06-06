import { Antares } from '/imports/antares'
import { Mongo } from 'meteor/mongo'

// Ensure these collections exist
const Chats = new Mongo.Collection('Chats')
const Actions = new Mongo.Collection('Actions')
Object.assign(global, {
    Chats,
    Actions
})

// On the server, where Collections.Foo.update would make sense,
// write to the database.
// On the server, where Collections.Foo.update would make sense, write to the database.
const mongoRenderer = ({ action, mongoDiff }) => {
    if (!mongoDiff) return
	let { id, updateOp, upsert } = mongoDiff
	console.log(`MDB (${action.meta.antares.actionId})> `, updateOp)
	Chats.update(id, updateOp, upsert)
}
Antares.subscribeRenderer(mongoRenderer)


const twilioRenderer = ({ action }) => {
    console.log('Sending to twilio', action.payload.message)
    const message = action.payload.message
    const twilio = require('twilio')
    const client = new twilio.RestClient(process.env.DEMO_TWILIO_SID, process.env.DEMO_TWILIO_TOKEN);

    client.messages.create({
        body: message,
        to: process.env.DEMO_TWILIO_TO,
        from: process.env.DEMO_TWILIO_FROM
    }, (err, r) => console.log({ err, r }))
}

Antares.subscribeRenderer(twilioRenderer, {
    mode: 'async',
    xform: action$ => action$.filter(({ action }) =>
        action.type === 'Message.send' && action.payload.message.includes('SMS')
    )
})
