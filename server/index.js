import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { join } from "node:path";
import permissionsPolicy from "permissions-policy";
import ViteExpress from "vite-express";

const app = express();
ViteExpress.config({
	mode: "production",
});

const port = Number(process.env.PORT);

if (!port) {
	throw new Error("PORT environment variable is required");
}

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", port);

// Secure the app with Helmet and configure Content Security Policy
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'"],
				styleSrc: ["'self'"],
				imgSrc: ["'self'", "data:", "blob:"],
				connectSrc: ["'self'"],
			},
		},
	}),
);

app.use(
	permissionsPolicy({
		features: {
			fullscreen: ["self"],
			payment: [],
			syncXhr: [],
			serial: ["self"], // cashier needs Web Serial API for esp32
			camera: ["self"], // admins need camera access for QR scanner
		},
	}),
);

// Serve public directory
const publicDir = join(process.cwd(), "public");
console.log("Serving static files from:", publicDir);
app.use(express.static(publicDir));

ViteExpress.listen(app, port, () => {
	console.log(`Server is running on port ${port}`);
});
