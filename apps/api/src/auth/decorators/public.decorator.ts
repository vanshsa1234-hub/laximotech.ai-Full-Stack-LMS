import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
// Use on any route that should skip JWT auth
// e.g. @Public() on GET /courses (public catalog)
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
