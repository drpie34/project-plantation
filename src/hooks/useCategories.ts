
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { IdeaCategory } from '@/types/supabase';

export const useCategories = () => {
  const [categories, setCategories] = useState<IdeaCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('idea_categories')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      setCategories(data as IdeaCategory[] || []);
      return data as IdeaCategory[] || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  return {
    categories,
    isLoading,
    fetchCategories
  };
};
