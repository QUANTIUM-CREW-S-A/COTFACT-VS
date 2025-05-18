/**
 * Controlador de documentos.
 * Contiene la lógica para operaciones CRUD sobre documentos (facturas, cotizaciones, etc.).
 * Incluye manejo de clientes, items, términos y condiciones, y métodos de pago asociados a cada documento.
 *
 * Funciones exportadas:
 *   - getDocuments: Lista todos los documentos con sus detalles.
 *   - getDocumentById: Obtiene un documento específico por ID.
 *   - createDocument: Crea un nuevo documento y sus relaciones.
 *   - updateDocument: Actualiza un documento existente y sus relaciones.
 *   - deleteDocument: Elimina un documento y sus relaciones asociadas.
 */
import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const result = await db.query('SELECT * FROM documents ORDER BY created_at DESC');
    
    // Para cada documento, obtener sus items, términos y métodos de pago
    const documents = [];
    
    for (const doc of result.rows) {
      // Obtener cliente
      const customerResult = await db.query('SELECT * FROM customers WHERE id = $1', [doc.customer_id]);
      const customer = customerResult.rows[0];
      
      // Obtener items
      const itemsResult = await db.query('SELECT * FROM line_items WHERE document_id = $1', [doc.id]);
      const items = itemsResult.rows;
      
      // Obtener términos y condiciones
      const termsResult = await db.query('SELECT * FROM document_terms WHERE document_id = $1 ORDER BY display_order', [doc.id]);
      const terms = termsResult.rows.map(term => term.term_text);
      
      // Obtener métodos de pago
      const paymentMethodsResult = await db.query(`
        SELECT pm.* FROM payment_methods pm
        JOIN document_payment_methods dpm ON pm.id = dpm.payment_method_id
        WHERE dpm.document_id = $1
      `, [doc.id]);
      const paymentMethods = paymentMethodsResult.rows;
      
      // Construir documento completo
      documents.push({
        id: doc.id,
        documentNumber: doc.document_number,
        date: doc.date,
        customer,
        items,
        subtotal: parseFloat(doc.subtotal),
        tax: parseFloat(doc.tax),
        total: parseFloat(doc.total),
        status: doc.status,
        type: doc.type,
        validDays: doc.valid_days,
        termsAndConditions: terms,
        paymentMethods
      });
    }
    
    res.json(documents);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Obtener el documento principal
    const documentResult = await db.query('SELECT * FROM documents WHERE id = $1', [id]);
    
    if (documentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const doc = documentResult.rows[0];
    
    // Obtener cliente
    const customerResult = await db.query('SELECT * FROM customers WHERE id = $1', [doc.customer_id]);
    const customer = customerResult.rows[0];
    
    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado para este documento' });
    }
    
    // Obtener items
    const itemsResult = await db.query('SELECT * FROM line_items WHERE document_id = $1', [id]);
    const items = itemsResult.rows.map(item => ({
      id: item.id,
      description: item.description,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.unit_price),
      total: parseFloat(item.total)
    }));
    
    // Obtener términos y condiciones
    const termsResult = await db.query('SELECT * FROM document_terms WHERE document_id = $1 ORDER BY display_order', [id]);
    const terms = termsResult.rows.map(term => term.term_text);
    
    // Obtener métodos de pago
    const paymentMethodsResult = await db.query(`
      SELECT pm.* FROM payment_methods pm
      JOIN document_payment_methods dpm ON pm.id = dpm.payment_method_id
      WHERE dpm.document_id = $1
    `, [id]);
    
    const paymentMethods = paymentMethodsResult.rows.map(method => ({
      id: method.id,
      bank: method.bank,
      accountHolder: method.account_holder,
      accountNumber: method.account_number,
      accountType: method.account_type,
      isYappy: method.is_yappy,
      yappyLogo: method.yappy_logo,
      yappyPhone: method.yappy_phone
    }));
    
    // Construir documento completo
    const document = {
      id: doc.id,
      documentNumber: doc.document_number,
      date: doc.date,
      customer,
      items,
      subtotal: parseFloat(doc.subtotal),
      tax: parseFloat(doc.tax),
      total: parseFloat(doc.total),
      status: doc.status,
      type: doc.type,
      validDays: doc.valid_days,
      termsAndConditions: terms,
      paymentMethods
    };
    
    res.json(document);
  } catch (error) {
    console.error('Error al obtener documento por ID:', error);
    res.status(500).json({ error: 'Error al obtener documento por ID' });
  }
};

