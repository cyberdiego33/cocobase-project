import { Cocobase } from "cocobase";

const cb = new Cocobase({
	apiKey: import.meta.env.VITE_COCOBASE_API_KEY, // Your API key
	// projectId: import.meta.env.VITE_COCOBASE_PROJECT_ID, // Your project ID
	environment: "development", // or 'development'
});

export default cb;
