import { createClient } from "@supabase/supabase-js";
import {
  deleteItemAsync,
  getItem,
  getItemAsync,
  setItem,
  setItemAsync,
} from "expo-secure-store";

// Improved SecureStore adapter that handles large values by chunking
const CHUNK_SIZE = 2000; // Leave some buffer from the 2048 limit

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      // Try to get the item directly first
      const value = await getItemAsync(key);
      if (value) return value;

      // If not found, try to get chunked version
      const chunks: string[] = [];
      let chunkIndex = 0;
      let chunk = await getItemAsync(`${key}_chunk_${chunkIndex}`);
      
      while (chunk) {
        chunks.push(chunk);
        chunkIndex++;
        chunk = await getItemAsync(`${key}_chunk_${chunkIndex}`);
      }

      return chunks.length > 0 ? chunks.join('') : null;
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // If value is small enough, store it directly
      if (value.length <= CHUNK_SIZE) {
        // Clean up any existing chunks
        let chunkIndex = 0;
        while (await getItemAsync(`${key}_chunk_${chunkIndex}`)) {
          await deleteItemAsync(`${key}_chunk_${chunkIndex}`);
          chunkIndex++;
        }
        return setItemAsync(key, value);
      }

      // For large values, split into chunks
      const chunks: string[] = [];
      for (let i = 0; i < value.length; i += CHUNK_SIZE) {
        chunks.push(value.substring(i, i + CHUNK_SIZE));
      }

      // Delete the main key if it exists
      try {
        await deleteItemAsync(key);
      } catch (e) {
        // Ignore if doesn't exist
      }

      // Store each chunk
      for (let i = 0; i < chunks.length; i++) {
        await setItemAsync(`${key}_chunk_${i}`, chunks[i]);
      }

      return;
    } catch (error) {
      console.error('SecureStore setItem error:', error);
      throw error;
    }
  },
  removeItem: async (key: string) => {
    try {
      // Remove the main key
      await deleteItemAsync(key);

      // Remove all chunks
      let chunkIndex = 0;
      while (true) {
        try {
          const chunkKey = `${key}_chunk_${chunkIndex}`;
          const exists = await getItemAsync(chunkKey);
          if (!exists) break;
          await deleteItemAsync(chunkKey);
          chunkIndex++;
        } catch (e) {
          break;
        }
      }
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || "",
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

