{
	market: {
		depends: state.symbols.ready,
		values: symbols.getMarkets,
		default: [storage.market, defaultMarket()]
		next: symbol
	},
	symbol: {
		depends: state.market,
		values: symbols.getSymbols(market),
		default: [storage.symbol, defaultSymbol(state.market)],
		next: ['category'],
	},
	category: {
		depends: state.symbol && contracts.ready,
		values: categories.getCategories(),
		default: [storage.category, defaultCategory()],
		next: ['start_time','expiry_type','stop_type'],
	},
	start_time: {
		depends: state.category,
		values: categoryHelper.getStartTimes(),
		default: [storage.start_time,defaultStartTime()] ,
		next: ['expiry_type']
	},
	expiry_type: {
		depends: state.category || state.start_time1
		values: categories.getExpiryTypes(),
	}

}