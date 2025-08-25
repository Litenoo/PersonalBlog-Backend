import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    transports: [
        // Console → pretty logs
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({ format: "HH:mm:ss" }),
                winston.format.printf(({ level, message, timestamp }) => {
                    return `[${timestamp}] [${level}] ${message}`;
                })
            ),
        }),

        // Info logs → JSON
        new winston.transports.File({
            filename: "logs/info.log",
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),

        // Error logs → JSON
        new winston.transports.File({
            filename: "logs/errors.log",
            level: "error",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
    ],
});


export default logger;