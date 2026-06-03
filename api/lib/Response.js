const Enum = require("../config/Enum");
const CustomError = require("./Error"); 

class Response {
    constructor() {}

    static successResponse(data, code = 200){
        return {
            code,
            data
        }
    }

    static errorResponse(error){
        if(error instanceof CustomError) { 
            return {
               code: error.code,
               error: {
                 message: error.message,
                 description: error.description  
              } 
            }
        } else if(error.message && error.message.includes("E11000")) { // 🌟 error.message kontrolü eklendi (güvenlik için)
            return {
               code: Enum.HTTP_CODES.CONFLICT,
               error: {
                 message: "Duplicate Exists",
                 description: "Duplicate Entry Exists!" 
              } 
            }
        } else {
            
            return {
               code: Enum.HTTP_CODES ? Enum.HTTP_CODES.INTERNAL_SERVER_ERROR : 500,
               error: {
                 message: "Internal Server Error",
                 description: error.message || error
              }
            }
        }
    }
}

module.exports = Response;