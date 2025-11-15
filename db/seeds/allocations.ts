import { seedDb as db, pool } from '../seed-config';
import { projects, people, projectAllocations } from '../schema';
import { getDaysOfMonth } from '../../lib/date-utils';

async function seedAllocations() {
  try {
    console.log('🌱 Seeding project allocations...');

    // Recupera progetti e persone esistenti
    const existingProjects = await db
      .select({ id: projects.id })
      .from(projects);
    const existingPeople = await db.select({ id: people.id }).from(people);

    if (existingProjects.length === 0 || existingPeople.length === 0) {
      console.log(
        '⚠️  Nessun progetto o persona trovati. Esegui prima i seed di people e projects.'
      );
      return;
    }

    console.log(
      `📊 Found ${existingProjects.length} projects and ${existingPeople.length} people`
    );

    // Genera allocazioni per il mese corrente (Novembre 2025)
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; // 11 (Novembre)
    const year = currentDate.getFullYear(); // 2025
    const days = getDaysOfMonth(month, year);

    console.log(
      `📅 Generating allocations for ${month}/${year} (${days.length} days)`
    );

    // Puliamo le allocazioni esistenti per questo mese
    console.log('🧹 Clearing existing allocations for current month...');
    await db.delete(projectAllocations);

    const allocationsToInsert = [];

    // Per ogni progetto, assegna 2-4 persone random
    for (const project of existingProjects) {
      const numPeople = Math.floor(Math.random() * 3) + 2; // 2-4 persone
      const selectedPeople = [...existingPeople]
        .sort(() => Math.random() - 0.5)
        .slice(0, numPeople);

      for (const person of selectedPeople) {
        // Genera allocazioni random per alcuni giorni del mese
        const numDays = Math.floor(Math.random() * 12) + 8; // 8-20 giorni
        const selectedDays = [...days]
          .sort(() => Math.random() - 0.5)
          .slice(0, numDays);

        for (const day of selectedDays) {
          // Ore random: 0.5, 1, 2, 4, 6, 8
          const possibleHours = [0.5, 1, 2, 4, 6, 8];
          const hours =
            possibleHours[Math.floor(Math.random() * possibleHours.length)];

          allocationsToInsert.push({
            projectId: project.id,
            personId: person.id,
            date: day,
            hours: hours,
          });
        }
      }
    }

    console.log(
      `📊 Preparing to insert ${allocationsToInsert.length} allocations...`
    );

    // Inseriamo le allocazioni in batch
    if (allocationsToInsert.length > 0) {
      await db.insert(projectAllocations).values(allocationsToInsert);
    }

    console.log(
      `✅ Successfully seeded ${allocationsToInsert.length} project allocations!`
    );

    // Verifica inserimento
    const insertedData = await db.select().from(projectAllocations);
    console.log(`\n📈 Total allocations in database: ${insertedData.length}`);

    // Mostra alcune statistiche
    const totalHours = insertedData.reduce(
      (sum, alloc) => sum + alloc.hours,
      0
    );
    console.log(`⏱️  Total hours allocated: ${totalHours}h`);
  } catch (error) {
    console.error('❌ Error seeding allocations:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedAllocations();
