import AppControllerClass from './AppController'
import EventManagerClass from './EventManager'

const EventManager = new EventManagerClass()
const Controller = new AppControllerClass()

document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
}, false)

Controller.loadApp('home', {})

if ('alt' in window) {
    alt.on('webview:LoadApp', (appName, params) => {
        Controller.loadApp(appName, params)
    })

    alt.on('webview:DestroyApp', (appName) => {
        Controller.destroyApp(appName)
    })

    alt.on('webview:ChangePage', (appName, pageName, params) => {
        Controller.changePage(appName, pageName, params)
    })

    alt.on('webview:CallEvent', (eventName, ...args) => {
        EventManager.emit(eventName, ...args)
    })
}

export {
    EventManager,
    Controller
}
