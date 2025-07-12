import express from 'express';
import {
  createdOrder,
  getMyOrders,
  getOrderById,
  marcarComoPagado,
  marcarComoEntregado,
  marcarComoEnTransito,
  getAllOrders,
  revertirPago,
  deleteOrder,
  obtenerEstadisticasPedidos,

} from '../controllers/orderController.js';

import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ⚠ El orden importa
router.get('/mine', protect, getMyOrders)
router.get('/', protect, isAdmin, getAllOrders)



router.post('/', protect, createdOrder)
router.get('/:id', protect, getOrderById)
router.get('/estadisticas', protect, isAdmin, obtenerEstadisticasPedidos);
router.put('/:id/pay', protect, isAdmin, marcarComoPagado)
router.put('/:id/deliver', protect, isAdmin, marcarComoEntregado)
router.put('/:id/transit', protect, isAdmin, marcarComoEnTransito)
router.put('/:id/revert', protect, isAdmin, revertirPago)
router.delete('/:id', protect, isAdmin, deleteOrder)


export default router;



