const express = require("express");
const cors = require("cors");
const notasRouter = require("./notasRouter");

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

app.use("/api/notas", notasRouter);

app.listen(PORT, () => {
  console.log(`Backend de notas escuchando en http://localhost:${PORT}`);
});
