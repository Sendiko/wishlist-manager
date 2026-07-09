import { NextResponse } from 'next/server'

/**
 * Creates a standard JSON error response.
 * 
 * @param status HTTP status code
 * @param message User friendly message
 * @param error Optional detailed error object or string for logging/debugging
 */
export function createErrorResponse(status: number, message: string, error?: any) {
    const errorString = error !== undefined 
        ? (typeof error === 'object' ? JSON.stringify(error) : String(error)) 
        : message;

    return NextResponse.json({
        status,
        message,
        error: errorString
    }, { status });
}
