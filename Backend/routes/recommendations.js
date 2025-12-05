const express = require('express');
const router = express.Router();
const soilAnalyzer = require('../services/soilAnalyzer');
const recommendationEngine = require('../services/recommendationEngine');

router.post('/quick', (req, res) => {
  try {
    const soilData = req.body;
    
    const soilScore = soilAnalyzer.calculateSoilScore(soilData);
    const fertilizers = recommendationEngine.getFertilizerRecommendations(soilData, soilScore);
    const pesticides = recommendationEngine.getPesticideRecommendations(soilData, soilScore);
    const crops = recommendationEngine.getCropRecommendations(soilData, soilScore);
    
    res.json({
      soil_score: soilScore,
      fertilizers: fertilizers,
      pesticides: pesticides,
      recommended_crops: crops,
      message: 'Quick recommendations generated successfully'
    });
  } catch (error) {
    console.error('Quick recommendation error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

router.get('/fertilizers/:soilType', (req, res) => {
  const { soilType } = req.params;
  
  const mockData = {
    'Sandy': {
      nitrogen: { ideal: 240, current: 180, unit: 'kg/ha' },
      phosphorus: { ideal: 40, current: 25, unit: 'kg/ha' },
      potassium: { ideal: 325, current: 200, unit: 'kg/ha' }
    },
    'Clay': {
      nitrogen: { ideal: 300, current: 220, unit: 'kg/ha' },
      phosphorus: { ideal: 50, current: 35, unit: 'kg/ha' },
      potassium: { ideal: 400, current: 280, unit: 'kg/ha' }
    },
    'Loamy': {
      nitrogen: { ideal: 275, current: 195, unit: 'kg/ha' },
      phosphorus: { ideal: 45, current: 41, unit: 'kg/ha' },
      potassium: { ideal: 350, current: 352, unit: 'kg/ha' }
    }
  };
  
  const data = mockData[soilType] || mockData['Loamy'];
  res.json(data);
});

router.get('/crops/:soilType', (req, res) => {
  const { soilType } = req.params;
  
  const cropDatabase = {
    'Sandy': ['Maize', 'Potato', 'Cotton', 'Groundnut'],
    'Clay': ['Wheat', 'Rice', 'Mustard', 'Sugarcane'],
    'Loamy': ['Wheat', 'Maize', 'Potato', 'Mustard', 'Cotton'],
    'Silty': ['Wheat', 'Maize', 'Rice', 'Mustard'],
    'Peaty': ['Potato', 'Mustard', 'Vegetables'],
    'Chalky': ['Maize', 'Cotton', 'Sugarcane', 'Groundnut']
  };
  
  const crops = cropDatabase[soilType] || cropDatabase['Loamy'];
  
  const cropDetails = crops.map(crop => ({
    name: crop,
    suitability: 'Suitable',
    reason: `Well adapted to ${soilType} soil conditions`
  }));
  
  res.json(cropDetails);
});

router.get('/soil-types', (req, res) => {
  const soilTypes = [
    { value: 'Sandy', description: 'Light, well-draining soil with low nutrient retention' },
    { value: 'Clay', description: 'Heavy soil with high water and nutrient retention' },
    { value: 'Loamy', description: 'Balanced soil with good drainage and fertility' },
    { value: 'Silty', description: 'Medium-textured soil with good water retention' },
    { value: 'Peaty', description: 'Organic-rich soil with high moisture content' },
    { value: 'Chalky', description: 'Alkaline soil with good drainage but low nutrient availability' }
  ];
  
  res.json(soilTypes);
});

router.get('/irrigation-types', (req, res) => {
  const irrigationTypes = [
    { value: 'Drip', description: 'Water-efficient system delivering directly to plant roots' },
    { value: 'Sprinkler', description: 'Overhead irrigation system covering large areas' },
    { value: 'Flood', description: 'Traditional surface irrigation method' },
    { value: 'Center Pivot', description: 'Mechanized sprinkler system for large fields' },
    { value: 'Manual', description: 'Hand watering or portable irrigation' }
  ];
  
  res.json(irrigationTypes);
});

module.exports = router;
