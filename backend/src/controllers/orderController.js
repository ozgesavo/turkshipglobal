const Order = require('../models/Order');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const Supplier = require('../models/Supplier');
const Dropshipper = require('../models/Dropshipper');
const SourcingAgent = require('../models/SourcingAgent');
const ShippingRate = require('../models/ShippingRate');
const { validationResult } = require('express-validator');
const axios = require('axios');
const nodemailer = require('nodemailer');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      dropshipperId,
      supplierId,
      shopifyOrderId,
      customerName,
      customerEmail,
      shippingAddress,
      items,
      subtotal,
      shippingCost,
      tax,
      total,
      currency,
      notes
    } = req.body;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Calculate commission and payout amount
    let commission = 0;
    let sourcingAgentCommission = 0;
    let sourcingAgentId = null;

    // Process each item to verify product and calculate commissions
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ msg: `Product not found: ${item.productId}` });
      }

      // Check if product is from a sourcing agent
      if (product.sourcingAgentId) {
        sourcingAgentId = product.sourcingAgentId;
        const sourcingAgent = await SourcingAgent.findById(sourcingAgentId);
        if (sourcingAgent) {
          sourcingAgentCommission += (item.price * item.quantity) * (sourcingAgent.commissionRate / 100);
        }
      }

      // Calculate platform commission
      commission += (item.price * item.quantity) * (product.commissionRate / 100);
    }

    // Calculate payout amount (total - commission - sourcingAgentCommission)
    const payoutAmount = total - commission - sourcingAgentCommission;

    // Create new order
    const order = new Order({
      orderNumber,
      dropshipperId,
      supplierId,
      shopifyOrderId,
      customerName,
      customerEmail,
      shippingAddress,
      items,
      subtotal,
      shippingCost,
      tax,
      total,
      commission,
      payoutAmount,
      currency: currency || 'TRY',
      notes,
      status: 'pending',
      paymentStatus: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          note: 'Order created'
        }
      ]
    });

    await order.save();

    // Send notifications
    await sendOrderNotifications(order);

    // Update product stock
    await updateProductStock(items);

    res.status(201).json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).send('Server error');
  }
};

// Get all orders for a supplier
exports.getSupplierOrders = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user.id });
    if (!supplier) {
      return res.status(404).json({ msg: 'Supplier not found' });
    }

    const orders = await Order.find({ supplierId: supplier._id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error('Error getting supplier orders:', err);
    res.status(500).send('Server error');
  }
};

