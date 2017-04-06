export const View = {
    selectViewer: (viewer) => ({
        type: 'View.selectViewer',
        payload: viewer,
        meta: { antares: { localOnly: true } }
    })
}
