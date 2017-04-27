import '/imports/antares'

import { Mongo } from 'meteor/mongo'

const Chats = new Mongo.Collection('Chats')

const mongoRenderer = ({ action, mongoDiff }) => {

    if (!mongoDiff) return

    let { id, updateOp, upsert } = mongoDiff

    console.log('MDB> ', updateOp)

    Chats.update(id, updateOp, upsert)
}

Antares.subscribeRenderer(mongoRenderer)