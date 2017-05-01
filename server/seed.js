import { Antares } from '/imports/antares'
import { Chat } from '/imports/antares/actions'

// For demo purposes, make sure a chat has been started each time the server starts.
// In actual use, the server would push the most recent of a record from a persistent store.
Antares.startup.then(() => {
    Antares.announce(Chat.start())
})
