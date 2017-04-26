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
// write to the database. This is roughly the source of
// Antares.mongoRendererFor(Collections)
Antares.subscribeRenderer(({ action, mongoDiff }) => {
    // First- save the action!
    if (!action.type.startsWith('Activity.')) {
        Actions.insert(action)
    }

    // The mongoDiff object, available after every action, contains enough information to
    // apply the reducer's diffs to a Mongo database.. First we pluck off those interesting fields.
    if (mongoDiff) {
        let { id, updateOp, upsert } = mongoDiff

        console.log('MDB> ', updateOp)
        // Do the actual imperative update to the database, and handle exceptions..
        Chats.update(id, updateOp, upsert)
    }
})
