const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.post('/supplier', async (req, res) => {
  try {
    const { name } = req.body;
    const supplier = await prisma.supplier.create({
      data: {
        name,
      },
    });
    res.status(201).json({ message: 'Supplier added successfully', supplier });
  } catch (error) {
    console.error('Error adding supplier:', error);
    res.status(500).json({ error: 'Failed to add supplier', details: error.message });
  }
});

app.post('/product', async (req, res) => {
  try {
    const { name, purchasePrice, sellPrice, quantity, supplierId } = req.body;

    const supplier = await prisma.supplier.findFirst({
      where: {
        id: supplierId,
      },
    });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier ID not found' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        purchasePrice,
        sellPrice,
        quantity,
        supplierId,
      },
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

app.put('/adjust-product', async (req, res) => {
  try {
    const { id, quantity } = req.body;

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existingQuantity = product.quantity;
    const newQuantity = existingQuantity + quantity;

    if (newQuantity < 0) {
      return res.status(400).json({ message: 'Quantity cannot be negative', product });
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        quantity: newQuantity,
      },
    });

    res.status(200).json({
      message: `Product quantity ${quantity < 0 ? 'decreased' : 'increased'} successfully`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error adjusting product:', error);
    res.status(500).json({ error: 'Failed to adjust product', details: error.message });
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
