import * as Koa from 'koa';

interface ForkerTypedKoaContext<
	StateT = Koa.DefaultState,
	ContextT = Koa.DefaultContext
> {
	params: Record<string, string>;

	route: RouteHub<StateT, ContextT>;
}

type ForkerKoaContext<
	StateT = Koa.DefaultState,
	ContextT = Koa.DefaultContext
> = Koa.ParameterizedContext<
	StateT,
	ContextT & ForkerTypedKoaContext<StateT, ContextT>
>;

type Middleware<
	StateT = Koa.DefaultState,
	ContextT = Koa.DefaultContext
> = Koa.Middleware<
	StateT,
	ContextT & ForkerTypedKoaContext<StateT, ContextT>
>;

interface RouterOptions {
	prefix?: string;

	name?: string;
}

type RedirectCode = 301 | 302 | 303 | 307 | 308;

interface RedirectOptions {

	code: RedirectCode;

	params: {};
}

interface PathOptions {
	name: string | null;
	path: string;
}

type PathDescriptor = string | PathOptions | (string | PathOptions)[];

interface MiddlewareOptions {
	onMethodNotAllowed: boolean | Middleware | Middleware[];
	onNotImplemented: boolean | Middleware | Middleware[];
}

declare class RouteHub<
	StateT = Koa.DefaultState,
	ContextT = Koa.DefaultContext
> {
	readonly abstract: object;

	has(name: string): boolean;

	url(name: string, params: object): string;

	Middleware(options?: MiddlewareOptions): Middleware<StateT, ContextT>;
}

interface ParamMiddleware {
	(param: string, ctx: ForkerKoaContext): any;
}

export class Router<
	StateT = Koa.DefaultState,
	ContextT = Koa.DefaultContext
> {

	constructor(options?: RouterOptions);

	readonly name: string;

	prefix: string;

	RouteHub(): RouteHub;

	Middleware(options?: MiddlewareOptions): Middleware<StateT, ContextT>;

	param(name: string, paramMiddleware: Function): this;

	redirect(
		path: PathDescriptor,
		destinationName: string,
		options?: RedirectCode | RedirectOptions
	): this;

	use(path?: PathDescriptor, ...args: (Middleware<StateT, ContextT> | Router)[]): this;
	use(...args: (Middleware<StateT, ContextT> | Router)[]): this;

	all(path?: PathDescriptor, ...args: Middleware<StateT, ContextT>[]): this;
	all(...args: Middleware<StateT, ContextT>[]): this;

	get(path?: PathDescriptor, ...args: Middleware<StateT, ContextT>[]): this;
	get(...args: Middleware<StateT, ContextT>[]): this;

	post(path?: PathDescriptor, ...args: Middleware<StateT, ContextT>[]): this;
	post(...args: Middleware<StateT, ContextT>[]): this;

	put(path?: PathDescriptor, ...args: Middleware<StateT, ContextT>[]): this;
	put(...args: Middleware<StateT, ContextT>[]): this;

	delete(path?: PathDescriptor, ...args: Middleware<StateT, ContextT>[]): this;
	delete(...args: Middleware<StateT, ContextT>[]): this;

	patch(path?: PathDescriptor, ...args: Middleware<StateT, ContextT>[]): this;
	patch(...args: Middleware<StateT, ContextT>[]): this;

	head(path?: PathDescriptor, ...args: Middleware<StateT, ContextT>[]): this;
	head(...args: Middleware<StateT, ContextT>[]): this;

	options(path?: PathDescriptor, ...args: Middleware<StateT, ContextT>[]): this;
	options(...args: Middleware<StateT, ContextT>[]): this;
}
