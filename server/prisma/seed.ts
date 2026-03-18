import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed started...');

  // 1. Clean up existing data (just in case)
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Categories
  const electronics = await prisma.category.create({ data: { name: 'Electronics' } });
  const fashion = await prisma.category.create({ data: { name: 'Fashion' } });
  const home = await prisma.category.create({ data: { name: 'Home & Garden' } });
  const sports = await prisma.category.create({ data: { name: 'Sports' } });

  // 3. Create Users
  const hashedPassword = await bcrypt.hash('123456', 10);
  await prisma.user.create({
    data: {
      username: 'killua',
      email: 'admin@nestmart.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  const hashedUserPassword = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      username: 'gon',
      email: 'user@nestmart.com',
      password: hashedUserPassword,
      role: 'user',
    },
  });

  // 4. Create Products
  const products = [
    // Electronics
    {
      name: 'Vision Pro Max X1',
      description: 'The ultimate spatial computing experience with immersive 8K displays and high-fidelity audio.',
      price: 3499.99,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=800',
      categoryId: electronics.id,
    },
    {
      name: 'CyberWatch Ultra 3',
      description: 'The most rugged and capable CyberWatch ever, designed for the extremes of exploration and endurance.',
      price: 799.00,
      stock: 120,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      categoryId: electronics.id,
    },
    {
      name: 'SonicWave Earbuds',
      description: 'Next-generation noise cancellation with spatial audio and 40-hour battery life.',
      price: 199.99,
      stock: 200,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800',
      categoryId: electronics.id,
    },
    {
      name: 'PixelTab Pro 12',
      description: 'Ultra-thin professional tablet with a breathtaking OLED display and powerful M3-equivalent chip.',
      price: 899.00,
      stock: 45,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800',
      categoryId: electronics.id,
    },

    // Fashion
    {
      name: 'Midnight Silk Bomber',
      description: 'Luxurious heavy-duty silk bomber with custom embroidery and diamond-quilted lining.',
      price: 245.50,
      stock: 35,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800',
      categoryId: fashion.id,
    },
    {
      name: 'Urban Tech Cargoes',
      description: 'Water-resistant tactical pants with 10 pockets and adjustable fit system.',
      price: 129.00,
      stock: 60,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800',
      categoryId: fashion.id,
    },
    {
      name: 'Classic Leather Boots',
      description: 'Handcrafted full-grain leather boots that age beautifully over time.',
      price: 185.00,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1520639889313-7272a74b1c73?auto=format&fit=crop&q=80&w=800',
      categoryId: fashion.id,
    },

    // Home & Garden
    {
      name: 'Lumina Smart Lamp',
      description: 'Voice-controlled ambient lighting system with millions of colors and dynamic scene sync.',
      price: 159.99,
      stock: 85,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
      categoryId: home.id,
    },
    {
      name: 'Minimalist Oak Desk',
      description: 'Solid European oak desk with integrated cable management and hidden drawer.',
      price: 499.00,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800',
      categoryId: home.id,
    },
    {
      name: 'HydraBloom Vase',
      description: 'Self-watering aesthetic ceramic vase designed to keep flowers fresh for 2x longer.',
      price: 45.00,
      stock: 150,
      image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=800',
      categoryId: home.id,
    },

    // Sports
    {
      name: 'Apex Carbon Racket',
      description: 'State-of-the-art carbon fiber construction for ultimate power and precision control.',
      price: 210.00,
      stock: 15,
      image: 'https://images.unsplash.com/photo-1617083277661-0df8e597c980?auto=format&fit=crop&q=80&w=800',
      categoryId: sports.id,
    },
    {
      name: 'SwiftRun Pro Shoes',
      description: 'Featherlight marathon shoes with responsive foam and carbon plate technology.',
      price: 160.00,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
      categoryId: sports.id,
    },
    {
      name: 'Titanium Road Bike',
      description: 'Professional grade titanium frame with wireless shifting and hydraulic disc brakes.',
      price: 4500.00,
      stock: 5,
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800',
      categoryId: sports.id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
