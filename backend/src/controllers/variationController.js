const CategoryVariationTemplate = require('../models/CategoryVariationTemplate');
const Category = require('../models/Category');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const { validationResult } = require('express-validator');

// Get variation templates for a specific category
exports.getCategoryVariationTemplates = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Find the category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    // Find the variation template for this category
    const template = await CategoryVariationTemplate.findOne({ categoryId });
    
    if (!template) {
      return res.status(404).json({ msg: 'No variation template found for this category' });
    }
    
    res.json(template);
  } catch (err) {
    console.error('Error getting category variation templates:', err);
    res.status(500).send('Server error');
  }
};

// Create or update a category variation template (admin only)
exports.createUpdateCategoryTemplate = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { categoryId, variationTypes } = req.body;
    
    // Find the category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    // Check if a template already exists for this category
    let template = await CategoryVariationTemplate.findOne({ categoryId });
    
    if (template) {
      // Update existing template
      template.variationTypes = variationTypes;
      await template.save();
    } else {
      // Create new template
      template = new CategoryVariationTemplate({
        categoryId,
        variationTypes
      });
      
      await template.save();
    }
    
    res.json(template);
  } catch (err) {
    console.error('Error creating/updating category template:', err);
    res.status(500).send('Server error');
  }
};

// Delete a category variation template (admin only)
exports.deleteCategoryTemplate = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Find the template
    const template = await CategoryVariationTemplate.findOne({ categoryId });
    
    if (!template) {
      return res.status(404).json({ msg: 'Template not found' });
    }
    
    await template.remove();
    
    res.json({ msg: 'Template removed' });
  } catch (err) {
    console.error('Error deleting category template:', err);
    res.status(500).send('Server error');
  }
};

// Get predefined variation options for common categories
exports.getPredefinedVariationOptions = async (req, res) => {
  try {
    // Predefined options for common categories
    const predefinedOptions = {
      textile: {
        size: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
        color: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Orange', 'Grey', 'Brown', 'Navy'],
        fabric: ['Cotton', 'Polyester', 'Linen', 'Wool', 'Silk', 'Denim', 'Leather', 'Velvet', 'Satin', 'Chiffon', 'Jersey', 'Fleece']
      },
      jewelry: {
        material: ['Gold', 'Silver', 'Rose Gold', 'Platinum', 'Stainless Steel', 'Brass', 'Copper', 'Titanium', 'Tungsten'],
        color: ['Gold', 'Silver', 'Rose Gold', 'Black', 'White', 'Multi-color'],
        size: ['Small', 'Medium', 'Large', 'One Size']
      },
      footwear: {
        size: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
        color: ['Black', 'White', 'Brown', 'Red', 'Blue', 'Green', 'Yellow', 'Grey', 'Multi-color'],
        material: ['Leather', 'Suede', 'Canvas', 'Synthetic', 'Textile', 'Rubber']
      },
      electronics: {
        color: ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Red', 'Green'],
        capacity: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'],
        model: ['Standard', 'Pro', 'Plus', 'Max', 'Ultra', 'Lite']
      },
      homeware: {
        color: ['Black', 'White', 'Grey', 'Brown', 'Beige', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Multi-color'],
        size: ['Small', 'Medium', 'Large', 'Extra Large'],
        material: ['Wood', 'Metal', 'Glass', 'Plastic', 'Ceramic', 'Fabric', 'Leather', 'Stone', 'Marble']
      }
    };
    
    res.json(predefinedOptions);
  } catch (err) {
    console.error('Error getting predefined variation options:', err);
    res.status(500).send('Server error');
  }
};

// Generate product variants based on selected options
exports.generateProductVariants = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { productId, selectedVariations } = req.body;
    
    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Generate all possible combinations of selected variations
    const generateCombinations = (options, current = {}, index = 0, results = []) => {
      if (index === options.length) {
        results.push({ ...current });
        return;
      }
      
      const { name, values } = options[index];
      
      for (const value of values) {
        current[name] = value;
        generateCombinations(options, { ...current }, index + 1, results);
      }
      
      return results;
    };
    
    // Format the selected variations for combination generation
    const formattedOptions = Object.entries(selectedVariations).map(([name, values]) => ({
      name,
      values
    }));
    
    // Generate all combinations
    const combinations = generateCombinations(formattedOptions);
    
    // Create variants for each combination
    const variants = [];
    
    for (const combination of combinations) {
      // Format options for the variant
      const options = Object.entries(combination).map(([name, value]) => ({
        name,
        value
      }));
      
      // Create a variant name based on the combination
      const variantName = Object.values(combination).join(' / ');
      
      // Create the variant
      const variant = new ProductVariant({
        productId: product._id,
        sku: `${product.sku || product._id.toString().substring(0, 8)}-${variantName.replace(/\s+/g, '-')}`,
        price: product.price,
        cost: product.cost,
        inventoryQuantity: 0, // Default to 0, supplier will update
        options,
        weight: product.weight,
        weightUnit: product.weightUnit,
        dimensions: product.dimensions,
        isActive: true
      });
      
      await variant.save();
      variants.push(variant);
    }
    
    // Update the product to indicate it has variants
    product.hasVariants = true;
    await product.save();
    
    res.json(variants);
  } catch (err) {
    console.error('Error generating product variants:', err);
    res.status(500).send('Server error');
  }
};

