export interface ProductsInterface {
	offer: {
		$: {
			'xmlns:iof': string;
			'xmlns:iaiext': string;
			file_format: string;
			generated: string;
			expires: string;
			version: string;
			extensions: string;
		};
		products: Array<{
			$: {
				'xmlns:iaiext': string;
				currency: string;
				iof_translation_generated: string;
				language: string;
			};
			product: ProductFromFull[];
		}>;
	};
}

export interface ProductFromFull {
	$: {
		id: string;
		currency: string;
		code_on_card: string;
		producer_code_standard: string;
		type: string;
		vat: string;
		site: string;
	}
	producer: Producer[];
	category: Category[];
	unit: Unit;
	warranty: Warranty;
	card: Card;
	description: Description[];
	price: Price;
	srp: Srp;
	sizes: Sizes[];
	iaiext_price_retail_dynamic: IaiextPriceRetailDynamic;
	iaiext_omnibus_price_retail: IaiextOmnibusPriceRetail;
	iaiext_omnibus_price_wholesale: IaiextOmnibusPriceWholesale;
	images: Images[];
	parameters: Parameters;
	iaiext_sell_by: IaiextSellBy;
	iaiext_inwrapper: IaiextInwrapper;
}

interface Producer {
	$: {
		id: string;
		name: string;
	};
}

interface Category {
	$: {
		id: string;
		name: string;
	}
}

interface Unit {
	id: string;
	name: string;
}

interface Warranty {
	id: string;
	type: string;
	period: string;
	name: string;
}

interface Card {
	url: string;
}

interface Description {
	name: Array<{
		$: {
			'xml:lang': string;
		};
		_: string;
	}>;
	long_desc: Array<{
		$: {
			'xml:lang': string;
		};
		_: string;
	}>;
}

interface Price {
	$: {
		gross: string;
		net: string;
	}
}

interface Srp {
	$: {
		gross: string;
		net: string;
	}
}

interface Sizes {
	$: {
		'iaiext:group_name': string;
		'iaiext:group_id': string;
		'iaiext:sizeList': string;
	}
	size: Size[];
}

interface Size {
	$: {
		id: string;
		name: string;
		panel_name: string;
		code: string;
		weight: string;
		'iaiext:weight_net': string;
		code_producer: string;
		'iaiext:code_external': string;
		'iaiext:priority': string;
	}
	price: Price[];
	srp: Srp[];
}

interface IaiextPriceRetailDynamic {
	iaiext_site: IaiextSite;
}

interface IaiextSite {
	id: string;
	size_id: string;
	gross: string;
	net: string;
}

interface IaiextOmnibusPriceRetail {
	iaiext_site: IaiextSiteWithNewPrice;
}

interface IaiextOmnibusPriceWholesale {
	iaiext_site: IaiextSiteWithNewPrice;
}

interface IaiextSiteWithNewPrice extends IaiextSite {
	new_price: string;
}

interface Images {
	large: Array<{
		image: Array<{
			$: {
				url: string;
				hash: string;
				changed: string;
				width: string;
				height: string;
				iaiext_priority?: string;
			};
		}>;
	}>;
	icons: Array<{
		image: Array<{
			$: {
				url: string;
				hash: string;
				changed: string;
				width: string;
				height: string;
				iaiext_priority?: string;
			};
		}>;
	}>;
}

interface Parameters {
	parameter: Parameter[];
}

interface Parameter {
	type: string;
	id: string;
	priority: string;
	distinction: string;
	group_distinction: string;
	hide: string;
	auction_template_hide: string;
	name: string;
	value: Value[];
}

interface Value {
	id: string;
	priority: string;
	name: string;
}

interface IaiextSellBy {
	iaiext_retail: IaiextQuantity;
	iaiext_wholesale: IaiextQuantity;
}

interface IaiextQuantity {
	quantity: string;
}

interface IaiextInwrapper {
	quantity: string;
}