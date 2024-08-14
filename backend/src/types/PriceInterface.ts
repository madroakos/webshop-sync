export interface PriceInterface {
	offer: {
		$: {
			file_format: string;
			version: string;
			generated_by: string;
			generated: string;
			expires: string;
			'xmlns:iof': string;
			'xmlns:iaiext': string;
		},
		products: Array<{
			$: {
				currency: string;
			}
			product: ProductFromPrices[];
		}>;
	};
}

export interface ProductFromPrices {
	$: {
		id: string;
	}
	price: Array<{
		$: {
			net: string;
		}
	}>;
	srp: Array<{
		$: {
			net: string;
		}
	}>;
	sizes: Array<{
		size: Size[];
	}>;
}

interface Size {
	$: {
		id: string;
		name: string;
		panel_name: string;
		code_producer: string;
		'iaiext:code_external': string;
		code: string;
		weight: string;
		'iaiext:weight_net': string;
	}
	stock: Stock[];
}

interface Stock {
	$: {
		id: string;
		quantity: string;
	}
}