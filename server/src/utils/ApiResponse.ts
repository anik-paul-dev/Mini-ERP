class ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: any;
  meta?: any;

  constructor(statusCode: number, message: string, data: any = null, meta?: any) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }

  static success(data: any, message: string = 'Success', statusCode: number = 200) {
    return new ApiResponse(statusCode, message, data);
  }

  static created(data: any, message: string = 'Created successfully') {
    return new ApiResponse(201, message, data);
  }

  static paginated(data: any, meta: { page: number; limit: number; total: number; totalPages: number }, message: string = 'Success') {
    return new ApiResponse(200, message, data, meta);
  }
}

export default ApiResponse;
