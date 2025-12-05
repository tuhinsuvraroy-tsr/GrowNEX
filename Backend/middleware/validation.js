const Joi = require('joi');

const soilDataSchema = Joi.object({
  land_area: Joi.number().positive().required().messages({
    'number.base': 'Land area must be a number',
    'number.positive': 'Land area must be positive',
    'any.required': 'Land area is required'
  }),
  location: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Location must be a string',
    'string.min': 'Location must be at least 3 characters',
    'string.max': 'Location must not exceed 100 characters',
    'any.required': 'Location is required'
  }),
  soil_type: Joi.string().valid('Sandy', 'Clay', 'Loamy', 'Silty', 'Peaty', 'Chalky').required().messages({
    'any.only': 'Soil type must be one of: Sandy, Clay, Loamy, Silty, Peaty, Chalky',
    'any.required': 'Soil type is required'
  }),
  irrigation: Joi.string().valid('Drip', 'Sprinkler', 'Flood', 'Center Pivot', 'Manual').required().messages({
    'any.only': 'Irrigation must be one of: Drip, Sprinkler, Flood, Center Pivot, Manual',
    'any.required': 'Irrigation is required'
  }),
  ph_level: Joi.number().min(0).max(14).required().messages({
    'number.base': 'pH level must be a number',
    'number.min': 'pH level must be between 0 and 14',
    'number.max': 'pH level must be between 0 and 14',
    'any.required': 'pH level is required'
  }),
  nitrogen: Joi.number().min(0).required().messages({
    'number.base': 'Nitrogen must be a number',
    'number.min': 'Nitrogen must be positive',
    'any.required': 'Nitrogen is required'
  }),
  phosphorus: Joi.number().min(0).required().messages({
    'number.base': 'Phosphorus must be a number',
    'number.min': 'Phosphorus must be positive',
    'any.required': 'Phosphorus is required'
  }),
  potassium: Joi.number().min(0).required().messages({
    'number.base': 'Potassium must be a number',
    'number.min': 'Potassium must be positive',
    'any.required': 'Potassium is required'
  }),
  organic_carbon: Joi.number().min(0).max(100).required().messages({
    'number.base': 'Organic carbon must be a number',
    'number.min': 'Organic carbon must be positive',
    'number.max': 'Organic carbon must not exceed 100%',
    'any.required': 'Organic carbon is required'
  }),
  zinc: Joi.number().min(0).required().messages({
    'number.base': 'Zinc must be a number',
    'number.min': 'Zinc must be positive',
    'any.required': 'Zinc is required'
  })
});

const validateSoilData = (req, res, next) => {
  const { error } = soilDataSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }
  next();
};

module.exports = { validateSoilData };
