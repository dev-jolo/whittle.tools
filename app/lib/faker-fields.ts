import type { Faker } from "@faker-js/faker";

/** A generated cell value. Dates are emitted as ISO strings. */
export type FieldValue = string | number | boolean;

export type FieldCategory =
	| "Person"
	| "Internet"
	| "Location"
	| "Company"
	| "Commerce"
	| "Finance"
	| "Date & time"
	| "Identifiers"
	| "Text"
	| "Numbers"
	| "Boolean";

export interface FieldType {
	/** Stable key stored in schemas and used as the default column name. */
	id: string;
	label: string;
	category: FieldCategory;
	/**
	 * Produce one value. `index` is the zero-based row number, enabling
	 * sequence-style fields (auto-increment ids). Depends only on the injected
	 * Faker instance, so this module carries no runtime dependency on faker.
	 */
	generate: (faker: Faker, index: number) => FieldValue;
}

/** Category display order for grouped selects. */
export const FIELD_CATEGORIES: FieldCategory[] = [
	"Identifiers",
	"Person",
	"Internet",
	"Location",
	"Company",
	"Commerce",
	"Finance",
	"Date & time",
	"Text",
	"Numbers",
	"Boolean",
];

const iso = (date: Date) => date.toISOString();

export const FIELD_TYPES: FieldType[] = [
	// Identifiers
	{
		id: "autoIncrement",
		label: "Auto-increment ID",
		category: "Identifiers",
		generate: (_faker, index) => index + 1,
	},
	{ id: "uuid", label: "UUID", category: "Identifiers", generate: (f) => f.string.uuid() },
	{
		id: "nanoid",
		label: "Nano ID",
		category: "Identifiers",
		generate: (f) => f.string.nanoid(),
	},
	{
		id: "objectId",
		label: "Mongo ObjectId",
		category: "Identifiers",
		generate: (f) => f.database.mongodbObjectId(),
	},

	// Person
	{ id: "firstName", label: "First name", category: "Person", generate: (f) => f.person.firstName() },
	{ id: "lastName", label: "Last name", category: "Person", generate: (f) => f.person.lastName() },
	{ id: "fullName", label: "Full name", category: "Person", generate: (f) => f.person.fullName() },
	{ id: "prefix", label: "Name prefix", category: "Person", generate: (f) => f.person.prefix() },
	{ id: "sex", label: "Sex", category: "Person", generate: (f) => f.person.sex() },
	{ id: "jobTitle", label: "Job title", category: "Person", generate: (f) => f.person.jobTitle() },
	{ id: "bio", label: "Bio", category: "Person", generate: (f) => f.person.bio() },

	// Internet
	{ id: "email", label: "Email", category: "Internet", generate: (f) => f.internet.email() },
	{ id: "username", label: "Username", category: "Internet", generate: (f) => f.internet.username() },
	{ id: "password", label: "Password", category: "Internet", generate: (f) => f.internet.password() },
	{ id: "url", label: "URL", category: "Internet", generate: (f) => f.internet.url() },
	{ id: "domainName", label: "Domain name", category: "Internet", generate: (f) => f.internet.domainName() },
	{ id: "ipv4", label: "IPv4 address", category: "Internet", generate: (f) => f.internet.ipv4() },
	{ id: "ipv6", label: "IPv6 address", category: "Internet", generate: (f) => f.internet.ipv6() },
	{ id: "mac", label: "MAC address", category: "Internet", generate: (f) => f.internet.mac() },
	{ id: "userAgent", label: "User agent", category: "Internet", generate: (f) => f.internet.userAgent() },
	{ id: "emoji", label: "Emoji", category: "Internet", generate: (f) => f.internet.emoji() },

	// Location
	{ id: "streetAddress", label: "Street address", category: "Location", generate: (f) => f.location.streetAddress() },
	{
		id: "fullAddress",
		label: "Full address",
		category: "Location",
		generate: (f) =>
			`${f.location.streetAddress()}, ${f.location.city()}, ${f.location.state({ abbreviated: true })} ${f.location.zipCode()}`,
	},
	{ id: "city", label: "City", category: "Location", generate: (f) => f.location.city() },
	{ id: "state", label: "State", category: "Location", generate: (f) => f.location.state() },
	{ id: "stateAbbr", label: "State abbr.", category: "Location", generate: (f) => f.location.state({ abbreviated: true }) },
	{ id: "zipCode", label: "Zip code", category: "Location", generate: (f) => f.location.zipCode() },
	{ id: "country", label: "Country", category: "Location", generate: (f) => f.location.country() },
	{ id: "countryCode", label: "Country code", category: "Location", generate: (f) => f.location.countryCode() },
	{ id: "latitude", label: "Latitude", category: "Location", generate: (f) => f.location.latitude() },
	{ id: "longitude", label: "Longitude", category: "Location", generate: (f) => f.location.longitude() },
	{ id: "timeZone", label: "Time zone", category: "Location", generate: (f) => f.location.timeZone() },

	// Company
	{ id: "companyName", label: "Company name", category: "Company", generate: (f) => f.company.name() },
	{ id: "catchPhrase", label: "Catch phrase", category: "Company", generate: (f) => f.company.catchPhrase() },
	{ id: "buzzPhrase", label: "Buzz phrase", category: "Company", generate: (f) => f.company.buzzPhrase() },

	// Commerce
	{ id: "productName", label: "Product name", category: "Commerce", generate: (f) => f.commerce.productName() },
	{ id: "productDescription", label: "Product description", category: "Commerce", generate: (f) => f.commerce.productDescription() },
	{ id: "department", label: "Department", category: "Commerce", generate: (f) => f.commerce.department() },
	{ id: "price", label: "Price", category: "Commerce", generate: (f) => Number(f.commerce.price()) },
	{ id: "color", label: "Color", category: "Commerce", generate: (f) => f.color.human() },

	// Finance
	{ id: "accountNumber", label: "Account number", category: "Finance", generate: (f) => f.finance.accountNumber() },
	{ id: "iban", label: "IBAN", category: "Finance", generate: (f) => f.finance.iban() },
	{ id: "bic", label: "BIC / SWIFT", category: "Finance", generate: (f) => f.finance.bic() },
	{ id: "creditCard", label: "Credit card number", category: "Finance", generate: (f) => f.finance.creditCardNumber() },
	{ id: "currencyCode", label: "Currency code", category: "Finance", generate: (f) => f.finance.currencyCode() },
	{ id: "amount", label: "Money amount", category: "Finance", generate: (f) => Number(f.finance.amount()) },
	{ id: "bitcoinAddress", label: "Bitcoin address", category: "Finance", generate: (f) => f.finance.bitcoinAddress() },
	{ id: "ethereumAddress", label: "Ethereum address", category: "Finance", generate: (f) => f.finance.ethereumAddress() },

	// Date & time
	{ id: "pastDate", label: "Past date", category: "Date & time", generate: (f) => iso(f.date.past()) },
	{ id: "futureDate", label: "Future date", category: "Date & time", generate: (f) => iso(f.date.future()) },
	{ id: "recentDate", label: "Recent date", category: "Date & time", generate: (f) => iso(f.date.recent()) },
	{ id: "birthdate", label: "Birthdate", category: "Date & time", generate: (f) => iso(f.date.birthdate()) },
	{ id: "unixTime", label: "Unix timestamp", category: "Date & time", generate: (f) => Math.floor(f.date.past().getTime() / 1000) },

	// Text
	{ id: "word", label: "Word", category: "Text", generate: (f) => f.lorem.word() },
	{ id: "words", label: "Words (3)", category: "Text", generate: (f) => f.lorem.words(3) },
	{ id: "sentence", label: "Sentence", category: "Text", generate: (f) => f.lorem.sentence() },
	{ id: "paragraph", label: "Paragraph", category: "Text", generate: (f) => f.lorem.paragraph() },
	{ id: "slug", label: "Slug", category: "Text", generate: (f) => f.lorem.slug() },

	// Numbers
	{ id: "int100", label: "Number (1–100)", category: "Numbers", generate: (f) => f.number.int({ min: 1, max: 100 }) },
	{ id: "int1000", label: "Number (1–1000)", category: "Numbers", generate: (f) => f.number.int({ min: 1, max: 1000 }) },
	{ id: "decimal", label: "Decimal (0–1)", category: "Numbers", generate: (f) => f.number.float({ min: 0, max: 1, fractionDigits: 4 }) },

	// Boolean
	{ id: "boolean", label: "Boolean", category: "Boolean", generate: (f) => f.datatype.boolean() },
];

export const FIELD_TYPES_BY_ID = new Map(FIELD_TYPES.map((f) => [f.id, f]));

/** Look up a field type, falling back to UUID if an id is unknown. */
export function getFieldType(id: string): FieldType {
	return FIELD_TYPES_BY_ID.get(id) ?? FIELD_TYPES_BY_ID.get("uuid")!;
}
