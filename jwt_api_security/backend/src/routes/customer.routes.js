const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customer.controller.js');
const { 
    authenticate, 
    checkInactivity, 
    validateInput 
} = require('../middleware/auth.middleware');

// Applica middleware a tutte le route
router.use(authenticate);
router.use(checkInactivity);
router.use(validateInput);

// Routes
router.get('/', CustomerController.getCustomers);
router.get('/search', CustomerController.searchCustomers);
router.get('/statistics', CustomerController.getStatistics);
router.get('/filter-options', CustomerController.getFilterOptions);
router.get('/export', CustomerController.exportCustomers); // Manager only
router.get('/:id', CustomerController.getCustomerById);

module.exports = router;