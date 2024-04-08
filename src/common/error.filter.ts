import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { error } from "console";
import { ZodError } from "zod";

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {

        const response = host.switchToHttp().getResponse();

        if (exception instanceof HttpException) {
            response.status(exception.getStatus()).json({
                error: exception.getResponse()
            })
        } else if (exception instanceof ZodError) {
            response.status(400).json({
                error: 'Invalid data provided'
            })
        }

    }
}