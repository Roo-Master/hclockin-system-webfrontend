import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignDepartmentMemberDto {
  @IsNotEmpty()
  @IsUUID()
  userId!: string;
}
