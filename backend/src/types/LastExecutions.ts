export interface LastExecutions {
	productsXml: {
		date: Date | string,
		successful: boolean
	};
	pricesXml: {
		date: Date | string,
		successful: boolean
	};
}