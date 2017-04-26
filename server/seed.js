import { Antares } from '/imports/antares'
import { Chat } from '/imports/antares/actions'

Meteor.startup(() => {
    Antares.announce(Chat.start())
})