// Get all orders for a dropshipper
exports.getDropshipperOrders = async (req, res) => {
  try {
    const dropshipper = await Dropshipper.findOne({ userId: req.user.id });
    if (!dropshipper) {
      return res.status(404).json({ msg: 'Dropshipper not found' });
    }

    const orders = await Order.find({ dropshipperId: dropshipper._id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error('Error getting dropshipper orders:', err);
    res.status(500).send('Server error');
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if user has permission to view this order
    if (req.user.userType === 'supplier') {
      const supplier = await Supplier.findOne({ userId: req.user.id });
      if (!supplier || order.supplierId.toString() !== supplier._id.toString()) {
        return res.status(403).json({ msg: 'Not authorized to view this order' });
      }
    } else if (req.user.userType === 'dropshipper') {
      const dropshipper = await Dropshipper.findOne({ userId: req.user.id });
      if (!dropshipper || order.dropshipperId.toString() !== dropshipper._id.toString()) {
        return res.status(403).json({ msg: 'Not authorized to view this order' });
      }
    } else if (req.user.userType !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    console.error('Error getting order:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    let order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if user has permission to update this order
    if (req.user.userType === 'supplier') {
      const supplier = await Supplier.findOne({ userId: req.user.id });
      if (!supplier || order.supplierId.toString() !== supplier._id.toString()) {
        return res.status(403).json({ msg: 'Not authorized to update this order' });
      }
    } else if (req.user.userType !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Update order status
    order.status = status;
    
    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`
    });

    await order.save();

    // Send status update notification
    await sendStatusUpdateNotification(order);

    res.json(order);
  } catch (err) {
    console.error('Error updating order status:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
};

// Update shipping information
exports.updateShippingInfo = async (req, res) => {
  try {
    const { trackingNumber, trackingUrl, shippingMethod } = req.body;
    
    let order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if user has permission to update this order
    if (req.user.userType === 'supplier') {
      const supplier = await Supplier.findOne({ userId: req.user.id });
      if (!supplier || order.supplierId.toString() !== supplier._id.toString()) {
        return res.status(403).json({ msg: 'Not authorized to update this order' });
      }
    } else if (req.user.userType !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Update shipping information
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (trackingUrl) order.trackingUrl = trackingUrl;
    if (shippingMethod) order.shippingMethod = shippingMethod;
    
    // If tracking info is added, update status to shipped if it's not already delivered or cancelled
    if (trackingNumber && ['pending', 'processing'].includes(order.status)) {
      order.status = 'shipped';
      order.statusHistory.push({
        status: 'shipped',
        timestamp: new Date(),
        note: 'Tracking information added'
      });
    }

    await order.save();

    // Send shipping update notification
    await sendShippingUpdateNotification(order);

    res.json(order);
  } catch (err) {
    console.error('Error updating shipping info:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
};

// Process Shopify webhook for new orders
exports.processShopifyWebhook = async (req, res) => {
  try {
    // Verify Shopify webhook signature (implementation depends on Shopify API version)
    // This is a simplified version, in production you would verify the HMAC signature
    
    const shopifyOrder = req.body;
    
    // Find dropshipper by Shopify store ID
    const dropshipper = await Dropshipper.findOne({ 
      shopifyStoreId: shopifyOrder.shop_domain 
    });
    
    if (!dropshipper) {
      return res.status(404).json({ msg: 'Dropshipper not found' });
    }
    
    // Process line items and map to our products
    const items = [];
    let subtotal = 0;
    let supplierId = null;
    
    for (const lineItem of shopifyOrder.line_items) {
      // Find product by Shopify product ID (stored in metadata)
      const product = await Product.findOne({ 
        'metadata.shopifyProductId': lineItem.product_id 
      });
      
      if (!product) {
        console.error(`Product not found for Shopify product ID: ${lineItem.product_id}`);
        continue;
      }
      
      // Set supplier ID if not already set
      if (!supplierId && product.supplierId) {
        supplierId = product.supplierId;
      }
      
      // Find variant if applicable
      let variant = null;
      if (lineItem.variant_id) {
        variant = await ProductVariant.findOne({
          'metadata.shopifyVariantId': lineItem.variant_id
        });
      }
      
      const itemPrice = parseFloat(lineItem.price);
      const itemTotal = itemPrice * lineItem.quantity;
      subtotal += itemTotal;
      
      items.push({
        productId: product._id,
        variantId: variant ? variant._id : null,
        shopifyProductId: lineItem.product_id.toString(),
        shopifyVariantId: lineItem.variant_id ? lineItem.variant_id.toString() : null,
        name: lineItem.title,
        sku: lineItem.sku || product.sku,
        quantity: lineItem.quantity,
        price: itemPrice,
        totalPrice: itemTotal
      });
    }
    
    // If no valid products found or no supplier identified
    if (items.length === 0 || !supplierId) {
      return res.status(400).json({ msg: 'No valid products found in order' });
    }
    
    // Calculate shipping cost, tax, and total
    const shippingCost = parseFloat(shopifyOrder.shipping_lines[0]?.price || 0);
    const tax = parseFloat(shopifyOrder.total_tax || 0);
    const total = subtotal + shippingCost + tax;
    
    // Create shipping address object
    const shippingAddress = {
      name: `${shopifyOrder.shipping_address.first_name} ${shopifyOrder.shipping_address.last_name}`,
      address1: shopifyOrder.shipping_address.address1,
      address2: shopifyOrder.shipping_address.address2 || '',
      city: shopifyOrder.shipping_address.city,
      state: shopifyOrder.shipping_address.province,
      zip: shopifyOrder.shipping_address.zip,
      country: shopifyOrder.shipping_address.country,
      phone: shopifyOrder.shipping_address.phone
    };
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Calculate commission and payout amount
    let commission = 0;
    let sourcingAgentCommission = 0;
    let sourcingAgentId = null;

    // Process each item to calculate commissions
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        // Check if product is from a sourcing agent
        if (product.sourcingAgentId) {
          sourcingAgentId = product.sourcingAgentId;
          const sourcingAgent = await SourcingAgent.findById(sourcingAgentId);
          if (sourcingAgent) {
            sourcingAgentCommission += (item.price * item.quantity) * (sourcingAgent.commissionRate / 100);
          }
        }

        // Calculate platform commission
        commission += (item.price * item.quantity) * (product.commissionRate / 100);
      }
    }

    // Calculate payout amount (total - commission - sourcingAgentCommission)
    const payoutAmount = total - commission - sourcingAgentCommission;
    
    // Create new order
    const order = new Order({
      orderNumber,
      dropshipperId: dropshipper._id,
      supplierId,
      shopifyOrderId: shopifyOrder.id.toString(),
      customerName: `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`,
      customerEmail: shopifyOrder.customer.email,
      shippingAddress,
      items,
      subtotal,
      shippingCost,
      tax,
      total,
      commission,
      payoutAmount,
      currency: shopifyOrder.currency,
      notes: shopifyOrder.note,
      status: 'pending',
      paymentStatus: shopifyOrder.financial_status === 'paid' ? 'paid' : 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          note: 'Order created from Shopify'
        }
      ]
    });
    
    await order.save();
    
    // Send notifications
    await sendOrderNotifications(order);
    
    // Update product stock
    await updateProductStock(items);
    
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error processing Shopify webhook:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper function to send order notifications
const sendOrderNotifications = async (order) => {
  try {
    // Email notifications
    const transporter = nodemailer.createTransport({
      // Configure email transport (implementation depends on your email provider)
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Notify supplier
    const supplier = await Supplier.findById(order.supplierId).populate('userId');
    if (supplier && supplier.userId.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: supplier.userId.email,
        subject: `New Order #${order.orderNumber}`,
        html: `
          <h1>New Order Received</h1>
          <p>You have received a new order #${order.orderNumber}.</p>
          <p>Please log in to your dashboard to view the details and process the order.</p>
        `
      });
    }
    
    // Notify dropshipper
    const dropshipper = await Dropshipper.findById(order.dropshipperId).populate('userId');
    if (dropshipper && dropshipper.userId.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: dropshipper.userId.email,
        subject: `Order Confirmation #${order.orderNumber}`,
        html: `
          <h1>Order Confirmation</h1>
          <p>Your order #${order.orderNumber} has been received and is being processed.</p>
          <p>You can track the status of your order in your dashboard.</p>
        `
      });
    }
    
    // Notify customer (if email is available)
    if (order.customerEmail) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: order.customerEmail,
        subject: `Order Confirmation #${order.orderNumber}`,
        html: `
          <h1>Thank You for Your Order</h1>
          <p>Your order #${order.orderNumber} has been received and is being processed.</p>
          <p>We will notify you when your order ships.</p>
        `
      });
    }
    
    // In-app notifications would be implemented here
    
  } catch (err) {
    console.error('Error sending order notifications:', err);
  }
};

