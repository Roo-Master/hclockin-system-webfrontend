import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsObject,
	Length,
} from 'class-validator';

export class CreateDepartmentDto{
	@IsString()
	@IsNotEmpty()
	@Length(2, 100)
	name!: string;

	@IsString()
    @IsNotEmpty()
	@Length(2, 20)
	code!: string;

	@IsOptional()
	@IsObject()
	rules?: Record<string, any>;
}
