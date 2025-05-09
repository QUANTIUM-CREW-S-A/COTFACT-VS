import { Document } from '@/types'; 
import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from './utils';

export const getDocuments = async () => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError('getDocuments', error, 'documento');
  }
};

export const getDocumentById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError('getDocumentById', error, 'documento');
  }
};

export const createDocument = async (document: Partial<Document>) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError('createDocument', error, 'documento');
  }
};

export const updateDocument = async (id: string, document: Partial<Document>) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .update(document)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    return handleSupabaseError('updateDocument', error, 'documento');
  }
};

export const deleteDocument = async (id: string) => {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    return handleSupabaseError('deleteDocument', error, 'documento');
  }
};
