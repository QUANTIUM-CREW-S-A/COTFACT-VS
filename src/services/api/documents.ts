
import { Document } from '@/types';
import { supabase } from '@/lib/supabase';

export const getDocuments = async () => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error en getDocuments:`, error);
    throw error;
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
    console.error(`Error en getDocumentById:`, error);
    throw error;
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
    console.error(`Error en createDocument:`, error);
    throw error;
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
    console.error(`Error en updateDocument:`, error);
    throw error;
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
    console.error(`Error en deleteDocument:`, error);
    throw error;
  }
};
