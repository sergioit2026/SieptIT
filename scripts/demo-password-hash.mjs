#!/usr/bin/env node
// Gera DEMO_PASSWORD_HASH (scrypt) para o modo demonstração.
// Uso: node scripts/demo-password-hash.mjs   (pede a palavra-passe, sem eco)
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
rl._writeToOutput = (s) => { if (!rl.muted) rl.output.write(s); };
rl.question("Palavra-passe do demo: ", (pw) => {
  rl.close();
  process.stdout.write("\n");
  if (!pw || pw.length < 12) {
    console.error("Use pelo menos 12 caracteres.");
    process.exit(1);
  }
  const salt = randomBytes(16);
  const key = scryptSync(pw, salt, 64);
  console.log(`DEMO_PASSWORD_HASH=scrypt:${salt.toString("base64url")}:${key.toString("base64url")}`);
});
rl.muted = true;
