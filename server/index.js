import { Antares } from '/imports/antares'
import { Mongo } from 'meteor/mongo'

// Ensure these collections exist
const Chats = new Mongo.Collection('Chats')
const Actions = new Mongo.Collection('Actions')
Object.assign(global, {
  Chats,
  Actions
})

// Here, on the server, where calling Collections.Foo.update would
// make sense, we define how we map diffs in the application objects
// to the {$update} objects Mongo requires to implement those diffs.
// Antares programmatically translates diffs in your object graphs
// into database update command invocations.
const mongoRenderer = ({
  action: { meta: { antares: { actionId } } },
  mongoDiff
}) => {
  if (!mongoDiff) return
  let { id, updateOp, upsert } = mongoDiff
  // Object.assign(updateOp, {$set: {_id: id}})
  if (updateOp.$set) {
    updateOp.$set._id = id
  }
  console.log(`MDB (${actionId})> [chats, ${id}] upsert: ${upsert}`, updateOp)
  Chats.update(id, updateOp, upsert)
}
Antares.subscribeRenderer(Meteor.bindEnvironment(mongoRenderer))

const twilioRenderer = ({ action }) => {
  console.log('Sending to twilio', action.payload.message)
  const message = action.payload.message
  const twilio = require('twilio')
  const client = new twilio.RestClient(
    process.env.DEMO_TWILIO_SID,
    process.env.DEMO_TWILIO_TOKEN
  )

  client.messages.create(
    {
      body: message,
      to: process.env.DEMO_TWILIO_TO,
      from: process.env.DEMO_TWILIO_FROM
    },
    (err, r) => console.log({ err, r })
  )
}

Antares.subscribeRenderer(twilioRenderer, {
  mode: 'async',
  xform: action$ =>
    action$.filter(
      ({ action }) =>
        action.type === 'Message.send' && action.payload.message.includes('SMS')
    )
})
