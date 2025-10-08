import express from "express";
import userRoutes from "./src/routes/userRoutes.js";

const app = express();

app.use(express.json());

app.use("/usuarios", userRoutes);

app.listen(3000, () => {
  console.log("servidor rodando!");
});
