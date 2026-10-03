const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('--- Starting Just Born Database Seeder ---');

  // 1. Get or create categories
  const categoriesData = [
    {
      name: 'Wooden & Montessori',
      slug: 'wooden-montessori',
      description: 'Natural solid beechwood and non-toxic water-based stains designed to foster open-ended imagination and cognitive dexterity.',
      image_url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
      is_active: true
    },
    {
      name: 'Soft & Snuggle Plush',
      slug: 'soft-plush',
      description: 'Hand-stitched organic cotton and recycled poly-fill friends ready to become your little one’s lifelong comfort companion.',
      image_url: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=800&q=80',
      is_active: true
    },
    {
      name: 'Sensory & First Toys',
      slug: 'sensory-baby',
      description: 'Pediatrician-informed developmental play pieces crafted to stimulate infant touch, sight, and safe early exploration.',
      image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
      is_active: true
    },
    {
      name: 'Creative & Crafts',
      slug: 'creative-arts',
      description: 'Spark inner artists with plant-based pigments, washable formulas, and ergonomic wooden grip brushes.',
      image_url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
      is_active: true
    },
    {
      name: 'Puzzles & Brain Play',
      slug: 'puzzles-games',
      description: 'From thick chunky toddler shape fitters to intricate mechanical wooden marble runs for curious budding thinkers.',
      image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
      is_active: true
    },
    {
      name: 'Pretend & Discovery',
      slug: 'pretend-play',
      description: 'Mini chef sets, doctor pouches, and explorer kits built with durable heirloom materials for hours of storytelling.',
      image_url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=80',
      is_active: true
    }
  ];

  const { data: currentCategories } = await supabase.from('categories').select('*');
  let categoryMap = {};
  if (currentCategories && currentCategories.length > 0) {
    for (const c of currentCategories) categoryMap[c.slug] = c.id;
  } else {
    const { data: newCats, error: catErr } = await supabase.from('categories').insert(categoriesData).select();
    if (catErr) {
      console.error('Category insert error:', catErr);
      return;
    }
    for (const c of newCats) categoryMap[c.slug] = c.id;
  }
  console.log('Categories ready:', Object.keys(categoryMap).length);

  // 2. Parse mock-data.ts products
  const mockFile = fs.readFileSync(path.join(__dirname, '../src/lib/mock-data.ts'), 'utf8');
  const productsMatch = mockFile.match(/export const PRODUCTS: Product\[\] = (\[[\s\S]*?\]);\n\nexport const REVIEWS/);
  if (!productsMatch) {
    console.error('Could not parse mock-data.ts');
    return;
  }

  // Evaluate the products array
  const rawProductsStr = productsMatch[1];
  const products = eval(rawProductsStr);
  console.log(`Parsed ${products.length} products from mock data.`);

  // Check existing products in Supabase
  const { data: existingProducts } = await supabase.from('products').select('slug');
  const existingSlugs = new Set((existingProducts || []).map((p) => p.slug));

  let insertedCount = 0;
  for (const item of products) {
    if (existingSlugs.has(item.slug)) {
      continue;
    }

    const categoryId = categoryMap[item.categorySlug] || Object.values(categoryMap)[0];
    const productRecord = {
      category_id: categoryId,
      name: item.name,
      slug: item.slug,
      description: `${item.tagline}\n\n${item.description}\n\nKey Highlights:\n${item.features.map(f => '• ' + f).join('\n')}`,
      price: item.price,
      compare_at_price: item.originalPrice || null,
      sku: `JB-${item.slug.slice(0, 10).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      stock_quantity: item.stockCount || 25,
      age_group: item.ageGroup || '1-2y',
      brand: 'Just Born Heirloom',
      is_featured: !!item.isFeatured,
      is_active: true
    };

    const { data: prodData, error: prodErr } = await supabase
      .from('products')
      .insert(productRecord)
      .select()
      .single();

    if (prodErr) {
      console.error(`Error inserting product ${item.name}:`, prodErr);
      continue;
    }

    insertedCount++;

    // Insert images
    if (item.images && item.images.length > 0) {
      const imageRecords = item.images.map((imgUrl, idx) => ({
        product_id: prodData.id,
        image_url: imgUrl,
        alt_text: `${item.name} image ${idx + 1}`,
        display_order: idx + 1
      }));

      const { error: imgErr } = await supabase.from('product_images').insert(imageRecords);
      if (imgErr) {
        console.error(`Error inserting images for ${item.name}:`, imgErr);
      }
    }
  }

  console.log(`Successfully seeded ${insertedCount} new products into Supabase!`);
}

run().catch(console.error);
