// utils/asyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { RequestWithUser } from "../controllers/user.controller";

// Wrap async controllers to preserve types
export const asyncHandler = (
  fn: (req: RequestWithUser, res: Response) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    return fn(req as RequestWithUser, res).catch(next);
  };
};