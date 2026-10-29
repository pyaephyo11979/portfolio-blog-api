import express from "express";
import authRouter from "@features/auth/router";
import cookieParser from "cookie-parser";

const app = express();

app.use;
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) {
    console.error(`Error starting server: ${err}`);
    return;
  }
  console.log(`Server is running on port ${PORT}`);
});