export const createDocument = async (req: any, res: any) => {
  // Usar transacción para garantizar consistencia de datos
  const client = await db.client.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      documentNumber,
      date,
      customer,
      items,
      subtotal,
      tax,
      total,
      status,
      type,
      validDays,
      termsAndConditions,
      paymentMethods
    } = req.body;
    
    // Verificar si el cliente existe o crear uno nuevo
    let customerId = customer.id;
    
    if (!customerId) {
      // Crear nuevo cliente
      const newCustomerResult = await client.query(`
        INSERT INTO customers (name, company, location, phone, email, type, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id
      `, [
        customer.name,
        customer.company || 'N/A',
        customer.location || 'N/A',
        customer.phone || 'N/A',
        customer.email || null,
        customer.type || 'person'
      ]);
      
      customerId = newCustomerResult.rows[0].id;
    }
    
    // Crear documento
    const documentId = uuidv4();
    
    await client.query(`
      INSERT INTO documents (
        id, document_number, date, customer_id, subtotal,
        tax, total, status, type, valid_days, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    `, [
      documentId,
      documentNumber,
      date,
      customerId,
      subtotal,
      tax,
      total,
      status,
      type,
      validDays
    ]);
    
    // Insertar items
    for (const item of items) {
      await client.query(`
        INSERT INTO line_items (id, document_id, description, quantity, unit_price, total, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `, [
        item.id || uuidv4(),
        documentId,
        item.description,
        item.quantity,
        item.unitPrice,
        item.total
      ]);
    }
    
    // Insertar términos y condiciones
    if (termsAndConditions && termsAndConditions.length > 0) {
      for (let i = 0; i < termsAndConditions.length; i++) {
        await client.query(`
          INSERT INTO document_terms (document_id, term_text, display_order, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
        `, [
          documentId,
          termsAndConditions[i],
          i + 1
        ]);
      }
    }
    
    // Insertar asociaciones con métodos de pago
    if (paymentMethods && paymentMethods.length > 0) {
      for (const method of paymentMethods) {
        let paymentMethodId = method.id;
        
        if (!paymentMethodId) {
          // Crear nuevo método de pago
          const newMethodResult = await client.query(`
            INSERT INTO payment_methods (
              bank, account_holder, account_number, account_type, 
              is_yappy, yappy_logo, yappy_phone, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING id
          `, [
            method.bank,
            method.accountHolder,
            method.accountNumber,
            method.accountType,
            method.isYappy || false,
            method.yappyLogo || null,
            method.yappyPhone || null
          ]);
          
          paymentMethodId = newMethodResult.rows[0].id;
        }
        
        // Asociar método de pago con el documento
        await client.query(`
          INSERT INTO document_payment_methods (document_id, payment_method_id)
          VALUES ($1, $2)
        `, [
          documentId,
          paymentMethodId
        ]);
      }
    }
    
    await client.query('COMMIT');
    
    // Devolver el documento recién creado
    const createdDocument = await getDocumentById({ params: { id: documentId } }, { json: (doc: any) => doc, status: () => ({ json: (error: any) => error }) });
    
    res.status(201).json(createdDocument);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear documento:', error);
    res.status(500).json({ error: 'Error al crear documento' });
  } finally {
    client.release();
  }
};

