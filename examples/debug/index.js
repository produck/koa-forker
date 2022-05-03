const DuckKoa = require('@produck/koa-forker');

const forker = new DuckKoa.Forker({
	flow: [
		'api',
		{
			name: 'AccountNamespace',
			test: 'account',
			flow: [
				Authenticate,
				{
					name: 'AccountInstance',
					test: /^\d+$/,
					flow: [
						getAccount,
						{

						},
						respondAccount
					]
				}
			]
		}
	]
});

const router = forker.rootRouter.get()