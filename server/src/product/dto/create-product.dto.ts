import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Mouse', description: 'The name of the product' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'A high precision wireless mouse.', description: 'Product description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 25.99, description: 'The price of the product' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100, description: 'Current stock available' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ example: 1, description: 'Category ID' })
  @IsNumber()
  @IsOptional()
  categoryId?: number;
}