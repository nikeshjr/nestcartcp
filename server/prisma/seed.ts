import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { username: 'killua' },
    update: {},
    create: {
      username: 'killua',
      email: 'admin@nestcart.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  // Create User
  const user = await prisma.user.upsert({
    where: { username: 'nikesh' },
    update: {},
    create: {
      username: 'nikesh',
      email: 'user@nestcart.com',
      password: hashedPassword,
      role: 'user',
    },
  });

  // Create Categories
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' },
  });

  const clothing = await prisma.category.upsert({
    where: { name: 'Clothing' },
    update: {},
    create: { name: 'Clothing' },
  });

  const accessory = await prisma.category.upsert({
    where: { name: 'Accessories' },
    update: {},
    create: { name: 'Accessories' },
  });

  // Create Products
  const products = [
    {
      name: 'Ultra Wireless Headphones',
      description: 'Premium noise-cancelling headphones with 40h battery life.',
      price: 299.99,
      stock: 50,
      categoryId: electronics.id,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    },
    {
      name: 'Smart Watch Series 9',
      description: 'The ultimate fitness companion with always-on retina display.',
      price: 399.00,
      stock: 30,
      categoryId: electronics.id,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    },
    {
      name: 'Cotton Blend T-Shirt',
      description: 'Comfortable everyday wear made from premium organic cotton.',
      price: 25.00,
      stock: 100,
      categoryId: clothing.id,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
    },
    {
      name: 'Slim Fit Denim Jeans',
      description: 'Classic slim fit denim with a touch of stretch for comfort.',
      price: 59.90,
      stock: 75,
      categoryId: clothing.id,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
    },
    {
      name: 'Leather Weekend Bag',
      description: 'Handcrafted genuine leather bag perfect for short trips.',
      price: 185.00,
      stock: 15,
      categoryId: accessory.id,
      image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80',
    }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
