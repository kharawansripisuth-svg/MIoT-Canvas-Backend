const pgService = require('../../service/services/postgres-service');
const Topic = require('../../api/models/PostgreSQL/Topic');

const top = new Topic();
const db = new pgService();

class TopicController {

    // ** Get Topic ** //
    async getTopic(req,res){
        await db.connect();
        try {
            const result =  await top.getTopic();
            return res.status(201).json({
                message: 'Show all topics successfully',
                topic: result
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    async getTopicById(req,res){
        await db.connect();
        try {
            const { topic_id,topic_name } = req.query;
            if (!topic_id && !topic_name) {
                return res.status(400).json({ error: 'Topic ID or Topic Name is required' });
            }
            const topicResult =  await top.getTopicById(topic_id,topic_name);
            if (topicResult.rows === 0){
                return res.status(400).json({error:'Topic Not Found'})
            } 
            return res.status(201).json({
                message:'Show Topic by ID Successfully',
                topic:topicResult
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    async getUnselectedTopic(req,res){
        await db.connect();
        try {
            const result = await top.getUnselectedTopic();
            return res.status(201).json({
                message: 'Show unselected topics successfully',
                topics: result
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    async searchTopic(req, res) {
        await db.connect();
        try {
            const { topic_name,device_name,device_label,customer_code } = req.query;
            if (!topic_name && !device_name && !device_label && !customer_code) {
                return res.status(400).json({ error: 'Need one or more parameters' });
            }
            const searchResult = await top.searchTopic(topic_name,device_name,device_label,customer_code);
            if (searchResult.rows === 0) {
                return res.status(200).json({ error: 'No topics found' });
            }
            return res.status(201).json({
                message: 'Search topics successfully',
                topics: searchResult
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    async setTopicStatus(req, res) {
        await db.connect();
        try {
            const { topic_id,topic_name } = req.query;
            if (!topic_id && !topic_name) {
                return res.status(400).json({ error: 'Topic ID or Topic Name is required' });
            }
            const { status } = req.body;
            const setActiveResult = await top.setTopicStatus(status, topic_id,topic_name);
            if (setActiveResult.rows === 0) {
                return res.status(404).json({ error: 'Topic not found' });
            }
            const result = await top.getTopicResult(topic_id,topic_name);
            return res.status(201).json({
                message: 'Topic status updated successfully',
                topic: result
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    async editTopic(req, res) {
        await db.connect();
        try {

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }
}

module.exports = new TopicController();