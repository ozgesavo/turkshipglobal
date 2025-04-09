const ShippingRate = require('../models/ShippingRate');
const ShippingMethod = require('../models/ShippingMethod');
const Country = require('../models/Country');
const { validationResult } = require('express-validator');

// Get all countries
exports.getCountries = async (req, res) => {
  try {
    const countries = await Country.find().sort({ name: 1 });
    res.json(countries);
  } catch (err) {
    console.error('Error getting countries:', err);
    res.status(500).send('Server error');
  }
};

// Get all shipping methods
exports.getShippingMethods = async (req, res) => {
  try {
    const shippingMethods = await ShippingMethod.find().sort({ name: 1 });
    res.json(shippingMethods);
  } catch (err) {
    console.error('Error getting shipping methods:', err);
    res.status(500).send('Server error');
  }
};

// Get all shipping rates
exports.getShippingRates = async (req, res) => {
  try {
    const shippingRates = await ShippingRate.find();
    res.json(shippingRates);
  } catch (err) {
    console.error('Error getting shipping rates:', err);
    res.status(500).send('Server error');
  }
};

// Get shipping rates by country
exports.getShippingRatesByCountry = async (req, res) => {
  try {
    const { countryId } = req.params;
    
    const shippingRates = await ShippingRate.find({ country: countryId });
    res.json(shippingRates);
  } catch (err) {
    console.error('Error getting shipping rates by country:', err);
    res.status(500).send('Server error');
  }
};

// Calculate shipping cost
exports.calculateShipping = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { country, weight, length, width, height, shippingMethod } = req.body;
    
    // Find the country
    const countryData = await Country.findById(country);
    if (!countryData) {
      return res.status(404).json({ msg: 'Country not found' });
    }
    
    // Find the shipping method
    const shippingMethodData = await ShippingMethod.findById(shippingMethod);
    if (!shippingMethodData) {
      return res.status(404).json({ msg: 'Shipping method not found' });
    }
    
    // Find the shipping rate
    const shippingRate = await ShippingRate.findOne({
      country,
      shippingMethodId: shippingMethod
    });
    
    if (!shippingRate) {
      return res.status(404).json({ msg: 'Shipping rate not found for this country and method' });
    }
    
    // Calculate dimensional weight (length * width * height in cm / 5000)
    const dimensionalWeight = (length * width * height) / 5000;
    
    // Use the greater of actual weight or dimensional weight
    const chargeableWeight = Math.max(parseFloat(weight), dimensionalWeight);
    
    // Calculate base cost
    const baseCost = shippingRate.baseCost;
    
    // Calculate weight cost
    const weightCost = chargeableWeight * shippingRate.costPerKg;
    
    // Calculate dimensional cost (if applicable)
    let dimensionalCost = 0;
    if (dimensionalWeight > parseFloat(weight) && shippingRate.dimensionalFactor) {
      dimensionalCost = (dimensionalWeight - parseFloat(weight)) * shippingRate.dimensionalFactor;
    }
    
    // Calculate additional fees (if applicable)
    let additionalFees = 0;
    if (shippingRate.additionalFees) {
      additionalFees = shippingRate.additionalFees;
    }
    
    // Calculate total cost
    const totalCost = baseCost + weightCost + dimensionalCost + additionalFees;
    
    // Prepare response
    const result = {
      country: countryData,
      shippingMethod: shippingMethodData,
      weight: parseFloat(weight),
      dimensionalWeight,
      chargeableWeight,
      baseCost,
      weightCost,
      dimensionalCost,
      additionalFees,
      totalCost,
      estimatedDeliveryDays: {
        min: shippingRate.minDeliveryDays,
        max: shippingRate.maxDeliveryDays
      },
      notes: shippingRate.notes
    };
    
    res.json(result);
  } catch (err) {
    console.error('Error calculating shipping cost:', err);
    res.status(500).send('Server error');
  }
};

// Add a new country (admin only)
exports.addCountry = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, code, region } = req.body;
    
    // Check if country already exists
    let country = await Country.findOne({ code });
    
    if (country) {
      return res.status(400).json({ msg: 'Country already exists' });
    }
    
    // Create a new country
    country = new Country({
      name,
      code,
      region
    });
    
    await country.save();
    
    res.status(201).json(country);
  } catch (err) {
    console.error('Error adding country:', err);
    res.status(500).send('Server error');
  }
};

