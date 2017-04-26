import { Antares } from '/imports/antares'

import { Mongo } from 'meteor/mongo'

// Ensure these collections exist
const Chats = new Mongo.Collection('Chats')
const Actions = new Mongo.Collection('Actions')
Object.assign(global, {
    Chats,
    Actions
})

// On the server, where Collections.Foo.update would make sense, write to the database.
const mongoRenderer = ({ action, mongoDiff }) => {
    if (!mongoDiff) return
	let { id, updateOp, upsert } = mongoDiff
	console.log('MDB> ', updateOp)
	Chats.update(id, updateOp, upsert)
}
Antares.subscribeRenderer(mongoRenderer)