// Helper function to send status update notification
const sendStatusUpdateNotification = async (order) => {
  try {
    // Email notifications
    const transporter = nodemailer.createTransport({
      // Configure email transport
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Notify dropshipper
    const dropshipper = await Dropshipper.findById(order.dropshipperId).populate('userId');
    if (dropshipper && dropshipper.userId.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: dropshipper.userId.email,
        subject: `Order Status Update #${order.orderNumber}`,
        html: `
          <h1>Order Status Update</h1>
          <p>The status of order #${order.orderNumber} has been updated to: ${order.status}</p>
          <p>You can view the details in your dashboard.</p>
        `
      });
    }
    
    // Notify customer (if email is available and status is relevant)
    if (order.customerEmail && ['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      let subject, message;
      
      if (order.status === 'shipped') {
        subject = `Your Order #${order.orderNumber} Has Shipped`;
        message = `
          <h1>Your Order Has Shipped</h1>
          <p>Good news! Your order #${order.orderNumber} has been shipped.</p>
          ${order.trackingNumber ? `<p>Tracking Number: ${order.trackingNumber}</p>` : ''}
          ${order.trackingUrl ? `<p>Track your package: <a href="${order.trackingUrl}">Click here</a></p>` : ''}
        `;
      } else if (order.status === 'delivered') {
        subject = `Your Order #${order.orderNumber} Has Been Delivered`;
        message = `
          <h1>Your Order Has Been Delivered</h1>
          <p>Your order #${order.orderNumber} has been marked as delivered.</p>
          <p>We hope you enjoy your purchase!</p>
        `;
      } else if (order.status === 'cancelled') {
        subject = `Your Order #${order.orderNumber} Has Been Cancelled`;
        message = `
          <h1>Your Order Has Been Cancelled</h1>
          <p>We're sorry, but your order #${order.orderNumber} has been cancelled.</p>
          <p>Please contact customer support if you have any questions.</p>
        `;
      }
      
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: order.customerEmail,
        subject,
        html: message
      });
    }
    
    // In-app notifications would be implemented here
    
  } catch (err) {
    console.error('Error sending status update notification:', err);
  }
};

