import { randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const BUCKET = 'listing-photos';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const PHOTO_URLS = [
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1400&q=80',
];

const USERS = [
  {
    email: 'steve@gmail.com',
    password: 'pass123',
    name: 'Steve',
    phoneNumber: '+359888000111',
    listings: [
      {
        title: 'Bakery Rescue Box',
        description: 'Микс от хляб, кроасани и сладкиши, останали в края на деня.',
        price: 5.99,
        location: 'София, Център',
      },
      {
        title: 'Fresh Veggie Pack',
        description: 'Кутия с пресни зеленчуци и салати с кратък срок.',
        price: 7.49,
        location: 'София, Лозенец',
      },
      {
        title: 'Coffee & Pastry Combo',
        description: 'Комбо пакет от кафе зърна и печива за вкъщи.',
        price: 6.25,
        location: 'София, Младост',
      },
      {
        title: 'Evening Meal Saver',
        description: 'Готови ястия и гарнитури, подходящи за вечеря.',
        price: 9.9,
        location: 'София, Студентски град',
      },
    ],
  },
  {
    email: 'maria@gmail.com',
    password: 'pass123',
    name: 'Maria',
    phoneNumber: '+359888000222',
    listings: [
      {
        title: 'Healthy Lunch Bowl',
        description: 'Здравословни обедни купи с киноа, зеленчуци и протеин.',
        price: 8.4,
        location: 'Пловдив, Капана',
      },
      {
        title: 'Family Grocery Bundle',
        description: 'Семеен пакет с плодове, млечни продукти и хлебни изделия.',
        price: 11.3,
        location: 'Пловдив, Тракия',
      },
      {
        title: 'Brunch Surprise Bag',
        description: 'Изненадваща торбичка за брънч с 2-3 артикула.',
        price: 6.8,
        location: 'Пловдив, Център',
      },
      {
        title: 'Sweet Dessert Box',
        description: 'Подбрани десерти от сладкарница за rescue покупка.',
        price: 5.7,
        location: 'Пловдив, Смирненски',
      },
    ],
  },
];

function extensionFromContentType(contentType) {
  if (!contentType) {
    return 'jpg';
  }
  if (contentType.includes('png')) {
    return 'png';
  }
  if (contentType.includes('webp')) {
    return 'webp';
  }
  return 'jpg';
}

async function ensureUser(definition) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    throw error;
  }

  const existing = data.users.find((item) => item.email?.toLowerCase() === definition.email.toLowerCase());
  if (existing) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
      password: definition.password,
      user_metadata: { name: definition.name },
      email_confirm: true,
    });
    if (updateError) {
      throw updateError;
    }
    return existing;
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: definition.email,
    password: definition.password,
    email_confirm: true,
    user_metadata: { name: definition.name },
  });

  if (createError || !created.user) {
    throw createError ?? new Error(`Failed to create user ${definition.email}`);
  }

  return created.user;
}

async function upsertProfile(user, definition) {
  const { error } = await supabase.from('user_profiles').upsert(
    {
      id: user.id,
      name: definition.name,
      email: definition.email,
      phone_number: definition.phoneNumber,
    },
    { onConflict: 'id' },
  );

  if (error) {
    throw error;
  }
}

async function cleanupUserListings(userId) {
  const { data: previousListings, error: listError } = await supabase
    .from('listings')
    .select('id')
    .eq('user_id', userId);

  if (listError) {
    throw listError;
  }

  if (!previousListings || previousListings.length === 0) {
    return;
  }

  const listingIds = previousListings.map((item) => item.id);

  const { data: photoRows, error: photoError } = await supabase
    .from('listing_photos')
    .select('storage_path')
    .in('listing_id', listingIds);

  if (photoError) {
    throw photoError;
  }

  const paths = (photoRows ?? []).map((row) => row.storage_path);
  if (paths.length > 0) {
    const { error: removeError } = await supabase.storage.from(BUCKET).remove(paths);
    if (removeError) {
      throw removeError;
    }
  }

  const { error: deleteError } = await supabase.from('listings').delete().eq('user_id', userId);
  if (deleteError) {
    throw deleteError;
  }
}

async function uploadPhotoForListing(listingId, remoteUrl) {
  const response = await fetch(remoteUrl);
  if (!response.ok) {
    throw new Error(`Could not download image: ${remoteUrl}`);
  }

  const contentType = response.headers.get('content-type') ?? 'image/jpeg';
  const ext = extensionFromContentType(contentType);
  const filePath = `${listingId}/${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await response.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, bytes, {
    contentType,
    upsert: true,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { error: photoInsertError } = await supabase.from('listing_photos').insert({
    listing_id: listingId,
    storage_path: filePath,
  });

  if (photoInsertError) {
    throw photoInsertError;
  }
}

async function createListingsForUser(userId, listings, photoOffset) {
  let photoIndex = photoOffset;

  for (let i = 0; i < listings.length; i += 1) {
    const listing = listings[i];

    const { data: created, error: createError } = await supabase
      .from('listings')
      .insert({
        user_id: userId,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
      })
      .select('id')
      .single();

    if (createError || !created) {
      throw createError ?? new Error(`Failed to create listing: ${listing.title}`);
    }

    const photosPerListing = i % 2 === 0 ? 2 : 3;
    for (let p = 0; p < photosPerListing; p += 1) {
      const url = PHOTO_URLS[photoIndex % PHOTO_URLS.length];
      await uploadPhotoForListing(created.id, url);
      photoIndex += 1;
    }

    console.log(`Created listing ${listing.title} with ${photosPerListing} photos.`);
  }
}

async function main() {
  console.log('Starting Supabase seed...');

  for (let i = 0; i < USERS.length; i += 1) {
    const userDefinition = USERS[i];
    const user = await ensureUser(userDefinition);
    await upsertProfile(user, userDefinition);
    await cleanupUserListings(user.id);
    await createListingsForUser(user.id, userDefinition.listings, i * 5);

    console.log(`Completed seed for ${userDefinition.email}`);
  }

  console.log('Seed completed successfully.');
}

main().catch((error) => {
  console.error('Seed failed:', error.message ?? error);
  process.exit(1);
});
