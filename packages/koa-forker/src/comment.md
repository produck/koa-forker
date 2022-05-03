* A router without any child router is a leaf router.

* There are functions & routers in a middleware list.

  For a case some functions as middleware after leaf route.

* Router.use(fn) to append function middleware.
* Router.append(router) to append router middleware.
* APIs mapping to leaf routers.

* No node then finding methods

* There many components in a Router.
* Components are MiddlewareFunctions, Routers, MethodSequences.

* koa-router api is good.

* Middlewares -> Param Queue -> Methods Handlers -> Middlewares

* Router for user, Node for middleware.

* Router.use(): CAN be middleware functions / router
* Router.register(): CAN be middleware functions

* All Components --compile()--> Node()
* Final APIs features identified by MethodNode

```js
['a', 'b', { c: /\d+/ }]
'/a/b/{c}'
'/a/b/c{d}-{e}.png'
```