// Helper function to send shipping update notification
const sendShippingUpdateNotification = async (order) => {
  try {
    // Only send if tracking information is available
    if (!order.trackingNumber) return;
    
    // Email notifications
    const transporter = nodemailer.createTransport({
      // Configure email transport
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Notify dropshipper
    const dropshipper = await Dropshipper.findById(order.dropshipperId).populate('userId');
    if (dropshipper && dropshipper.userId.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: dropshipper.userId.email,
        subject: `Shipping Update for Order #${order.orderNumber}`,
        html: `
          <h1>Shipping Update</h1>
          <p>Tracking information has been added for order #${order.orderNumber}.</p>
          <p>Tracking Number: ${order.trackingNumber}</p>
          ${order.trackingUrl ? `<p>Track the shipment: <a href="${order.trackingUrl}">Click here</a></p>` : ''}
        `
      });
    }
    
    // Notify customer
    if (order.customerEmail) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: order.customerEmail,
        subject: `Your Order #${order.orderNumber} Has Shipped`,
        html: `
          <h1>Your Order Has Shipped</h1>
          <p>Good news! Your order #${order.orderNumber} has been shipped.</p>
          <p>Tracking Number: ${order.trackingNumber}</p>
          ${order.trackingUrl ? `<p>Track your package: <a href="${order.trackingUrl}">Click here</a></p>` : ''}
          <p>Estimated delivery: ${getEstimatedDelivery(order)}</p>
        `
      });
    }
    
    // In-app notifications would be implemented here
    
  } catch (err) {
    console.error('Error sending shipping update notification:', err);
  }
};

// Helper function to update product stock
const updateProductStock = async (items) => {
  try {
    for (const item of items) {
      // Update product stock
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
      
      // Update variant stock if applicable
      if (item.variantId) {
        await ProductVariant.findByIdAndUpdate(
          item.variantId,
          { $inc: { stock: -item.quantity } }
        );
      }
    }
  } catch (err) {
    console.error('Error updating product stock:', err);
  }
};

// Helper function to get estimated delivery date
const getEstimatedDelivery = (order) => {
  try {
    // Default to 7-14 days if we don't have specific information
    const minDays = 7;
    const maxDays = 14;
    
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minDays);
    
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);
    
    // Format dates
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return `${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
  } catch (err) {
    console.error('Error calculating estimated delivery:', err);
    return 'Estimated delivery information not available';
  }
};
