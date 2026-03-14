const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const cartItems = await prisma.cartItem.findMany({
      include: {
        user: true,
        product: true
      }
    });
    console.log('--- Current Cart Items in DB ---');
    if (cartItems.length === 0) {
      console.log('No items in the cart table.');
    } else {
      cartItems.forEach(item => {
        console.log(`User: ${item.user.username} | Product: ${item.product.name} | Quantity: ${item.quantity}`);
      });
    }
  } catch (error) {
    console.error('Error fetching cart items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
