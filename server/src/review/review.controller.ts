import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Patch } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { Public } from '../auth/auth.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Request() req,
    @Body() body: { productId: number; rating: number; comment: string }
  ) {
    return this.reviewService.create(
      body.productId,
      req.user.userId,
      body.rating,
      body.comment
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { rating?: number; comment?: string }
  ) {
    return this.reviewService.update(
      +id,
      req.user.userId,
      body.rating,
      body.comment
    );
  }

  @Public()
  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.reviewService.findByProduct(+productId);
  }

  @Public()
  @Get('product/:productId/rating')
  getRating(@Param('productId') productId: string) {
    return this.reviewService.getAverageRating(+productId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const isAdmin = req.user.role === 'admin';
    return this.reviewService.remove(+id, req.user.userId, isAdmin);
  }
}
