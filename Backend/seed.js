// Seed script to add test soil data
const db = require('./config/database');
const soilAnalyzer = require('./services/soilAnalyzer');
const recommendationEngine = require('./services/recommendationEngine');

// Sample test soil data
const testSoilData = {
    land_area: 5.2,
    location: 'Sector 7, Plot 142, New Delhi',
    soil_type: 'Loamy',
    irrigation: 'Drip',
    ph_level: 6.5,
    nitrogen: 195,
    phosphorus: 41,
    potassium: 352,
    organic_carbon: 0.54,
    zinc: 0.44
};

console.log('🌱 GrowNEX Seed Script');
console.log('='.repeat(40));

// Check if data already exists
db.get('SELECT COUNT(*) as count FROM soil_data', [], (err, row) => {
    if (err) {
        console.error('Error checking existing data:', err);
        process.exit(1);
    }

    if (row.count > 0) {
        console.log(`ℹ️  Database already has ${row.count} record(s).`);
        console.log('Do you want to add another test record? (Running anyway...)');
    }

    // Insert the test soil data
    const sql = `
        INSERT INTO soil_data (
            land_area, location, soil_type, irrigation, ph_level,
            nitrogen, phosphorus, potassium, organic_carbon, zinc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        testSoilData.land_area,
        testSoilData.location,
        testSoilData.soil_type,
        testSoilData.irrigation,
        testSoilData.ph_level,
        testSoilData.nitrogen,
        testSoilData.phosphorus,
        testSoilData.potassium,
        testSoilData.organic_carbon,
        testSoilData.zinc
    ];

    db.run(sql, values, function (err) {
        if (err) {
            console.error('❌ Error inserting test data:', err);
            process.exit(1);
        }

        const soilDataId = this.lastID;
        console.log(`✅ Test soil data inserted with ID: ${soilDataId}`);

        // Calculate recommendations
        const soilScore = soilAnalyzer.calculateSoilScore(testSoilData);
        const fertilizers = recommendationEngine.getFertilizerRecommendations(testSoilData, soilScore);
        const pesticides = recommendationEngine.getPesticideRecommendations(testSoilData, soilScore);
        const crops = recommendationEngine.getCropRecommendations(testSoilData, soilScore);

        console.log(`📊 Soil Health Score: ${soilScore}/10`);
        console.log(`🌾 Fertilizer Recommendations: ${fertilizers.length}`);
        console.log(`🛡️  Pesticide Recommendations: ${pesticides.length}`);
        console.log(`🌱 Crop Recommendations: ${crops.length}`);

        // Insert recommendations
        const recSql = `
            INSERT INTO recommendations (
                soil_data_id, soil_score, fertilizers, pesticides, recommended_crops
            ) VALUES (?, ?, ?, ?, ?)
        `;

        db.run(recSql, [
            soilDataId,
            soilScore,
            JSON.stringify(fertilizers),
            JSON.stringify(pesticides),
            JSON.stringify(crops)
        ], function (recErr) {
            if (recErr) {
                console.error('❌ Error inserting recommendations:', recErr);
                process.exit(1);
            }

            console.log(`✅ Recommendations saved with ID: ${this.lastID}`);
            console.log('='.repeat(40));
            console.log('🎉 Seed completed successfully!');
            console.log('\nTest Data Summary:');
            console.log(`  📍 Location: ${testSoilData.location}`);
            console.log(`  🌍 Land Area: ${testSoilData.land_area} acres`);
            console.log(`  🧪 Soil Type: ${testSoilData.soil_type}`);
            console.log(`  💧 Irrigation: ${testSoilData.irrigation}`);
            console.log(`  📈 pH Level: ${testSoilData.ph_level}`);
            console.log(`  🔬 N-P-K: ${testSoilData.nitrogen}-${testSoilData.phosphorus}-${testSoilData.potassium}`);

            console.log('\n📝 Fertilizer Recommendations:');
            fertilizers.forEach(f => console.log(`   - ${f.name}: ${f.application}`));

            console.log('\n🛡️  Pesticide Recommendations:');
            pesticides.forEach(p => console.log(`   - ${p.name}: ${p.purpose}`));

            console.log('\n🌾 Crop Recommendations:');
            crops.forEach(c => console.log(`   - ${c.name}: ${c.suitability}`));

            // Exit after a short delay to allow console output
            setTimeout(() => {
                process.exit(0);
            }, 500);
        });
    });
});
