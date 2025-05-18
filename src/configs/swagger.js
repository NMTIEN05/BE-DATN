// const swaggerAutogen = require("swagger-autogen")();
import swaggerAutogen from "swagger-autogen";

swaggerAutogen();

// const doc = {
// 	info: {
// 		title: "E-commerce API",
// 		description: "Tài liệu API cho hệ thống E-commerce",
// 	},
// 	host: "localhost:5000",
// 	schemes: ["http"],
// };

const outputFile = "./src/configs/swaggerOutput.json";
const endpointsFiles = ["./src/routes/index.js"];

swaggerAutogen(outputFile, endpointsFiles);
