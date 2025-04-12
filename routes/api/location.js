const express = require('express');
const router = express.Router();
const locationController = require('../../modules/location/locationController');
const { authentication, authorization } = require('../../middleware/auth.middleware');

router.get('/get-state',authentication,authorization("Customer"), locationController.getAllState);
router.get('/get-district',authentication,authorization("Customer"), locationController.getAllDistict);
router.get('/get-taluka',authentication,authorization("Customer"), locationController.getAllTaluka);
router.get('/get-village',authentication,authorization("Customer"), locationController.getAllVillage);


module.exports = router