// Add a new shipping method (admin only)
exports.addShippingMethod = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { 
      name, 
      carrier, 
      description, 
      trackingAvailable, 
      insuranceAvailable 
    } = req.body;
    
    // Check if shipping method already exists
    let shippingMethod = await ShippingMethod.findOne({ 
      name,
      carrier
    });
    
    if (shippingMethod) {
      return res.status(400).json({ msg: 'Shipping method already exists' });
    }
    
    // Create a new shipping method
    shippingMethod = new ShippingMethod({
      name,
      carrier,
      description,
      trackingAvailable: trackingAvailable || false,
      insuranceAvailable: insuranceAvailable || false
    });
    
    await shippingMethod.save();
    
    res.status(201).json(shippingMethod);
  } catch (err) {
    console.error('Error adding shipping method:', err);
    res.status(500).send('Server error');
  }
};

// Add a new shipping rate (admin only)
exports.addShippingRate = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { 
      country,
      shippingMethodId,
      baseCost,
      costPerKg,
      dimensionalFactor,
      additionalFees,
      minDeliveryDays,
      maxDeliveryDays,
      notes
    } = req.body;
    
    // Check if country exists
    const countryExists = await Country.findById(country);
    if (!countryExists) {
      return res.status(404).json({ msg: 'Country not found' });
    }
    
    // Check if shipping method exists
    const shippingMethodExists = await ShippingMethod.findById(shippingMethodId);
    if (!shippingMethodExists) {
      return res.status(404).json({ msg: 'Shipping method not found' });
    }
    
    // Check if shipping rate already exists
    let shippingRate = await ShippingRate.findOne({
      country,
      shippingMethodId
    });
    
    if (shippingRate) {
      return res.status(400).json({ msg: 'Shipping rate already exists for this country and method' });
    }
    
    // Create a new shipping rate
    shippingRate = new ShippingRate({
      country,
      shippingMethodId,
      baseCost,
      costPerKg,
      dimensionalFactor,
      additionalFees,
      minDeliveryDays,
      maxDeliveryDays,
      notes
    });
    
    await shippingRate.save();
    
    res.status(201).json(shippingRate);
  } catch (err) {
    console.error('Error adding shipping rate:', err);
    res.status(500).send('Server error');
  }
};

// Update a shipping rate (admin only)
exports.updateShippingRate = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { 
      baseCost,
      costPerKg,
      dimensionalFactor,
      additionalFees,
      minDeliveryDays,
      maxDeliveryDays,
      notes
    } = req.body;
    
    // Find the shipping rate
    const shippingRate = await ShippingRate.findById(req.params.id);
    
    if (!shippingRate) {
      return res.status(404).json({ msg: 'Shipping rate not found' });
    }
    
    // Update fields
    if (baseCost !== undefined) shippingRate.baseCost = baseCost;
    if (costPerKg !== undefined) shippingRate.costPerKg = costPerKg;
    if (dimensionalFactor !== undefined) shippingRate.dimensionalFactor = dimensionalFactor;
    if (additionalFees !== undefined) shippingRate.additionalFees = additionalFees;
    if (minDeliveryDays !== undefined) shippingRate.minDeliveryDays = minDeliveryDays;
    if (maxDeliveryDays !== undefined) shippingRate.maxDeliveryDays = maxDeliveryDays;
    if (notes !== undefined) shippingRate.notes = notes;
    
    await shippingRate.save();
    
    res.json(shippingRate);
  } catch (err) {
    console.error('Error updating shipping rate:', err);
    res.status(500).send('Server error');
  }
};

// Delete a shipping rate (admin only)
exports.deleteShippingRate = async (req, res) => {
  try {
    // Find the shipping rate
    const shippingRate = await ShippingRate.findById(req.params.id);
    
    if (!shippingRate) {
      return res.status(404).json({ msg: 'Shipping rate not found' });
    }
    
    await shippingRate.remove();
    
    res.json({ msg: 'Shipping rate removed' });
  } catch (err) {
    console.error('Error deleting shipping rate:', err);
    res.status(500).send('Server error');
  }
};
