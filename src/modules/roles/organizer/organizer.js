const { authenticateJWT } = require('../../middleware/middleware.js');
const { filter } = require('../../services/filter.js');
const { notification, chooseStatus } = require('../../services/notification.js');
const router = require('express').Router();

router.get('/filter',filter);
router.get('/notification',authenticateJWT,notification);
router.get('/chooseStatus',authenticateJWT,chooseStatus);
module.exports = router;


