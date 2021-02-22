# Alt:V VueTS

Alt:V VueJS is available at: https://github.com/Lawliz/altv-vue-js

## What Alt:V Vue is?

Alt:V Vue is a kind of "framework" for creating views in Alt:V by using Vue (created with VueCLI)

It also allow you to render multiple apps at the same time.

![](https://cdn.discordapp.com/attachments/288593185515503616/813178827508547594/unknown.png)

### How to use?

You can clone this repository to your gamemode workdir
```
git clone https://github.com/Lawliz/altv-vue-ts.git webview
```

Once is downloaded don't forget to install `node_modules`
```
cd webview
npm i
```

After every changes you'll have to build the app running
```
npm run build
```

You can also use debug mode in game with
```
npm run serve
```
*If you browser don't open, make sure to open it in local*

### Configuration

The only configuration you've to do is simply change the **`outputDir`** in **`vue.config.js`**
```js
outputDir: join(__dirname, "../your/path")
```

You can also change the `port` in `devServer`
```js
devServer: {
    port: 25565,
    open: true
}
```

### Create an application

First create a **.vue** file in `views` directory and put the default Vue template in it
```html
<template>
    <div>
        <!-- You code goes here -->
    </div>
</template>

<script>
export default {
    name: "home"
}
</script>
```

Second go to `router/index.ts` and create a router for your application and set the key to **home**

If you don't set the key to **home** the app will never be created when called.
```ts
import { DefineComponent } from 'vue'

import HomeApplicationName from '../views/applicationName/Home.vue'
// import LoginApplicationName from '../views/applicationName/Login.vue'

const ApplicationRoutes: {[key: string]: DefineComponent} = {
    home: HomeApplicationName
    // login: LoginApplicationName
}
```

After this you've to put it in the router like this:
```ts
const Router: {[key: string]: {[key: string]: DefineComponent}} = {
    "applicationName": ApplicationRoutes
    // "secondapplication": SecondApplicationRoutes
}
```

Also don't forget to change applicationName to your application name.

You can create multiple pages by following the above steps and now you can just name it whatever you want.

## How to render in game

You can use this file for creating your view: 
```ts
import {
    WebView,
    showCursor,
    toggleGameControls,
    on,
    onServer,
    emit,
    emitServer
} from 'alt-client'

const isDebug = false

class View extends WebView {
    public cursor = false
    public controls = true

    constructor (url: string) {
        super(url, true)

        on("webview:LoadApp", this.loadApp.bind(this))
        on("webview:DestroyApp", this.destroyApp.bind(this))
        on("webview:CallEvent", this.callEvent.bind(this))
        on("webview:ChangePage", this.changePage.bind(this))
        onServer("webview:LoadApp", this.loadApp.bind(this))
        onServer("webview:DestroyApp", this.destroyApp.bind(this))
        onServer("webview:CallEvent", this.callEvent.bind(this))
        onServer("webview:ChangePage", this.changePage.bind(this))

        this.on("load", (): void => {
            emit("webview:Loaded")
            emitServer("webview:Loaded")

            this.on("webview:CallGame", (event: { type: "server"|"client", name: string }, ...args: any[]): void => {
                if (event.type === "server") emitServer(event.name, ...args)
                else if (event.type === "client") emit(event.name, ...args)
            })
        })
    }

    setCursor (state: boolean): void {
        if (this.cursor === state) return
        this.cursor = state
        showCursor(state)
    }

    setControls (state: boolean): void {
        if (this.controls === state) return
        this.controls = state
        toggleGameControls(this.controls)
    }

    loadApp (appName: string, params: any = {}): void {
        super.emit("webview:LoadApp", appName, params)
    }

    destroyApp (appName: string): void {
        super.emit("webview:DestroyApp", appName)
    }

    changePage (appName: string, pageName: string, params: any = {}): void {
        super.emit("webview:ChangePage", appName, pageName, params)
    }

    callEvent (eventName: string, ...args: any[]): void {
        super.emit("webview:CallEvent", eventName, ...args)
    }
}

const UI = (isDebug) ? new View('http://127.0.0.1:8080') : new View('http://resources/path/to/outputDir')

export default UI
```

Don't forgot to import the file or your webview will not be created.

If you change to port in `vue.config.js` don't forget to update it in `new View(127.0.0.1:8080)`

Or you're free to create your own WebView.

If you choose to create your own WebView make sure to call the event present in this file when you want to use Alt:V Vue

After creating this, in your client files you can simply do this:
```ts
import UI from './path/to/viewclass/'

// appName is a string and params is an empty object {}
// Don't forget params and args is optional so you don't need to pass it
UI.loadApp(appName, params)
UI.destroyApp(appName)
UI.changePage(appName, pageName, params)
UI.callEvent(eventName, ...args)
```

## Handle events in vue from alt

Sending event to your vue from client side
```ts
UI.callEvent(eventName, ...args)
// WebView is an instance of alt.Webview
WebView.emit("webview:CallEvent", eventName, ...args)
```

In your `.vue` file you'll have to add the `mounted()` and `beforeUnmount()` functions

After this call the Event Manager with `this.$event.on()` and `this.$event.off()` methods

*example:*
```html
<template>
    <div>
    </div>
</template>

<script>
export default {
    mounted () {
        this.$event.on(eventName, (...args) => {
            // code goes here
        })
    },
    beforeUnmount () {
        this.$event.off(eventName)
    }
}
</script>
```

You can also call vue methods:
```html
<template>
    <div>
    </div>
</template>

<script>
export default {
    methods: {
        myMethod (...args) {
            // code goes here
        }
    },
    mounted () {
        this.$event.on(eventName, this.myMethod)
    },
    beforeUnmount () {
        this.$event.off(eventName)
    }
}
</script>
```

Thoses events are called by `UI.callEvent(eventName, ...args)` or `WebView.emit("webview:CallEvent", eventName, ...args)`

## Emit event from vue to alt

We've define a method in our EventManager who allow you to send directly an event to the server or the client

We'll make an example with a simple click on a button
```html
<template>
    <div>
        <button @click="sendHelloToAlt">
    </div>
</template>

<script>
export default {
    methods: {
        sendHelloToAlt () {
            this.$event.callGame({
                type: "server"|"client",
                name: string
            }, "Hello Alt:V, I'm vue !")
        }
    }
}
</script>
```

By setting `server` or `client` in the type you'll choose your target.

And in your server file:
```ts
// alt-client
import { on } from 'alt-client'

on(event.name, (args) => {
    console.log(args)
})

// alt-server
import { onClient } from 'alt-server'

onClient(event.name, (player, args) => {
    console.log(args)
})
```

## How to change page

To change a page you can process by different methods.

First is just from your client calling the changePage method or event
```ts
UI.changePage(appName, pageName, params)
// WebView is an instance of alt.Webview
WebView.emit("webview:ChangePage", appName, pageName, params)
```

Second is calling it directly by using the AppController in Vue
```html
<template>
    <div>
    </div>
</template>

<script>
export default {
    methods: {
        clickOnButton () {
            this.$controller.changePage(this.appName, pageName, params)
        }
    }
}
</script>
```
*appName is bind on this.appName*

## Destroy an application

To destroy an application it's the same as doing a changePage, you can do it in client side
```ts
UI.destroyApp(appName)
// WebView is an instance of alt.Webview
WebView.emit("webview:DestroyApp", appName)
```

## Vue Store

You can use the Vue Store like a normal use

See https://vuex.vuejs.org/guide/ for more info

## Issues

If you had any issues with this, feel free to open an issue in this repository

Please don't DM authors on Discord for this

# Authors

Lawliz (http://github.com/Lawliz)

dictateurfou (https://github.com/dictateurfou)

# Thanks

Special thanks to Vue for everything
