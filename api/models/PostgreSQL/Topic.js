const pgService = require('../../../service/services/postgres-service');
const db = new pgService();

class Topic {

    async getDeviceTopic(topic_name) {
        await db.connect();
        try {
            const result = await db.query(
                `SELECT * FROM fn_adm_topic_getbyname($1)`,
                [topic_name]
            );
            return result.rows[0];
        } finally {
            await db.close?.();
        }
    }

    async getTopic(){
        await db.connect();

        try {
            const result = await db.query(
                `SELECT * FROM fn_adm_topic_getall()`
            );
            return result.rows;
        } finally {
            await db.close?.();
        }
    }

    async getTopicById(topic_id,topic_name){
        await db.connect();

        try {
            const result = await db.query(
                `SELECT * FROM fn_adm_topic_getbyid($1,$2)`,
                [topic_id,topic_name]
            );
            return result.rows;
        } finally {
            await db.close?.();
        }
    }

    async getTopicResult(topic_id,topic_name){
        await db.connect();

        try {
            const result = await db.query(
                `SELECT * FROM fn_adm_topic_getbyid2($1,$2)`,
                [topic_id,topic_name]
            );
            return result.rows;
        } finally {
            await db.close?.();
        }
    }

    async searchTopic(topic_name,device_name,device_label,customer_code){
        await db.connect();

        try {
            const result = await db.query(
                `SELECT * FROM fn_adm_topic_search($1,$2,$3,$4)`,
                [topic_name,device_name,device_label,customer_code]
            );
            return result.rows;
        } finally {
            await db.close?.();
        }
    }

    async setTopicStatus(status, topic_id, topic_name) {
        await db.connect();

        try {
            const result = await db.query(
                `CALL sp_adm_topic_setactive($1,$2,$3)`,
                [status, topic_id, topic_name]
            );
            return result;
        } finally {
            await db.close?.();
        }
    }

    async getUnselectedTopic(){
        await db.connect();

        try {
            const result = await db.query(
                `SELECT * FROM fn_adm_topic_getunselected()`
            );
            return result.rows;
        } finally {            
            await db.close?.();
        }
    }
}

module.exports = Topic;