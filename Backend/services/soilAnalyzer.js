class SoilAnalyzer {
  calculateSoilScore(soilData) {
    const { ph_level, nitrogen, phosphorus, potassium, organic_carbon, zinc, soil_type } = soilData;
    
    let score = 0;
    let maxScore = 0;
    
    const phScore = this.calculatePhScore(ph_level);
    const nitrogenScore = this.calculateNitrogenScore(nitrogen, soil_type);
    const phosphorusScore = this.calculatePhosphorusScore(phosphorus, soil_type);
    const potassiumScore = this.calculatePotassiumScore(potassium, soil_type);
    const carbonScore = this.calculateOrganicCarbonScore(organic_carbon);
    const zincScore = this.calculateZincScore(zinc);
    
    score = phScore + nitrogenScore + phosphorusScore + potassiumScore + carbonScore + zincScore;
    maxScore = 6 * 10;
    
    return Math.round((score / maxScore) * 10 * 10) / 10;
  }
  
  calculatePhScore(ph) {
    if (ph >= 6.0 && ph <= 7.5) return 10;
    if (ph >= 5.5 && ph <= 8.0) return 8;
    if (ph >= 5.0 && ph <= 8.5) return 6;
    if (ph >= 4.5 && ph <= 9.0) return 4;
    return 2;
  }
  
  calculateNitrogenScore(nitrogen, soilType) {
    const ranges = {
      'Sandy': { min: 200, max: 280, ideal: 240 },
      'Clay': { min: 250, max: 350, ideal: 300 },
      'Loamy': { min: 250, max: 300, ideal: 275 },
      'Silty': { min: 220, max: 320, ideal: 270 },
      'Peaty': { min: 180, max: 260, ideal: 220 },
      'Chalky': { min: 200, max: 300, ideal: 250 }
    };
    
    const range = ranges[soilType] || ranges['Loamy'];
    return this.calculateNutrientScore(nitrogen, range);
  }
  
  calculatePhosphorusScore(phosphorus, soilType) {
    const ranges = {
      'Sandy': { min: 30, max: 50, ideal: 40 },
      'Clay': { min: 40, max: 60, ideal: 50 },
      'Loamy': { min: 40, max: 50, ideal: 45 },
      'Silty': { min: 35, max: 55, ideal: 45 },
      'Peaty': { min: 25, max: 45, ideal: 35 },
      'Chalky': { min: 45, max: 65, ideal: 55 }
    };
    
    const range = ranges[soilType] || ranges['Loamy'];
    return this.calculateNutrientScore(phosphorus, range);
  }
  
  calculatePotassiumScore(potassium, soilType) {
    const ranges = {
      'Sandy': { min: 250, max: 400, ideal: 325 },
      'Clay': { min: 300, max: 500, ideal: 400 },
      'Loamy': { min: 300, max: 400, ideal: 350 },
      'Silty': { min: 280, max: 450, ideal: 365 },
      'Peaty': { min: 200, max: 350, ideal: 275 },
      'Chalky': { min: 350, max: 550, ideal: 450 }
    };
    
    const range = ranges[soilType] || ranges['Loamy'];
    return this.calculateNutrientScore(potassium, range);
  }
  
  calculateOrganicCarbonScore(carbon) {
    if (carbon >= 0.75 && carbon <= 2.0) return 10;
    if (carbon >= 0.5 && carbon <= 3.0) return 8;
    if (carbon >= 0.3 && carbon <= 4.0) return 6;
    if (carbon >= 0.2 && carbon <= 5.0) return 4;
    return 2;
  }
  
  calculateZincScore(zinc) {
    if (zinc >= 0.6 && zinc <= 2.0) return 10;
    if (zinc >= 0.4 && zinc <= 3.0) return 8;
    if (zinc >= 0.3 && zinc <= 4.0) return 6;
    if (zinc >= 0.2 && zinc <= 5.0) return 4;
    return 2;
  }
  
  calculateNutrientScore(value, range) {
    const { min, max, ideal } = range;
    
    if (value >= min && value <= max) {
      const deviation = Math.abs(value - ideal);
      const maxDeviation = Math.max(ideal - min, max - ideal);
      const score = 10 - (deviation / maxDeviation) * 4;
      return Math.round(score * 10) / 10;
    }
    
    if (value < min) {
      const deficit = min - value;
      const maxDeficit = min;
      const score = Math.max(2, 6 - (deficit / maxDeficit) * 4);
      return Math.round(score * 10) / 10;
    }
    
    if (value > max) {
      const excess = value - max;
      const maxExcess = max;
      const score = Math.max(2, 6 - (excess / maxExcess) * 4);
      return Math.round(score * 10) / 10;
    }
    
    return 2;
  }
}

module.exports = new SoilAnalyzer();
