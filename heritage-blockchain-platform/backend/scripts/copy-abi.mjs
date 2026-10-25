import { cpSync, mkdirSync } from "node:fs";

mkdirSync("dist/blockchain", { recursive: true });
cpSync("src/blockchain/abi", "dist/blockchain/abi", { recursive: true });
console.log("ABI copied");
