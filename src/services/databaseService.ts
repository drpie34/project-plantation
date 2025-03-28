import { supabase } from '@/integrations/supabase/client';
import { errorService } from './errorService';

/**
 * Generic database access layer for Supabase operations
 * Provides type-safe database operations with consistent error handling
 */

export type QueryOptions = {
  limit?: number;
  offset?: number;
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  select?: string;
}

type FilterOperation = 
  | 'eq' 
  | 'neq' 
  | 'gt' 
  | 'gte'
  | 'lt' 
  | 'lte' 
  | 'like' 
  | 'ilike'
  | 'is' 
  | 'in'
  | 'contains'
  | 'containedBy'
  | 'rangeGt'
  | 'rangeGte'
  | 'rangeLt'
  | 'rangeLte'
  | 'rangeAdjacent'
  | 'overlaps';

export type FilterCondition = {
  column: string;
  operation: FilterOperation;
  value: any;
}

/**
 * Database service for streamlined and standardized database access
 */
export const databaseService = {
  /**
   * Get all records from a table with flexible filtering and options
   */
  async getAll<T>(
    tableName: string, 
    filters: FilterCondition[] = [], 
    options: QueryOptions = {}
  ): Promise<{ data: T[] | null; error: any }> {
    try {
      // Start with the basic query
      let query = supabase
        .from(tableName)
        .select(options.select || '*');
      
      // Apply all filters
      filters.forEach(filter => {
        switch (filter.operation) {
          case 'eq':
            query = query.eq(filter.column, filter.value);
            break;
          case 'neq':
            query = query.neq(filter.column, filter.value);
            break;
          case 'gt':
            query = query.gt(filter.column, filter.value);
            break;
          case 'gte':
            query = query.gte(filter.column, filter.value);
            break;
          case 'lt':
            query = query.lt(filter.column, filter.value);
            break;
          case 'lte':
            query = query.lte(filter.column, filter.value);
            break;
          case 'like':
            query = query.like(filter.column, filter.value);
            break;
          case 'ilike':
            query = query.ilike(filter.column, filter.value);
            break;
          case 'is':
            query = query.is(filter.column, filter.value);
            break;
          case 'in':
            query = query.in(filter.column, filter.value);
            break;
          case 'contains':
            query = query.contains(filter.column, filter.value);
            break;
          case 'containedBy':
            query = query.containedBy(filter.column, filter.value);
            break;
          case 'overlaps':
            query = query.overlaps(filter.column, filter.value);
            break;
          // Add more cases for other operations as needed
        }
      });
      
      // Apply sorting
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? false 
        });
      }
      
      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      // Execute the query
      const { data, error } = await query;
      
      if (error) {
        errorService.handleDatabaseError(
          'databaseService', 
          `getAll:${tableName}`, 
          error,
          { filters, options }
        );
        return { data: null, error };
      }
      
      return { data: data as T[], error: null };
    } catch (error) {
      errorService.logError('databaseService', `getAll:${tableName}`, {
        message: 'Unexpected error fetching records',
        originalError: error
      });
      return { data: null, error };
    }
  },
  
  /**
   * Get a single record by ID
   */
  async getById<T>(
    tableName: string, 
    id: string, 
    select: string = '*'
  ): Promise<{ data: T | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(select)
        .eq('id', id)
        .single();
      
      if (error) {
        errorService.handleDatabaseError(
          'databaseService', 
          `getById:${tableName}`, 
          error,
          { id }
        );
        return { data: null, error };
      }
      
      return { data: data as T, error: null };
    } catch (error) {
      errorService.logError('databaseService', `getById:${tableName}`, {
        message: 'Unexpected error fetching record by ID',
        originalError: error,
        context: { id }
      });
      return { data: null, error };
    }
  },
  
  /**
   * Get a single record with flexible filtering
   */
  async getOne<T>(
    tableName: string, 
    filters: FilterCondition[] = [],
    select: string = '*'
  ): Promise<{ data: T | null; error: any }> {
    try {
      // Start with the basic query
      let query = supabase
        .from(tableName)
        .select(select);
      
      // Apply all filters
      filters.forEach(filter => {
        switch (filter.operation) {
          case 'eq':
            query = query.eq(filter.column, filter.value);
            break;
          case 'neq':
            query = query.neq(filter.column, filter.value);
            break;
          // Apply other operations as needed (same as in getAll)
        }
      });
      
      // Get a single record
      const { data, error } = await query.single();
      
      if (error) {
        errorService.handleDatabaseError(
          'databaseService', 
          `getOne:${tableName}`, 
          error,
          { filters }
        );
        return { data: null, error };
      }
      
      return { data: data as T, error: null };
    } catch (error) {
      errorService.logError('databaseService', `getOne:${tableName}`, {
        message: 'Unexpected error fetching a single record',
        originalError: error,
        context: { filters }
      });
      return { data: null, error };
    }
  },
  
  /**
   * Insert a new record
   */
  async insert<T, U = T>(
    tableName: string, 
    data: T,
    returning: string = '*'
  ): Promise<{ data: U | null; error: any }> {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select(returning)
        .single();
      
      if (error) {
        errorService.handleDatabaseError(
          'databaseService', 
          `insert:${tableName}`, 
          error,
          { data }
        );
        return { data: null, error };
      }
      
      return { data: result as U, error: null };
    } catch (error) {
      errorService.logError('databaseService', `insert:${tableName}`, {
        message: 'Unexpected error inserting record',
        originalError: error,
        context: { data }
      });
      return { data: null, error };
    }
  },
  
  /**
   * Insert multiple records
   */
  async insertMany<T, U = T>(
    tableName: string, 
    data: T[],
    returning: string = '*'
  ): Promise<{ data: U[] | null; error: any }> {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select(returning);
      
      if (error) {
        errorService.handleDatabaseError(
          'databaseService', 
          `insertMany:${tableName}`, 
          error,
          { count: data.length }
        );
        return { data: null, error };
      }
      
      return { data: result as U[], error: null };
    } catch (error) {
      errorService.logError('databaseService', `insertMany:${tableName}`, {
        message: 'Unexpected error inserting multiple records',
        originalError: error,
        context: { count: data.length }
      });
      return { data: null, error };
    }
  },
  
  /**
   * Update a record by ID
   */
  async updateById<T, U = T>(
    tableName: string, 
    id: string, 
    data: Partial<T>,
    returning: string = '*'
  ): Promise<{ data: U | null; error: any }> {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select(returning)
        .single();
      
      if (error) {
        errorService.handleDatabaseError(
          'databaseService', 
          `updateById:${tableName}`, 
          error,
          { id, data }
        );
        return { data: null, error };
      }
      
      return { data: result as U, error: null };
    } catch (error) {
      errorService.logError('databaseService', `updateById:${tableName}`, {
        message: 'Unexpected error updating record',
        originalError: error,
        context: { id, data }
      });
      return { data: null, error };
    }
  },
  
  /**
   * Update records with flexible filtering
   */
  async update<T, U = T>(
    tableName: string, 
    filters: FilterCondition[], 
    data: Partial<T>,
    returning: string = '*'
  ): Promise<{ data: U[] | null; error: any }> {
    try {
      let query = supabase
        .from(tableName)
        .update(data);
      
      // Apply all filters
      filters.forEach(filter => {
        switch (filter.operation) {
          case 'eq':
            query = query.eq(filter.column, filter.value);
            break;
          case 'neq':
            query = query.neq(filter.column, filter.value);
            break;
          // Apply other operations as needed
        }
      });
      
      const { data: result, error } = await query.select(returning);
      
      if (error) {
        errorService.handleDatabaseError(
          'databaseService', 
          `update:${tableName}`, 
          error,
          { filters, data }
        );
        return { data: null, error };
      }
      
      return { data: result as U[], error: null };
    } catch (error) {
      errorService.logError('databaseService', `update:${tableName}`, {
        message: 'Unexpected error updating records',
        originalError: error,
        context: { filters, data }
      });
      return { data: null, error };
    }
  },
  
  /**
   * Upsert records (insert or update)
   */
  async upsert<T, U = T>(
    tableName: string, 
    data: T | T[],
    onConflict?: string,
    returning: string = '*'
  ): Promise<{ data: U[] | null; error: any }> {
    try {
      let query = supabase
        .from(tableName)
        .upsert(data);
        
      if (onConflict) {
        query = query.onConflict(onConflict);
      }
      
      const { data: result, error } = await query.select(returning);
      
      if (error) {
        errorService.handleDatabaseError(
          'databaseService', 
          `upsert:${tableName}`, 
          error,
          { onConflict }
        );
        return { data: null, error };
      }
      
      return { data: result as U[], error: null };
    } catch (error) {
      errorService.logError('databaseService', `upsert:${tableName}`, {
        message: 'Unexpected error upserting records',
        originalError: error,
        context: { onConflict }
      });
      return { data: null, error };
    }
  },
  
  /**
   * Delete a record by ID
   */
  async deleteById(
    tableName: string, 
    id: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        errorService.handleDatabaseError(
          'databaseService', 
          `deleteById:${tableName}`, 
          error,
          { id }
        );
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      errorService.logError('databaseService', `deleteById:${tableName}`, {
        message: 'Unexpected error deleting record',
        originalError: error,
        context: { id }
      });
      return { success: false, error };
    }
  },
  
  /**
   * Delete records with flexible filtering
   */
  async delete(
    tableName: string, 
    filters: FilterCondition[]
  ): Promise<{ success: boolean; error: any }> {
    try {
      let query = supabase
        .from(tableName)
        .delete();
      
      // Apply all filters
      filters.forEach(filter => {
        switch (filter.operation) {
          case 'eq':
            query = query.eq(filter.column, filter.value);
            break;
          case 'neq':
            query = query.neq(filter.column, filter.value);
            break;
          // Apply other operations as needed
        }
      });
      
      const { error } = await query;
      
      if (error) {
        errorService.handleDatabaseError(
          'databaseService', 
          `delete:${tableName}`, 
          error,
          { filters }
        );
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      errorService.logError('databaseService', `delete:${tableName}`, {
        message: 'Unexpected error deleting records',
        originalError: error,
        context: { filters }
      });
      return { success: false, error };
    }
  },
  
  /**
   * Execute a raw SQL query
   * NOTE: This method should be used sparingly and carefully
   */
  async rpc<T>(
    functionName: string,
    params: Record<string, any> = {}
  ): Promise<{ data: T | null; error: any }> {
    try {
      const { data, error } = await supabase
        .rpc(functionName, params);
      
      if (error) {
        errorService.handleDatabaseError(
          'databaseService', 
          `rpc:${functionName}`, 
          error,
          { params }
        );
        return { data: null, error };
      }
      
      return { data: data as T, error: null };
    } catch (error) {
      errorService.logError('databaseService', `rpc:${functionName}`, {
        message: 'Unexpected error executing RPC function',
        originalError: error,
        context: { params }
      });
      return { data: null, error };
    }
  },
  
  /**
   * Check if a table exists
   */
  async tableExists(tableName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('id')
        .limit(1)
        .maybeSingle();
      
      return error?.code !== '42P01'; // 42P01 is the code for "relation does not exist"
    } catch (error) {
      errorService.logError('databaseService', 'tableExists', {
        message: 'Unexpected error checking if table exists',
        originalError: error,
        context: { tableName }
      });
      return false;
    }
  }
};