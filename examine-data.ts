import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    "https://vmmbjfycdefakulnyzhl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbWJqZnljZGVmYWt1bG55emhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1OTQ3NDAsImV4cCI6MjA3MTE3MDc0MH0.GrkUW60Hm4vj68zazse1H1GIyg9A-hNx5CPYHpmM_nE",
);

(async () => {
    const { data, error } = await supabase.from("raw_records").select("*");

    // Look for vaccination records
    const vaccinationRecords = data?.filter(record => {
        const report = record.raw_record?.report?.toLowerCase() || '';
        return report.includes('vakcinac') || report.includes('očkov') ||
            report.includes('nobivac') || report.includes('biocan') ||
            report.includes('tetradog') || report.includes('eurican');
    }) || [];

    console.log("=== VACCINATION RECORDS ANALYSIS ===");
    console.log(`Found ${vaccinationRecords.length} vaccination records`);

    // Show first 5 detailed records
    vaccinationRecords.slice(0, 5).forEach((record, i) => {
        console.log(`\n--- Record ${i + 1} ---`);
        console.log(`Pet ID: ${record.pet_id}`);
        console.log(`Date: ${record.visit_date}`);
        console.log(`Report: ${record.raw_record.report}`);
        if (record.raw_record.billItems && record.raw_record.billItems.length > 0) {
            console.log(`Bill Items:`, JSON.stringify(record.raw_record.billItems, null, 2));
        }
        if (record.raw_record.sections) {
            console.log(`Sections:`, JSON.stringify(record.raw_record.sections, null, 2));
        }
    });

    // Show examples of Terapie patterns
    console.log("\n=== TERAPIE PATTERNS ===");
    const terapieRecords = data?.filter(record => {
        const report = record.raw_record?.report?.toLowerCase() || '';
        return report.includes('terapie:');
    }).slice(0, 10) || [];

    terapieRecords.forEach((record, i) => {
        console.log(`${i + 1}. ${record.raw_record.report}`);
    });
})();
