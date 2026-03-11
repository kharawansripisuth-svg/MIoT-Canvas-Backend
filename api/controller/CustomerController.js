const pgService = require('../../service/services/postgres-service');
const Newid = require('../lib/Newid');

const newId = new Newid();
const db = new pgService();

class Customer {

    async getCustomer(req,res){
    try {
        await db.connect();
        const result = await db.query(
            `SELECT * FROM adm_customer ORDER BY customer_id ASC`
        );
        return res.status(200).json({
            message: 'Show all customers successfully',
            customers: result.rows
        });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }
    async getActiveCustomer(req,res){
    try {
        await db.connect();
        const result = await db.query(
            `SELECT * FROM adm_customer WHERE is_active = true ORDER BY customer_id ASC`
        );
        return res.status(200).json({
            message: 'Show all active customers successfully',
            customers: result.rows
        });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    async getInactiveCustomer(req,res){
    try {
        await db.connect();
        const result = await db.query(
            `SELECT * FROM adm_customer WHERE is_active = false ORDER BY customer_id ASC`
        );
        return res.status(200).json({
            message: 'Show all inactive customers successfully',
            customers: result.rows
        });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    async getCustomerById(req,res){
    try {
        await db.connect();
        const { customer_id } = req.params;
        const result = await db.query(
            `SELECT * FROM adm_customer WHERE customer_id = $1`,
            [customer_id]
        );
        return res.status(200).json({
            message: `Show customer ID ${customer_id} successfully`,
            customers: result.rows
        });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    async addCustomer(req,res){
        await db.connect();
        try {
            const { customer_name, customer_code} = req.body;
            if (!customer_name || !customer_code) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            const newCustomerId = await newId.genCustomerId();
            const result =  await db.query(
                `INSERT INTO adm_customer (customer_id, customer_name_en, customer_code, is_active, is_selected) 
                VALUES ($1, $2, $3, true, false) RETURNING *`,
                [newCustomerId, customer_name, customer_code]
            );
            return res.status(201).json({
                message: 'Add new customer successfully',
                customer: result.rows[0]
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
        } finally {
            await db.close?.();
        }
    }

    async editCustomer(req,res){
    await db.connect();
    try {
        const customer_id = req.params;
        if (!customer_id) {
            return res.status(400).json({ error: 'customer_id is required' });
        }

        const { customer_name, customer_code } = req.body;

        // Prepare object สำหรับ update
        const updateData = {};

        if (customer_name) updateData.customer_name = customer_name;
        if (customer_code) updateData.customer_code = customer_code;
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        // สร้าง dynamic query
        const setClauses = [];
        const values = [];
        let idx = 1;
        for (const [key, value] of Object.entries(updateData)) {
            setClauses.push(`${key} = $${idx}`);
            values.push(value);
            idx++;
        }

        // customer_id เป็น condition
        values.push(customer_id);

        const sql = `
            UPDATE adm_customer
            SET ${setClauses.join(', ')}
            WHERE customer_id = $${idx}
            RETURNING *;
        `;

        const result = await db.query(sql, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        return res.status(200).json({
            message: 'Customer updated successfully',
            customer: result.rows[0]
        });

        } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
        } finally {
        await db.close?.();
        }
    }

    async selectCustomer(req,res){
        await db.connect();
        try {
            const customer_id = req.params;
            if (!customer_id) {
                return res.status(400).json({ error: 'customer_id is required' });
            }
            const result = await db.query(
                `UPDATE adm_customer SET is_select = true WHERE customer_id = ($1) RETURNING *;`,
                [customer_id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            return res.status(200).json({
                message: 'Customer selected successfully',
                customer: result.rows[0]
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        } finally {
            await db.close?.();
        }
    }

    async unselectCustomer(req,res){
        await db.connect();
        try {
            const customer_id = req.params;
            if (!customer_id) {
                return res.status(400).json({ error: 'customer_id is required' });
            }
            const result = await db.query(
                `UPDATE adm_customer SET is_select = false WHERE customer_id = $1 RETURNING *;`,
                [customer_id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            return res.status(200).json({
                message: 'Customer unselected successfully',
                customer: result.rows[0]
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        } finally {
            await db.close?.();
        }
    }

    async setActiveCustomer(req,res){
        await db.connect();
        try {
            const {customer_id , status} = req.body;
            if (!customer_id) {
                return res.status(400).json({ error: 'customer_id is required' });
            }
            const result = await db.query(
                `UPDATE adm_customer SET is_active = $2 WHERE customer_id = $1 RETURNING *;`,
                [customer_id, status]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            return res.status(200).json({
                message: 'Customer active status updated successfully',
                customer: result.rows[0]
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        } finally {
            await db.close?.();
        }
    }
}
module.exports = new Customer();