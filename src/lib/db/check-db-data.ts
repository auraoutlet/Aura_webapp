import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { max: 1, ssl: 'require' });

async function check() {
  const cats = await sql`SELECT id, name, slug FROM categories;`;
  console.log(`Categories (${cats.length}):`, cats.map(c => c.name));

  const prods = await sql`SELECT id, name, base_price FROM products;`;
  console.log(`Products (${prods.length}):`, prods.map(p => p.name));

  const ords = await sql`SELECT id, order_number, user_id, total_amount, order_status FROM orders;`;
  console.log(`Orders (${ords.length}):`, ords);

  const profiles = await sql`SELECT id, full_name, role FROM profiles;`;
  console.log(`Profiles (${profiles.length}):`, profiles);

  const coupons = await sql`SELECT id, code, discount_value, is_active FROM coupons;`;
  console.log(`Coupons (${coupons.length}):`, coupons.map(c => c.code));

  const addrs = await sql`SELECT id, user_id, full_name, city FROM addresses;`;
  console.log(`Addresses (${addrs.length}):`, addrs);

  await sql.end();
}

check();
