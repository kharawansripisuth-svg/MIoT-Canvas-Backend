const express = require('express');
const router = express.Router();
const topic = require('../controller/TopicController');
const auth = require('../lib/authentication');


//GET METHOD//
router.get('/getTopic', auth, topic.getTopic);
router.get('/getTopicById', auth, topic.getTopicById);
router.get('/getUnselectedTopic', auth, topic.getUnselectedTopic);
router.get('/searchTopic', auth, topic.searchTopic);

router.put('/setTopicStatus', auth, topic.setTopicStatus);
module.exports = router;