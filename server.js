import express from "express";
import cors from "cors";
import { exec } from "child_process";
import fs from "fs";

const app = express();

app.use(cors());
app.use(express.json());

// listar tests (filesystem)
app.get("/tests", (req,res)=>{
  const tests = fs.readdirSync("./tests");
  res.json(tests);
});

// ejecutar test
app.post("/run", (req,res)=>{
  const test = req.body.test;

  exec(`npx playwright test ${test}`, (err, stdout, stderr)=>{
    res.json({
      success: !err,
      stdout,
      stderr
    });
  });
});

app.listen(3000, ()=>console.log("Runner listo"));
