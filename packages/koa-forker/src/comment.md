* There are functions & routers in a middleware list.
* Router.use(fn, router) to append function middleware.
* No node then finding methods

* There many components in a Router.
* Components are MiddlewareFunctions, Routers, MethodSequences.

* koa-router api is good.

* Middlewares -> Param Queue -> Methods Handlers -> Middlewares

* Router for user, Node for middleware.

* Router.use(): CAN be middleware functions / router
* Router.register(): CAN be middleware functions

* All Components --compile()--> Node()
* Final APIs features identified by MethodNode(1st)

```js
['a', 'b', { c: /\d+/ }]
'/a/b/{c}'
'/a/b/c{d}-{e}.png'
```

* Path --<> Passage