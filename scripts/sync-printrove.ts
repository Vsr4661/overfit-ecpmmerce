import { syncPrintroveCatalog } from "../src/lib/printrove-sync";
import { prisma } from "../src/lib/prisma";

syncPrintroveCatalog()
  .then((result) => {
    console.log(`Printrove sync: ${result.created} created, ${result.updated} updated.`);
    for (const reason of result.skipped) console.log(`  skipped — ${reason}`);
  })
  .catch((error) => {
    console.error("Printrove sync failed:", (error as Error).message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
