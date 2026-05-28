import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Decorator lấy thông tin user hiện tại từ request (sau khi đã xác thực JWT) */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
