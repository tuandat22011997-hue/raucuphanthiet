import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** 
 * Guard này tương tự JwtAuthGuard nhưng không bắt buộc phải có token.
 * Nếu có token hợp lệ, req.user sẽ có dữ liệu.
 * Nếu không có token, req.user sẽ là false/undefined mà không bị văng lỗi 401.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // Bỏ qua lỗi, chỉ trả về user (nếu có)
    return user || null;
  }
}
