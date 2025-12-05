const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validateSoilData } = require('../middleware/validation');
const soilAnalyzer = require('../services/soilAnalyzer');
const recommendationEngine = require('../services/recommendationEngine');

router.post('/analyze', validateSoilData, (req, res) => {
  const soilData = req.body;

  const sql = `
    INSERT INTO soil_data (
      land_area, location, soil_type, irrigation, ph_level, 
      nitrogen, phosphorus, potassium, organic_carbon, zinc
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    soilData.land_area,
    soilData.location,
    soilData.soil_type,
    soilData.irrigation,
    soilData.ph_level,
    soilData.nitrogen,
    soilData.phosphorus,
    soilData.potassium,
    soilData.organic_carbon,
    soilData.zinc
  ];

  db.run(sql, values, function (err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to save soil data' });
    }

    const soilScore = soilAnalyzer.calculateSoilScore(soilData);
    const fertilizers = recommendationEngine.getFertilizerRecommendations(soilData, soilScore);
    const pesticides = recommendationEngine.getPesticideRecommendations(soilData, soilScore);
    const crops = recommendationEngine.getCropRecommendations(soilData, soilScore);

    const recSql = `
      INSERT INTO recommendations (
        soil_data_id, soil_score, fertilizers, pesticides, recommended_crops
      ) VALUES (?, ?, ?, ?, ?)
    `;

    const recValues = [
      this.lastID,
      soilScore,
      JSON.stringify(fertilizers),
      JSON.stringify(pesticides),
      JSON.stringify(crops)
    ];

    db.run(recSql, recValues, function (recErr) {
      if (recErr) {
        console.error('Recommendations save error:', recErr);
      }
    });

    res.json({
      id: this.lastID,
      soil_score: soilScore,
      fertilizers: fertilizers,
      pesticides: pesticides,
      recommended_crops: crops,
      message: 'Soil analysis completed successfully'
    });
  });
});

router.get('/history', (req, res) => {
  const sql = `
    SELECT s.*, r.soil_score, r.fertilizers, r.pesticides, r.recommended_crops, r.created_at as analysis_date
    FROM soil_data s
    LEFT JOIN recommendations r ON s.id = r.soil_data_id
    ORDER BY s.created_at DESC
    LIMIT 50
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch soil history' });
    }

    const results = rows.map(row => ({
      ...row,
      fertilizers: row.fertilizers ? JSON.parse(row.fertilizers) : [],
      pesticides: row.pesticides ? JSON.parse(row.pesticides) : [],
      recommended_crops: row.recommended_crops ? JSON.parse(row.recommended_crops) : []
    }));

    res.json(results);
  });
});

router.get('/analysis/:id', (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT s.*, r.soil_score, r.fertilizers, r.pesticides, r.recommended_crops
    FROM soil_data s
    LEFT JOIN recommendations r ON s.id = r.soil_data_id
    WHERE s.id = ?
  `;

  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch analysis' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    const result = {
      ...row,
      fertilizers: row.fertilizers ? JSON.parse(row.fertilizers) : [],
      pesticides: row.pesticides ? JSON.parse(row.pesticides) : [],
      recommended_crops: row.recommended_crops ? JSON.parse(row.recommended_crops) : []
    };

    res.json(result);
  });
});

router.delete('/analysis/:id', (req, res) => {
  const id = req.params.id;

  db.serialize(() => {
    db.run('DELETE FROM recommendations WHERE soil_data_id = ?', [id]);
    db.run('DELETE FROM soil_data WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to delete analysis' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Analysis not found' });
      }

      res.json({ message: 'Analysis deleted successfully' });
    });
  });
});

// UPDATE a soil record
router.put('/analysis/:id', validateSoilData, (req, res) => {
  const id = req.params.id;
  const soilData = req.body;

  const sql = `
    UPDATE soil_data SET
      land_area = ?, location = ?, soil_type = ?, irrigation = ?,
      ph_level = ?, nitrogen = ?, phosphorus = ?, potassium = ?,
      organic_carbon = ?, zinc = ?
    WHERE id = ?
  `;

  const values = [
    soilData.land_area,
    soilData.location,
    soilData.soil_type,
    soilData.irrigation,
    soilData.ph_level,
    soilData.nitrogen,
    soilData.phosphorus,
    soilData.potassium,
    soilData.organic_carbon,
    soilData.zinc,
    id
  ];

  db.run(sql, values, function (err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to update soil data' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Soil record not found' });
    }

    // Recalculate recommendations
    const soilScore = soilAnalyzer.calculateSoilScore(soilData);
    const fertilizers = recommendationEngine.getFertilizerRecommendations(soilData, soilScore);
    const pesticides = recommendationEngine.getPesticideRecommendations(soilData, soilScore);
    const crops = recommendationEngine.getCropRecommendations(soilData, soilScore);

    // Update recommendations
    const recSql = `
      UPDATE recommendations SET
        soil_score = ?, fertilizers = ?, pesticides = ?, recommended_crops = ?
      WHERE soil_data_id = ?
    `;

    db.run(recSql, [
      soilScore,
      JSON.stringify(fertilizers),
      JSON.stringify(pesticides),
      JSON.stringify(crops),
      id
    ], function (recErr) {
      if (recErr) {
        console.error('Recommendations update error:', recErr);
      }
    });

    res.json({
      id: id,
      soil_score: soilScore,
      fertilizers: fertilizers,
      pesticides: pesticides,
      recommended_crops: crops,
      message: 'Soil data updated successfully'
    });
  });
});

module.exports = router;
