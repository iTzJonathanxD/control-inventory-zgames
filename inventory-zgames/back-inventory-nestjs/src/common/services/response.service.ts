import { Injectable } from '@nestjs/common';
import { ApiResponse, ApiData } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseService {

  success<T>(message: string, data: T): ApiResponse<T> {
    return {
      success: true,
      message: {
        text: message,
        type: 'success',
      },
      data,
    };
  }

  successWithPagination<T>(
    message: string,
    result: T[],
    totalItems: number,
    itemsPerPage: number,
    currentPage: number,
  ): ApiResponse<ApiData<T[]>> {
    return {
      success: true,
      message: {
        text: message,
        type: 'success',
      },
      data: {
        result,
        meta: {
          totalItems,
          itemCount: result.length,
          itemsPerPage,
          totalPages: Math.ceil(totalItems / itemsPerPage),
          currentPage,
        },
      },
    };
  }

  error<T = null>(message: string, data: T = null as T): ApiResponse<T> {
    return {
      success: false,
      message: {
        text: message,
        type: 'error',
      },
      data,
    };
  }
}
