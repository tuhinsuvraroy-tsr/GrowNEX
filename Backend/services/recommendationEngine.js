class RecommendationEngine {
  getFertilizerRecommendations(soilData, soilScore) {
    const { nitrogen, phosphorus, potassium, zinc, soil_type, land_area } = soilData;
    const recommendations = [];
    
    const nitrogenRanges = {
      'Sandy': { min: 200, max: 280, ideal: 240 },
      'Clay': { min: 250, max: 350, ideal: 300 },
      'Loamy': { min: 250, max: 300, ideal: 275 },
      'Silty': { min: 220, max: 320, ideal: 270 },
      'Peaty': { min: 180, max: 260, ideal: 220 },
      'Chalky': { min: 200, max: 300, ideal: 250 }
    };
    
    const phosphorusRanges = {
      'Sandy': { min: 30, max: 50, ideal: 40 },
      'Clay': { min: 40, max: 60, ideal: 50 },
      'Loamy': { min: 40, max: 50, ideal: 45 },
      'Silty': { min: 35, max: 55, ideal: 45 },
      'Peaty': { min: 25, max: 45, ideal: 35 },
      'Chalky': { min: 45, max: 65, ideal: 55 }
    };
    
    const potassiumRanges = {
      'Sandy': { min: 250, max: 400, ideal: 325 },
      'Clay': { min: 300, max: 500, ideal: 400 },
      'Loamy': { min: 300, max: 400, ideal: 350 },
      'Silty': { min: 280, max: 450, ideal: 365 },
      'Peaty': { min: 200, max: 350, ideal: 275 },
      'Chalky': { min: 350, max: 550, ideal: 450 }
    };
    
    const nRange = nitrogenRanges[soil_type] || nitrogenRanges['Loamy'];
    const pRange = phosphorusRanges[soil_type] || phosphorusRanges['Loamy'];
    const kRange = potassiumRanges[soil_type] || potassiumRanges['Loamy'];
    
    if (nitrogen < nRange.min) {
      const deficit = nRange.ideal - nitrogen;
      const ureaAmount = Math.round((deficit * 2.17) * land_area);
      recommendations.push({
        name: 'Urea (46-0-0)',
        application: `${ureaAmount} kg/total`,
        frequency: 'Before sowing & 30 days after',
        purpose: 'Nitrogen supplementation',
        priority: 'high'
      });
    }
    
    if (phosphorus < pRange.min) {
      const deficit = pRange.ideal - phosphorus;
      const dapAmount = Math.round((deficit * 4.35) * land_area);
      recommendations.push({
        name: 'DAP (18-46-0)',
        application: `${dapAmount} kg/total`,
        frequency: 'At the time of sowing',
        purpose: 'Phosphorus supplementation',
        priority: 'high'
      });
    }
    
    if (potassium < kRange.min) {
      const deficit = kRange.ideal - potassium;
      const mopAmount = Math.round((deficit * 1.67) * land_area);
      recommendations.push({
        name: 'Muriate of Potash (0-0-60)',
        application: `${mopAmount} kg/total`,
        frequency: 'Before sowing',
        purpose: 'Potassium supplementation',
        priority: 'medium'
      });
    }
    
    if (zinc < 0.6) {
      const zincAmount = Math.round(25 * land_area);
      recommendations.push({
        name: 'Zinc Sulphate',
        application: `${zincAmount} kg/total`,
        frequency: 'Once before sowing',
        purpose: 'Zinc micronutrient',
        priority: 'medium'
      });
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        name: 'Balanced NPK Fertilizer',
        application: `${Math.round(100 * land_area)} kg/total`,
        frequency: 'Maintenance application',
        purpose: 'General soil health',
        priority: 'low'
      });
    }
    
    return recommendations;
  }
  
  getPesticideRecommendations(soilData, soilScore) {
    const { soil_type, location, ph_level } = soilData;
    const recommendations = [];
    
    if (ph_level > 7.5) {
      recommendations.push({
        name: 'Chlorpyrifos 20% EC',
        application: '2 ml/liter water',
        purpose: 'Termite & root borer control (alkaline soil)',
        priority: 'high'
      });
    }
    
    if (soil_type === 'Clay' || soil_type === 'Silty') {
      recommendations.push({
        name: 'Mancozeb 75% WP',
        application: '2.5 gm/liter water',
        purpose: 'Fungal disease prevention (heavy soils)',
        priority: 'medium'
      });
    }
    
    recommendations.push({
      name: 'Imidacloprid 17.8% SL',
      application: '0.5 ml/liter water',
      purpose: 'Sucking pest control',
      priority: 'medium'
    });
    
    if (soilScore < 6) {
      recommendations.push({
        name: 'Carbendazim 50% WP',
        application: '1 gm/liter water',
        purpose: 'Soil-borne disease prevention (low soil health)',
        priority: 'high'
      });
    }
    
    return recommendations;
  }
  
  getCropRecommendations(soilData, soilScore) {
    const { soil_type, ph_level, nitrogen, phosphorus, potassium, irrigation } = soilData;
    const crops = [];
    
    const cropDatabase = [
      {
        name: 'Wheat',
        suitableSoils: ['Loamy', 'Clay', 'Silty'],
        phRange: [6.0, 7.5],
        nRequirement: 'medium',
        pRequirement: 'medium',
        kRequirement: 'medium',
        irrigation: ['Drip', 'Sprinkler', 'Flood'],
        timing: 'Oct-Nov | Mar-Apr',
        yield: '18-22 quintals/acre',
        priority: 'high'
      },
      {
        name: 'Maize',
        suitableSoils: ['Loamy', 'Sandy', 'Silty'],
        phRange: [5.5, 7.5],
        nRequirement: 'high',
        pRequirement: 'medium',
        kRequirement: 'high',
        irrigation: ['Drip', 'Sprinkler'],
        timing: 'Jun-Jul | Sep-Oct',
        yield: '25-30 quintals/acre',
        priority: 'medium'
      },
      {
        name: 'Potato',
        suitableSoils: ['Loamy', 'Sandy', 'Silty'],
        phRange: [5.0, 6.5],
        nRequirement: 'medium',
        pRequirement: 'high',
        kRequirement: 'high',
        irrigation: ['Drip', 'Sprinkler'],
        timing: 'Oct-Nov | Feb-Mar',
        yield: '80-100 quintals/acre',
        priority: 'high'
      },
      {
        name: 'Mustard',
        suitableSoils: ['Loamy', 'Clay', 'Silty'],
        phRange: [6.0, 7.5],
        nRequirement: 'medium',
        pRequirement: 'medium',
        kRequirement: 'medium',
        irrigation: ['Drip', 'Sprinkler', 'Flood'],
        timing: 'Oct-Nov | Feb-Mar',
        yield: '6-8 quintals/acre',
        priority: 'medium'
      },
      {
        name: 'Rice',
        suitableSoils: ['Clay', 'Silty'],
        phRange: [5.5, 7.0],
        nRequirement: 'high',
        pRequirement: 'medium',
        kRequirement: 'medium',
        irrigation: ['Flood'],
        timing: 'Jun-Jul | Oct-Nov',
        yield: '25-30 quintals/acre',
        priority: 'low'
      },
      {
        name: 'Cotton',
        suitableSoils: ['Sandy', 'Loamy'],
        phRange: [6.0, 8.0],
        nRequirement: 'medium',
        pRequirement: 'medium',
        kRequirement: 'high',
        irrigation: ['Drip', 'Sprinkler'],
        timing: 'Apr-May | Oct-Nov',
        yield: '8-12 quintals/acre',
        priority: 'medium'
      }
    ];
    
    const nutrientLevel = (n, p, k) => {
      const nLevel = n > 250 ? 'high' : n > 150 ? 'medium' : 'low';
      const pLevel = p > 45 ? 'high' : p > 25 ? 'medium' : 'low';
      const kLevel = k > 350 ? 'high' : k > 200 ? 'medium' : 'low';
      return { n: nLevel, p: pLevel, k: kLevel };
    };
    
    const levels = nutrientLevel(nitrogen, phosphorus, potassium);
    
    cropDatabase.forEach(crop => {
      let score = 0;
      
      if (crop.suitableSoils.includes(soil_type)) score += 3;
      if (ph_level >= crop.phRange[0] && ph_level <= crop.phRange[1]) score += 2;
      if (crop.nRequirement === levels.n) score += 1;
      if (crop.pRequirement === levels.p) score += 1;
      if (crop.kRequirement === levels.k) score += 1;
      if (crop.irrigation.includes(irrigation)) score += 2;
      
      if (score >= 5) {
        crops.push({
          name: crop.name,
          timing: crop.timing,
          yield: crop.yield,
          suitability: score >= 7 ? 'Highly Recommended' : 'Suitable',
          score: score,
          priority: crop.priority
        });
      }
    });
    
    return crops.sort((a, b) => b.score - a.score).slice(0, 4);
  }
}

module.exports = new RecommendationEngine();
