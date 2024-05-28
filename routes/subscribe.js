const express = require('express');
const { createSubcribers, unsubscribe, sendMailToSubscribers, sendEmailToUser } = require('../controllers/subscribe');
 const advancedResult = require('../middleware/advancedResult');
 const { protect, authorize } = require('../middleware/auth');


const router = express.Router();

router.post('/createsubscriber', createSubcribers);
router.post('/sendmail', protect, authorize('admin', 'super admin'), sendMailToSubscribers);
router.delete('/unsubscriber', unsubscribe);
router.post('/freeacess', sendEmailToUser);


module.exports = router;