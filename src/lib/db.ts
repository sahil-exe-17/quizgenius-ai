import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const getPrismaClient = () => {
  if (process.env.VERCEL) {
    const tmpDbPath = "/tmp/dev.db";
    
    if (!fs.existsSync(tmpDbPath)) {
      const bundledDbPath = path.join(process.cwd(), "prisma", "dev.db");
      const rootBundledDbPath = path.join(process.cwd(), "dev.db");
      
      let sourcePath = "";
      if (fs.existsSync(bundledDbPath)) {
        sourcePath = bundledDbPath;
      } else if (fs.existsSync(rootBundledDbPath)) {
        sourcePath = rootBundledDbPath;
      }
      
      if (sourcePath) {
        console.log(`Copying database from ${sourcePath} to ${tmpDbPath}`);
        try {
          fs.copyFileSync(sourcePath, tmpDbPath);
          fs.chmodSync(tmpDbPath, 0o666);
        } catch (copyErr) {
          console.error("Failed to copy database file:", copyErr);
        }
      } else {
        console.error("Could not find bundled dev.db file!");
      }
    }
    
    return new PrismaClient({
      datasources: {
        db: {
          url: `file:${tmpDbPath}`,
        },
      },
    });
  }
  
  return new PrismaClient();
};

export const prisma = getPrismaClient();
