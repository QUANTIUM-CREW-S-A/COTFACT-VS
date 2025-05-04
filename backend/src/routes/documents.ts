/*
 * Rutas para operaciones CRUD sobre documentos.
 * Asocia las rutas HTTP con los controladores correspondientes.
 *
 * Rutas:
 *   GET    /         -> Listar todos los documentos
 *   GET    /:id      -> Obtener un documento por ID
 *   POST   /         -> Crear un nuevo documento
 *   PUT    /:id      -> Actualizar un documento existente
 *   DELETE /:id      -> Eliminar un documento
 */
import express from 'express';
import { getDocuments, getDocumentById, createDocument, updateDocument, deleteDocument } from '../controllers/documents';

const router = express.Router();

router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.post('/', createDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;