// Update a product variant
exports.updateProductVariant = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { 
      price, 
      compareAtPrice, 
      cost, 
      inventoryQuantity, 
      inventoryPolicy,
      weight,
      weightUnit,
      dimensions,
      barcode,
      isActive,
      images
    } = req.body;
    
    // Find the variant
    const variant = await ProductVariant.findById(req.params.id);
    
    if (!variant) {
      return res.status(404).json({ msg: 'Variant not found' });
    }
    
    // Update fields
    if (price !== undefined) variant.price = price;
    if (compareAtPrice !== undefined) variant.compareAtPrice = compareAtPrice;
    if (cost !== undefined) variant.cost = cost;
    if (inventoryQuantity !== undefined) variant.inventoryQuantity = inventoryQuantity;
    if (inventoryPolicy !== undefined) variant.inventoryPolicy = inventoryPolicy;
    if (weight !== undefined) variant.weight = weight;
    if (weightUnit !== undefined) variant.weightUnit = weightUnit;
    if (dimensions !== undefined) variant.dimensions = dimensions;
    if (barcode !== undefined) variant.barcode = barcode;
    if (isActive !== undefined) variant.isActive = isActive;
    if (images !== undefined) variant.images = images;
    
    await variant.save();
    
    res.json(variant);
  } catch (err) {
    console.error('Error updating product variant:', err);
    res.status(500).send('Server error');
  }
};

// Bulk update product variants
exports.bulkUpdateProductVariants = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { variants } = req.body;
    
    // Update each variant
    const updatedVariants = [];
    
    for (const variantData of variants) {
      const { id, ...updateData } = variantData;
      
      // Find and update the variant
      const variant = await ProductVariant.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );
      
      if (variant) {
        updatedVariants.push(variant);
      }
    }
    
    res.json(updatedVariants);
  } catch (err) {
    console.error('Error bulk updating product variants:', err);
    res.status(500).send('Server error');
  }
};

// Delete a product variant
exports.deleteProductVariant = async (req, res) => {
  try {
    // Find the variant
    const variant = await ProductVariant.findById(req.params.id);
    
    if (!variant) {
      return res.status(404).json({ msg: 'Variant not found' });
    }
    
    await variant.remove();
    
    // Check if this was the last variant for the product
    const remainingVariants = await ProductVariant.countDocuments({ productId: variant.productId });
    
    if (remainingVariants === 0) {
      // Update the product to indicate it no longer has variants
      await Product.findByIdAndUpdate(variant.productId, { hasVariants: false });
    }
    
    res.json({ msg: 'Variant removed' });
  } catch (err) {
    console.error('Error deleting product variant:', err);
    res.status(500).send('Server error');
  }
};
