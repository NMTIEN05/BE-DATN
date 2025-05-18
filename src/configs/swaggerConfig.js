// import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import fs from "fs";

const swaggerDocument = JSON.parse(fs.readFileSync("./src/configs/swaggerOutput.json", "utf8"));

// const options = {
// 	definition: {
// 		openapi: "3.0.0",
// 		info: {
// 			title: "E-commerce API",
// 			version: "1.0.0",
// 			description: "Tài liệu API cho hệ thống E-commerce",
// 		},
// 		servers: [
// 			{
// 				url: "http://localhost:8888", // Đổi thành URL phù hợp với môi trường của bạn
// 			},
// 		],
// 	},
// 	apis: ["./src/routes/*.js"], // Chỉ định đường dẫn chứa file định nghĩa API
// };

// const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
	// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

// module.exports = setupSwagger;

export default setupSwagger;
