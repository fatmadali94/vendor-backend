import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req: any, res: any, next: any) => {
  const authHeader: any = req.headers.token;
  if (authHeader) {
    const token: any = authHeader.split(" ")[1];
    jwt.verify(
      token,
      process?.env?.JWT_SEC as string,
      (err: any, user: any) => {
        if (err) res.status(403).json("Token is not valid!");
        req.user = user;
        next();
      }
    );
  } else {
    return res.status(401).json("You are not authenticated!");
  }
};

export const verifyTokenAndAuthorization = (req: any, res: any, next: any) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not alowed to do that!");
    }
  });
};

export const verifyTokenAndAdmin = (req: any, res: any, next: any) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not alowed to do that!");
    }
  });
};
