export class ResponseUtil {
  static success(message: string, data?: any) {
    return {
      statusCode: 200,
      message,
      ...data,
    };
  }

  static created(message: string, data?: any) {
    return {
      statusCode: 201,
      message,
      ...data,
    };
  }
}
