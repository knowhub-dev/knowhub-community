<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(mixed $data = null, string $message = 'OK', array $meta = [], int $status = 200): JsonResponse
    {
        return response()->json([
            'data' => $data,
            'meta' => (object) $meta,
            'message' => $message,
        ], $status);
    }

    public static function error(string $message, int $status = 400, ?string $code = null, array $errors = []): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'errors' => (object) $errors,
            'code' => $code,
            'status' => $status,
        ], $status);
    }
}

trait ApiResponseHelpers
{
    protected function respondSuccess(mixed $data = null, string $message = 'OK', array $meta = [], int $status = 200): JsonResponse
    {
        return ApiResponse::success($data, $message, $meta, $status);
    }

    protected function respondCreated(mixed $data = null, string $message = 'Created', array $meta = []): JsonResponse
    {
        return $this->respondSuccess($data, $message, $meta, 201);
    }

    protected function respondNoContent(string $message = 'No Content'): JsonResponse
    {
        return ApiResponse::success(null, $message, [], 204);
    }

    protected function respondError(string $message, int $status = 400, ?string $code = null, array $errors = []): JsonResponse
    {
        return ApiResponse::error($message, $status, $code, $errors);
    }

    protected function respondValidationErrors(array $errors, string $message = 'The given data was invalid.'): JsonResponse
    {
        return ApiResponse::error($message, 422, 'validation_error', $errors);
    }
}
