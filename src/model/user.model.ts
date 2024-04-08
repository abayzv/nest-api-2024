export class RegisterUserRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
}

export class UserResponse {
    id: number;
    username: string;
    fullName?: string;
    token?: string;
}