export const updateDocument = async (req: any, res: any) => {
  const client = await db.client.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const {
      documentNumber,
      date,
      customer,
      items,
      subtotal,
      tax,
      total,
      status,
      type,
      validDays,
      termsAndConditions,
      paymentMethods
    } = req.body;
    
    // Verificar si el documento existe
    const documentResult = await client.query('SELECT * FROM documents WHERE id = $1', [id]);
    
    if (documentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    // Actualizar información del cliente si es necesario
    let customerId = customer.id;
    
    if (!customerId) {
      // Crear nuevo cliente
      const newCustomerResult = await client.query(`
        INSERT INTO customers (name, company, location, phone, email, type, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id
      `, [
        customer.name,
        customer.company || 'N/A',
        customer.location || 'N/A',
        customer.phone || 'N/A',
        customer.email || null,
        customer.type || 'person'
      ]);
      
      customerId = newCustomerResult.rows[0].id;
    } else if (customer.updated) {
      // Actualizar cliente existente
      await client.query(`
        UPDATE customers 
        SET name = $1, company = $2, location = $3, phone = $4, email = $5, type = $6, updated_at = NOW()
        WHERE id = $7
      `, [
        customer.name,
        customer.company || 'N/A',
        customer.location || 'N/A',
        customer.phone || 'N/A',
        customer.email || null,
        customer.type || 'person',
        customerId
      ]);
    }
    
    // Actualizar documento
    await client.query(`
      UPDATE documents 
      SET document_number = $1, date = $2, customer_id = $3, subtotal = $4,
          tax = $5, total = $6, status = $7, type = $8, valid_days = $9, updated_at = NOW()
      WHERE id = $10
    `, [
      documentNumber,
      date,
      customerId,
      subtotal,
      tax,
      total,
      status,
      type,
      validDays,
      id
    ]);
    
    // Eliminar items existentes y reemplazarlos
    await client.query('DELETE FROM line_items WHERE document_id = $1', [id]);
    
    for (const item of items) {
      await client.query(`
        INSERT INTO line_items (id, document_id, description, quantity, unit_price, total, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `, [
        item.id || uuidv4(),
        id,
        item.description,
        item.quantity,
        item.unitPrice,
        item.total
      ]);
    }
    
    // Actualizar términos y condiciones
    await client.query('DELETE FROM document_terms WHERE document_id = $1', [id]);
    
    if (termsAndConditions && termsAndConditions.length > 0) {
      for (let i = 0; i < termsAndConditions.length; i++) {
        await client.query(`
          INSERT INTO document_terms (document_id, term_text, display_order, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
        `, [
          id,
          termsAndConditions[i],
          i + 1
        ]);
      }
    }
    
    // Actualizar métodos de pago
    await client.query('DELETE FROM document_payment_methods WHERE document_id = $1', [id]);
    
    if (paymentMethods && paymentMethods.length > 0) {
      for (const method of paymentMethods) {
        let paymentMethodId = method.id;
        
        if (!paymentMethodId) {
          // Crear nuevo método de pago
          const newMethodResult = await client.query(`
            INSERT INTO payment_methods (
              bank, account_holder, account_number, account_type, 
              is_yappy, yappy_logo, yappy_phone, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING id
          `, [
            method.bank,
            method.accountHolder,
            method.accountNumber,
            method.accountType,
            method.isYappy || false,
            method.yappyLogo || null,
            method.yappyPhone || null
          ]);
          
          paymentMethodId = newMethodResult.rows[0].id;
        }
        
        // Asociar método de pago con el documento
        await client.query(`
          INSERT INTO document_payment_methods (document_id, payment_method_id)
          VALUES ($1, $2)
        `, [
          id,
          paymentMethodId
        ]);
      }
    }
    
    await client.query('COMMIT');
    
    // Devolver el documento actualizado
    const updatedDocument = await getDocumentById({ params: { id } }, { json: (doc: any) => doc, status: () => ({ json: (error: any) => error }) });
    
    res.json(updatedDocument);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar documento:', error);
    res.status(500).json({ error: 'Error al actualizar documento' });
  } finally {
    client.release();
  }
};

export const deleteDocument = async (req: any, res: any) => {
  const client = await db.client.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // Verificar si el documento existe
    const documentResult = await client.query('SELECT * FROM documents WHERE id = $1', [id]);
    
    if (documentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    // Eliminar asociaciones primero debido a las restricciones de clave foránea
    await client.query('DELETE FROM line_items WHERE document_id = $1', [id]);
    await client.query('DELETE FROM document_terms WHERE document_id = $1', [id]);
    await client.query('DELETE FROM document_payment_methods WHERE document_id = $1', [id]);
    
    // Finalmente eliminar el documento
    await client.query('DELETE FROM documents WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    
    res.json({ message: 'Documento eliminado con éxito' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ error: 'Error al eliminar documento' });
  } finally {
    client.release();
  }
};