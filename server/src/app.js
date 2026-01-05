require("express-async-errors");

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./config/swagger");

const { errorHandler } = require("./middlewares/error");

const authRoute = require("./routes/auth.route");
const categoryRoute = require("./routes/category.route");
const todoRoute = require("./routes/todo.route");

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/api/auth", authRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/todos", todoRoute);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

module.exports = app;
