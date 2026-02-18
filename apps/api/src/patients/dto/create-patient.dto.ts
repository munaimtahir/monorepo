import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional } from 'class-validator';

export class CreatePatientDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsDateString()
    dob?: string;

    @IsEnum(['male', 'female', 'other'])
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    phone?: string;
}
