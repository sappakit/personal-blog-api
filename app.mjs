import "dotenv/config";
import express from "express";
import cors from "cors";
import postRouter from "./apps/postRouter.mjs";
import authRouter from "./apps/auth.mjs";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/posts", postRouter);
app.use("/auth", authRouter);

app.get("/profiles", (req, res) => {
  return res.json({
    data: {
      name: "john",
      age: 20,
    },
  });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
