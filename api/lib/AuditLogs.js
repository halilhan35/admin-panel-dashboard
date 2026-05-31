const AuditlogsModel = require('../db/models/AuditLogs');
const Enum = require("../config/Enum");

let instance = null;

class AuditLogs {
    constructor() {
        if (!instance) {
            instance = this;
        }
        return instance;
    }

    info(email, location, proc_type, log) {
        this.#saveToDB(
            Enum.LOG_LEVELS.INFO,
            email,location,proc_type,log
        )
    }

    warn(email, location, proc_type, log) {
        this.#saveToDB(
            Enum.LOG_LEVELS.WARN,
            email,location,proc_type,log
        )
    }

    error(email, location, proc_type, log) {
        this.#saveToDB(
            Enum.LOG_LEVELS.ERROR,
            email,location,proc_type,log
        )
    }

    debug(email, location, proc_type, log) {
        this.#saveToDB(
            Enum.LOG_LEVELS.DEBUG,
            email,location,proc_type,log
        )
    }

    verbose(email, location, proc_type, log) {
        this.#saveToDB(
             Enum.LOG_LEVELS.VERBOSE,
            email,location,proc_type,log
        )
    }

    http(email, location, proc_type, log) {
        this.#saveToDB(
           Enum.LOG_LEVELS.HTTP,
            email,location,proc_type,log
        )
    }


    #saveToDB(level, email, location, proc_type, log) {
        AuditlogsModel.create({
            level: level,
            email: email,
            location: location,
            proc_type: proc_type,
            log: log
        }).catch(err => {
            console.error("Failed to save audit log:", err);
        });
}
}
module.exports = new AuditLogs();