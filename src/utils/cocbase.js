import { Cocobase } from "cocobase";

const db = new Cocobase({
	apiKey: import.meta.env.VITE_COCOBASE_API_KEY, // Your API key
	environment: "development", // or 'development'
});

export default db;
