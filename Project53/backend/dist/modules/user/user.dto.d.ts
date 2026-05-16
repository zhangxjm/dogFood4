export declare class CreateUserDto {
    employeeId: string;
    name: string;
    email: string;
    department?: string;
    position?: string;
    isActive?: boolean;
}
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    department?: string;
    position?: string;
    isActive?: boolean;
}
