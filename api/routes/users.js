var express = require('express');
var router = express.Router();
const Users = require('../db/models/Users');
const Response = require("../lib/Response");
const UserRoles = require("../db/models/UserRoles");
const Roles = require("../db/models/Roles");
const bcrypt = require('bcryptjs');
const Enum = require("../config/Enum");
const CustomError = require("../lib/Error");
const is = require('is_js');

/* GET users listing. */
router.get('/', async(req, res) => {
  try {
    let users = await Users.find({}); 

    res.json(Response.successResponse(users));

  }catch (err){
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
  }
});


router.post('/add', async(req, res) => {
  let body = req.body;

  try {
    
    if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Email is required");

    if(is.not.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "email field must be an email format");

    if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Password is required");

    if(body.password.length < Enum.PASS_LENGTH) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Password must be at least 8 characters long"+ Enum.PASS_LENGTH);

    if(!body.roles || !Array.isArray(body.roles) || body.roles.length === 0) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "At least one role is required");

    let roles = await Roles.find({_id: {$in: body.roles}});

    if(roles.length == 0) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Invalid roles provided");


    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);


    let user = await Users.create({
      email: body.email,
      password,
      is_active : true,
      first_name : body.first_name,
      last_name : body.last_name,
      phone : body.phone_number
    });

    for(let role of roles){
      await UserRoles.create({
        role_id: role._id,
        user_id: user._id
        
      });
    }


    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({success: true},  Enum.HTTP_CODES.CREATED));

    } catch (err){
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
    }
});

   router.post("/update", async(req, res) => {
    try {
        let body = req.body;
        let updates = {};

        let userId = body.id || body._id;

        if(!userId ) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "id is required");

        if(body.password){
            if(body.password.length >= Enum.PASS_LENGTH) updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
        }else {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", `Password must be at least ${Enum.PASS_LENGTH} characters long`);
        }

        if(typeof body.is_active === 'boolean') updates.is_active = body.is_active;

        if(body.first_name) updates.first_name = body.first_name;


        if(body.last_name) updates.last_name = body.last_name;

        if(body.phone_number) updates.phone = body.phone_number; 

        // 🌟 ROL GÜNCELLEME MANTIĞI (DÜZELTİLDİ)
    if (Array.isArray(body.roles)) {
      // 1. Kullanıcının şu anki rollerini user_id ile doğru şekilde çekiyoruz
      let userRoles = await UserRoles.find({ user_id: userId });

      // 2. Silinecek ve yeni eklenecek rolleri ayrıştırıyoruz
      // userRoles.map(x => x.role_id.toString()) yapma sebebi Mongoose ObjectId tipini string'e çevirip güvenli karşılaştırmak
      let currentRoleIds = userRoles.map(x => x.role_id.toString());

      let removedRoles = userRoles.filter(x => !body.roles.includes(x.role_id.toString()));
      let newRoles = body.roles.filter(x => !currentRoleIds.includes(x.toString()));

      // 3. Silinecek roller varsa toplu siliniyor
      if (removedRoles.length > 0) {
        await UserRoles.deleteMany({ _id: { $in: removedRoles.map(x => x._id) } });
      }

      // 4. Yeni roller varsa tek tek döngüye girmeden insertMany ile tek seferde ekleniyor
      if (newRoles.length > 0) {
        let newRolesData = newRoles.map(roleId => ({
          role_id: roleId,
          user_id: userId
        }));
        await UserRoles.insertMany(newRolesData);
      }
    }
        await Users.updateOne({_id: userId}, updates);

        res.json(Response.successResponse({success: true}));

    } catch (err) {
       let errorResponse = Response.errorResponse(err);
      res.status(errorResponse.code).json(errorResponse);
    }  

   });

    router.post("/delete", async(req, res) => {
      try {
        let body = req.body;
        let userId = body.id || body._id;

        if(!userId ) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "id is required");

        await Users.deleteOne({_id: userId});

        // DÜZELTİLDİ: İlişkili rolleri userId kullanarak güvenli bir şekilde temizle
        await UserRoles.deleteMany({user_id: userId});

        res.json(Response.successResponse({success: true}));
      }catch (err) {
        let errorResponse = Response.errorResponse(err);
      res.status(errorResponse.code).json(errorResponse);
      }
    });




    router.post('/register', async(req, res) => {
  let body = req.body;

  try {
    let user = await Users.findOne({});

    if(user) {
     return res.sendStatus(Enum.HTTP_CODES.NOT_FOUND);
    }
    
    if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Email is required");

    if(is.not.email(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "email field must be an email format");

    if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Password is required");

    if(body.password.length < Enum.PASS_LENGTH) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error", "Password must be at least 8 characters long"+ Enum.PASS_LENGTH);

     
  
    let password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

    let createdUser = await Users.create({
      email: body.email,
      password,
      is_active : true,
      first_name : body.first_name,
      last_name : body.last_name,
      phone : body.phone_number
    });

    let role = await Roles.create({
      role_name: Enum.SUPER_ADMIN,
      is_active: true,
      created_by: createdUser._id
    });

    await UserRoles.create({
      role_id: role._id,
      user_id: createdUser._id
      
    });


    res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({success: true},  Enum.HTTP_CODES.CREATED));

    } catch (err){
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);
    }
});

  module.exports = router;


