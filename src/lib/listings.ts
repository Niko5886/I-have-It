import { supabase } from './supabase';
import type { Listing, ListingWithPhotos, ListingWithUser } from '../types/listing';

/**
 * Вземи всички публични listings със снимки
 */
export async function getListings(
  page: number = 1,
  pageSize: number = 6
): Promise<{ listings: ListingWithPhotos[]; total: number }> {
  try {
    // Получи общия брой
    const { count } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true });

    // Вземи пагирани listings със снимки
    const { data, error } = await supabase
      .from('listings')
      .select('*, listing_photos(*)')
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;

    return {
      listings: (data || []) as ListingWithPhotos[],
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
}

/**
 * Вземи последните N listings за HomePage
 */
export async function getLatestListings(limit: number = 6): Promise<ListingWithPhotos[]> {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*, listing_photos(*)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []) as ListingWithPhotos[];
  } catch (error) {
    console.error('Error fetching latest listings:', error);
    throw error;
  }
}

/**
 * Вземи единично listing със всички детайли и потребител
 */
export async function getListingById(id: string): Promise<ListingWithUser | null> {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*, user_profiles(*), listing_photos(*)')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return (data || null) as ListingWithUser | null;
  } catch (error) {
    console.error('Error fetching listing:', error);
    throw error;
  }
}

/**
 * Вземи listings на текущия потребител
 */
export async function getUserListings(): Promise<ListingWithPhotos[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('listings')
      .select('*, listing_photos(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []) as ListingWithPhotos[];
  } catch (error) {
    console.error('Error fetching user listings:', error);
    throw error;
  }
}

/**
 * Търсене в listings (по title, description, location)
 */
export async function searchListings(query: string): Promise<ListingWithPhotos[]> {
  try {
    const q = query.toLowerCase().trim();

    if (!q) {
      return [];
    }

    const { data, error } = await supabase
      .from('listings')
      .select('*, listing_photos(*)')
      .or(
        `title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`
      )
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []) as ListingWithPhotos[];
  } catch (error) {
    console.error('Error searching listings:', error);
    throw error;
  }
}

/**
 * Създай нов listing
 */
export async function createListing(input: {
  title: string;
  description?: string;
  price: number;
  location: string;
}): Promise<Listing> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('listings')
      .insert([
        {
          user_id: user.id,
          title: input.title,
          description: input.description || null,
          price: input.price,
          location: input.location,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as Listing;
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
}

/**
 * Актуализирай listing
 */
export async function updateListing(
  id: string,
  input: {
    title?: string;
    description?: string;
    price?: number;
    location?: string;
  }
): Promise<Listing> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('listings')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return data as Listing;
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
}

/**
 * Изтрий listing (само собственик)
 */
export async function deleteListing(id: string): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
}

/**
 * Генерирай публичен URL за снимка от storage bucket
 */
export function getListingPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage.from('listing-photos').getPublicUrl(storagePath);
  return data.publicUrl;
}
