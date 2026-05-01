import db from "@/lib/db";
import { hashPassword } from "@/lib/password";

async function main() {
  try {
    console.log("🔄 Starting password hashing migration...");

    // Get all staff members
    const staff = await db.staff.findMany();
    console.log(`Found ${staff.length} staff members`);

    let updated = 0;
    let skipped = 0;

    for (const s of staff) {
      // Check if password is already hashed (bcrypt hashes start with $2a, $2b, or $2y)
      if (s.password.startsWith("$2")) {
        console.log(`⏭️  Skipping ${s.name} (already hashed)`);
        skipped++;
        continue;
      }

      try {
        const hashedPassword = await hashPassword(s.password);
        await db.staff.update({
          where: { id: s.id },
          data: { password: hashedPassword },
        });
        console.log(`✅ Hashed password for ${s.name}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error hashing password for ${s.name}:`, error);
      }
    }

    console.log(`\n📊 Migration complete:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${staff.length}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
