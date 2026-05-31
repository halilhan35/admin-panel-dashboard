const express = require('express');
const AuditLogs = require('../db/models/AuditLogs');
const Response = require("../lib/Response");
const moment = require("moment");
const router = express.Router();

router.post("/",async (req, res) => {
   try {
      let body = req.body;
      let query = {};
      let skip = body.skip;
      let limit = 500;

      if(typeof body.skip !== "numeric"){
         skip = 0;
      }
      if(typeof body.limit !== "numeric" || body.limit > 500){
         limit = 500;
      }
   
      if(body.begin_date && body.end_date){
         query.created_at = {
            $gte: moment(body.begin_date),
            $lte: moment(body.end_date)
         }
      } else {
         query.created_at = {
            $gte: moment().subtract(1, "day").startOf("day"),
            $lte: moment()
         }
      }

      let auditLogs = await AuditLogs.find(query).sort({ created_at: -1 }).limit(limit).skip(skip);

      res.json(Response.successResponse(auditLogs));
   
   } catch (err) {
      let errorResponse = Response.errorResponse(err);
      res.status(errorResponse.code).json(errorResponse);
   } 
   
});

module.exports = router;