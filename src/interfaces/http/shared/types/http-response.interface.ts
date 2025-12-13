/**
 * Interface pour les réponses HTTP standardisées
 */
export interface SuccessResponse<T = unknown> {
    success: true;
    data?: T;
    message?: string;
}

export interface ErrorResponse {
    success: false;
    message: string;
    error?: string;
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;